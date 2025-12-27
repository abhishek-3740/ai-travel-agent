from pydantic import BaseModel, Field
from typing import List, Literal

# --- Input Schema ---
class UserProfile(BaseModel):
    destination: str = Field(..., description="The city or country to visit")
    duration_days: int = Field(7, description="Number of days for the trip")
    budget_tier: Literal["Cheap", "Moderate", "Luxury"] = Field(..., description="Budget preference")
    pacing: Literal["Relaxed", "Moderate", "Fast-paced"] = Field("Moderate", description="Trip speed")
    interests: List[str] = Field(default_factory=list, description="Specific interests")
    group_size: int = Field(1, description="Number of travelers")

# --- Output Schema ---
class Activity(BaseModel):
    name: str = Field(..., description="Name of the location")
    description: str = Field(..., description="Brief description")
    address: str = Field(..., description="Verified street address")
    latitude: float = Field(..., description="Latitude")
    longitude: float = Field(..., description="Longitude")
    cost_estimate: float = Field(..., description="Estimated cost per person")
    category: Literal["Accommodation", "Food", "Activity", "Transport"] = Field(..., description="Type")

class DayPlan(BaseModel):
    day_number: int = Field(..., description="Day number")
    theme: str = Field(..., description="Theme for the day")
    activities: List[Activity] = Field(..., description="List of activities")

class TravelItinerary(BaseModel):
    trip_title: str = Field(..., description="Catchy title")
    destination: str = Field(..., description="Confirmed destination")
    total_estimated_cost: float = Field(..., description="Total cost")
    budget_health: Literal["Within Budget", "Over Budget"] = Field(..., description="Budget assessment")
    daily_plans: List[DayPlan] = Field(..., description="Day-by-day plan")