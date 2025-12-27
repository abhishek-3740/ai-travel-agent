import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_classic.agents import create_react_agent, AgentExecutor
from langchain_core.prompts import PromptTemplate
from app.tools import map_search_tool, wikipedia_tool, web_search_tool, check_price_tool

load_dotenv()

def get_planning_agent():
    
    llm = ChatGroq(
        model="llama-3.3-70b-versatile", 
        temperature=0,
        api_key=os.getenv("GROQ_API_KEY")
    )
    
    tools = [map_search_tool, wikipedia_tool, web_search_tool, check_price_tool]
    
    template = """
    You are an expert Travel Planner. Plan a detailed trip.

    TOOLS:
    ------
    You have access to the following tools:

    {tools}

    To use a tool, please use the following format:

    ```
    Thought: Do I need to use a tool? Yes
    Action: the action to take, should be one of [{tool_names}]
    Action Input: the input to the action
    Observation: the result of the action
    ```

    When you have a response to say to the Human, or if you do not need to use a tool, you MUST use the format:

    ```
    Thought: Do I need to use a tool? No
    Final Answer: [your response here]
    ```
    IMPORTANT RULES:
    1. **NO REPETITION:** Do not repeat the itinerary or budget details. Say it once, clearly.
    2. **REALISTIC TRAVEL:** Check distances. Do not plan more than 4 hours of driving per day unless necessary.
    3. **FORMAT:** When you are ready to answer, strictly use the format:
       Thought: Do I need to use a tool? No
       Final Answer: [Your detailed plan here]

    Begin!

    New input: {input}
    {agent_scratchpad}
    """

    prompt = PromptTemplate.from_template(template)

    agent = create_react_agent(llm, tools, prompt)

    agent_executor = AgentExecutor(
        agent=agent, 
        tools=tools, 
        verbose=True, 
        handle_parsing_errors=True
    )
    
    return agent_executor