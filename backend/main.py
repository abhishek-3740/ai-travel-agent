import os
import uvicorn
import requests
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import concurrent.futures
from tenacity import retry, stop_after_attempt, wait_random_exponential, retry_if_exception_type

# LangChain / Groq Imports
from langchain_groq import ChatGroq
from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.prompts import PromptTemplate

# NEW: Supabase Imports
from supabase import create_client, Client

# Import your agent and schemas
from app.agent import get_planning_agent 
from app.schemas import TravelItinerary, UserProfile

load_dotenv()

app = FastAPI(
    title="AI Travel Agent API (Supabase Edition)",
    description="Generates travel itineraries and saves them to Supabase DB.",
    version="6.0"
)

# --- CORS MIDDLEWARE ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],
)

# --- SUPABASE CONNECTION (NEW) ---
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Simple check to ensure secrets are loaded
if not SUPABASE_URL or not SUPABASE_KEY:
    print("⚠️ WARNING: SUPABASE_URL or SUPABASE_KEY not found in environment!")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- GLOBAL CACHE & HELPERS ---
image_cache = {}

def validate_image_url(url: str) -> bool:
    """Checks if the image URL is accessible and is an image."""
    try:
        headers = {"User-Agent": "Mozilla/5.0"}
        response = requests.head(url, headers=headers, timeout=3)
        return response.status_code == 200 and response.headers.get("content-type", "").startswith("image/")
    except:
        return False

def fetch_verified_image(query: str):
    """Fetches a valid image URL from Google Custom Search."""
    if query in image_cache:
        return image_cache[query]

    api_key = os.getenv("GOOGLE_API_KEY")
    cx_id = os.getenv("GOOGLE_CX_ID")
    if not api_key or not cx_id:
        return None
    try:
        url = "https://www.googleapis.com/customsearch/v1"
        params = {"q": query, "cx": cx_id, "key": api_key, "searchType": "image", "num": 1, "safe": "active"}
        response = requests.get(url, params=params)
        data = response.json()

        if "items" in data and len(data["items"]) > 0:
            img_url = data["items"][0]["link"]
            if validate_image_url(img_url):
                image_cache[query] = img_url
                return img_url
    except Exception as e:
        print(f"Image fetch error for {query}: {e}")
    return None

# Retry Logic
@retry(retry=retry_if_exception_type(Exception), wait=wait_random_exponential(multiplier=1, max=60), stop=stop_after_attempt(5))
def run_agent_safe(agent, user_input_str):
    return agent.invoke({"input": user_input_str})

@retry(retry=retry_if_exception_type(Exception), wait=wait_random_exponential(multiplier=1, max=60), stop=stop_after_attempt(5))
def run_chain_safe(chain, inputs):
    return chain.invoke(inputs)

def convert_text_to_json(text_plan: str, parser: PydanticOutputParser) -> TravelItinerary:
    llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0, api_key=os.getenv("GROQ_API_KEY"))
    format_prompt = PromptTemplate(
        template="""You are a Data Formatter. Convert the text to JSON.
        SOURCE: {text_plan}
        FORMAT: {format_instructions}
        Output ONLY valid JSON.""",
        input_variables=["text_plan"],
        partial_variables={"format_instructions": parser.get_format_instructions()}
    )
    chain = format_prompt | llm | parser
    return run_chain_safe(chain, {"text_plan": text_plan})

# --- UPDATED GENERATION LOGIC ---
def generate_trip_logic(user: UserProfile) -> TravelItinerary:
    print(f"Server: Request for {user.duration_days} days in {user.destination}. User: {user.user_email}")
    
    try:
        # Step 1: Run Agent
        agent = get_planning_agent()
        user_request = f"""
        Plan a {user.duration_days} day trip to {user.destination}.
        Budget: {user.budget_tier}. Pacing: {user.pacing}.
        Interests: {", ".join(user.interests)}. Group Size: {user.group_size}.
        IMPORTANT: Provide 7-8 distinct places per day.
        """
        
        print("Server: Step 1 - Llama 3 is planning...")
        response = run_agent_safe(agent, user_request)
        text_plan = response["output"]
        
        # Step 2: Convert to JSON
        print("Server: Step 2 - converting to JSON...")
        parser = PydanticOutputParser(pydantic_object=TravelItinerary)
        itinerary = convert_text_to_json(text_plan, parser)
        
        # Step 3: Image Validation
        print("Server: Step 3 - Validating images...")
        itinerary_data = itinerary.model_dump()
        
        def process_place(place):
            place_name = place.get("place_name") or place.get("name") or place.get("activity")
            if not place_name: return None
            img_url = fetch_verified_image(place_name)
            if img_url:
                place["image_url"] = img_url
                return place
            return None # Discard if no image
            
        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            for day in itinerary_data.get("days", []):
                activity_key = "activities" if "activities" in day else "places"
                if activity_key in day:
                    results = list(executor.map(process_place, day[activity_key]))
                    day[activity_key] = [r for r in results if r is not None][:7]
        
        # --- NEW: SAVE TO SUPABASE ---
        print("Server: Step 4 - Saving to Supabase DB...")
        try:
            # We insert the raw JSON data into the 'trips' table
            db_response = supabase.table("trips").insert({
                "user_email": user.user_email or "guest@example.com",
                "destination": user.destination,
                "trip_data": itinerary_data  # Save the full JSON object
            }).execute()
            print("✅ Saved to DB successfully!")
        except Exception as db_e:
            print(f"⚠️ DB Save Failed: {db_e}")
            # We do NOT raise an error here, because we still want to return the plan to the user.
        
        return itinerary_data

    except Exception as e:
        print(f"Pipeline Error: {e}")
        import traceback
        traceback.print_exc()
        raise e

@app.get("/")
def health_check():
    return {"status": "running", "db": "Supabase Connected"}

@app.post("/plan_trip")
def plan_trip(profile: UserProfile):
    try:
        # Pass the profile to logic
        result = generate_trip_logic(profile)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/image")
def get_image_proxy(query: str):
    image_url = fetch_verified_image(query)
    if image_url: return {"url": image_url}
    return {"url": "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1000"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)