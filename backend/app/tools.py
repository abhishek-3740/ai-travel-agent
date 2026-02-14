import os
from langchain.tools import tool
from langchain_community.utilities import WikipediaAPIWrapper
from langchain_google_community import GoogleSearchAPIWrapper
from geopy.geocoders import Nominatim
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Google Search Wrapper once to be reused by tools
# It will use the keys from your .env file
search = GoogleSearchAPIWrapper(
    google_api_key=os.getenv("GOOGLE_API_KEY"),
    google_cse_id=os.getenv("GOOGLE_CX_ID")
)

@tool
def map_search_tool(location_name: str) -> str:
    """
    Get verified address and (lat, lon) coordinates for a place.
    Use this tool to find the location details of a specific place.
    """
    geolocator = Nominatim(user_agent="travel_planner_agent_v1_unique_id_123")
    try:
        location = geolocator.geocode(location_name)
        if location:
            return f"Address: {location.address} | Lat: {location.latitude}, Lon: {location.longitude}"
        return "Location not found. Try a different query."
    except Exception as e:
        return f"Map Error: {e}"

@tool
def wikipedia_tool(query: str) -> str:
    """
    Search Wikipedia for historical facts or cultural significance of a place.
    """
    return WikipediaAPIWrapper().run(query)

@tool
def web_search_tool(query: str) -> str:
    """
    Search the web for current 'best of' lists, events, or general info.
    """
    try:
        return search.run(query)
    except Exception as e:
        return f"Web Search Error: {e}"

@tool
def check_price_tool(activity_name: str) -> str:
    """
    Searches the web for the current ticket price or cost of an activity in 2026.
    Useful for estimating budgets.
    """
    # Updated to 2026 to match current time
    query = f"current ticket price cost {activity_name} 2026"
    
    try:
        results = search.run(query)
        return f"Price Search Results: {results[:400]}..." 
    except Exception as e:
        return f"Could not find price: {e}"