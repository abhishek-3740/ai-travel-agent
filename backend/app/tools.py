from langchain.tools import tool
from langchain_community.utilities import WikipediaAPIWrapper
from langchain_community.tools import DuckDuckGoSearchRun
from geopy.geocoders import Nominatim

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
    return DuckDuckGoSearchRun().run(query)


search = DuckDuckGoSearchRun()

@tool
def check_price_tool(activity_name: str) -> str:
    """
    Searches the web for the current ticket price or cost of an activity in 2025.
    Useful for estimating budgets.
    """
    
    query = f"current ticket price cost {activity_name} 2025"
    
    try:
        results = search.run(query)
        return f"Price Search Results: {results[:400]}..." 
    except Exception as e:
        return f"Could not find price: {e}"