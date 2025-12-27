import os
import uvicorn
import requests
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware  # <--- NEW IMPORT
from dotenv import load_dotenv
from tenacity import retry, stop_after_attempt, wait_random_exponential, retry_if_exception_type

# LangChain / Groq Imports
from langchain_groq import ChatGroq
from app.agent import get_planning_agent 
from app.schemas import TravelItinerary, UserProfile
from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.prompts import PromptTemplate

load_dotenv()

app = FastAPI(
    title="AI Travel Agent API (Groq Llama 3)",
    description="Generates travel itineraries using LangChain and Groq Llama 3.",
    version="5.0"
)

# --- 🚨 CRITICAL FIX: CORS MIDDLEWARE ---
# This allows your React Frontend (http://localhost:5173) to talk to this Backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (change to ["http://localhost:5173"] for production)
    allow_credentials=True,
    allow_methods=["*"],  # Allows GET, POST, OPTIONS, etc.
    allow_headers=["*"],
)
# ----------------------------------------

# Retry Logic
@retry(
    retry=retry_if_exception_type(Exception),
    wait=wait_random_exponential(multiplier=1, max=60),
    stop=stop_after_attempt(5)
)
def run_agent_safe(agent, user_input_str):
    return agent.invoke({"input": user_input_str})

@retry(
    retry=retry_if_exception_type(Exception),
    wait=wait_random_exponential(multiplier=1, max=60),
    stop=stop_after_attempt(5)
)
def run_chain_safe(chain, inputs):
    return chain.invoke(inputs)


def convert_text_to_json(text_plan: str, parser: PydanticOutputParser) -> TravelItinerary:
    """Step 2: Takes the text plan and formats it into strict JSON."""
    llm = ChatGroq(
        model="llama-3.3-70b-versatile",
        temperature=0,
        api_key=os.getenv("GROQ_API_KEY")
    )
    
    format_prompt = PromptTemplate(
        template="""
        You are a Data Formatter. 
        Convert the following travel itinerary text into strict JSON matching the schema.
        
        SOURCE TEXT:
        {text_plan}
        
        FORMAT INSTRUCTIONS:
        {format_instructions}
        
        Output ONLY the valid JSON object.
        """,
        input_variables=["text_plan"],
        partial_variables={"format_instructions": parser.get_format_instructions()}
    )
    
    chain = format_prompt | llm | parser
    return run_chain_safe(chain, {"text_plan": text_plan})


def generate_trip_logic(user: UserProfile) -> TravelItinerary:
    print(f"Server: Received request for {user.duration_days} days in {user.destination}...")
    
    try:
        # Step 1: Run Agent
        agent = get_planning_agent()
        
        user_request = f"""
        Plan a {user.duration_days} day trip to {user.destination}.
        Budget: {user.budget_tier}.
        Pacing: {user.pacing}.
        Interests: {", ".join(user.interests)}.
        Group Size: {user.group_size}.
        """
        
        print("Server: Step 1 - Llama 3 is planning...")
        response = run_agent_safe(agent, user_request)
        
        # Extract output
        text_plan = response["output"]
        print(f"Server: Plan generated! ({len(text_plan)} chars)")
        
        # Step 2: Convert to JSON
        print("Server: Step 2 - converting to JSON...")
        parser = PydanticOutputParser(pydantic_object=TravelItinerary)
        itinerary = convert_text_to_json(text_plan, parser)
        
        # Save Log
        filename = "database/latest_trip.json"
        os.makedirs(os.path.dirname(filename), exist_ok=True)
        with open(filename, "w", encoding='utf-8') as f:
            try:
                f.write(itinerary.model_dump_json(indent=4))
            except AttributeError:
                f.write(itinerary.json(indent=4))
            
        return itinerary

    except Exception as e:
        print(f"Pipeline Error: {e}")
        import traceback
        traceback.print_exc()
        raise e

@app.get("/")
def health_check():
    return {"status": "running", "tech_stack": "LangChain + Groq (Llama 3) + FastAPI"}

@app.post("/plan_trip", response_model=TravelItinerary)
def plan_trip(profile: UserProfile):
    try:
        result = generate_trip_logic(profile)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- IMAGE PROXY ---
image_cache = {}

@app.get("/api/image")
def get_image_proxy(query: str):
    """
    Proxy endpoint to hide API Keys from the Frontend.
    """
    # 1. Check Cache
    if query in image_cache:
        print(f"Server: Serving cached image for '{query}'")
        return {"url": image_cache[query]}

    # 2. Setup Google Request
    api_key = os.getenv("GOOGLE_API_KEY")
    cx_id = os.getenv("GOOGLE_CX_ID")
    
    if not api_key or not cx_id:
        return {"url": "https://via.placeholder.com/800x600?text=No+API+Key"}

    try:
        url = "https://www.googleapis.com/customsearch/v1"
        params = {
            "q": query,
            "cx": cx_id,
            "key": api_key,
            "searchType": "image",
            "num": 1,
            "safe": "active"
        }
        
        # 3. Call Google
        response = requests.get(url, params=params)
        data = response.json()
        
        # 4. Extract & Cache URL
        if "items" in data and len(data["items"]) > 0:
            image_url = data["items"][0]["link"]
            image_cache[query] = image_url 
            return {"url": image_url}
            
    except Exception as e:
        print(f"Image Search Error: {e}")

    # Fallback Image
    return {"url": "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1000&auto=format&fit=crop"}

if __name__ == "__main__":
    print("🚀 Starting Server on http://127.0.0.1:8000")
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)