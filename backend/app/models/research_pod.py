from typing import Annotated, List, Optional
from pydantic import BaseModel

# TODO - Review and update/enhance models if needed

#####################################################
# Places To Visit 
#####################################################

class PlaceToVisit(BaseModel):
    """Represents a recommended place or an attraction to visit in the travel destination."""
    name: Annotated[str, "Name of the place"]
    description: Annotated[str, "Short description of the place"]
    rationale: Annotated[str, "Reason this place is recommended"]
    sources: Annotated[List[str], "List of sources related to this place"]

class PlacesToVisit(BaseModel):
    """Represents a list of places to visit in the travel destination."""
    places_to_visit: Annotated[List[PlaceToVisit], "List of places to visit"]
    

#####################################################
# Weather Details
#####################################################

class WeatherDetails(BaseModel):
    """Describes the weather details for a destination."""
    weather_trends: Annotated[str, "Weather trends for the destination"]
    best_time_to_visit: Annotated[str, "Best time to visit the destination"]
    current_temperature: Annotated[str, "Current temperature for the destination"]
    current_weather_condition: Annotated[str, "General weather conditions for the destination (e.g., sunny, rainy)"]
    sources: Annotated[List[str], "Sources for weather information"]


#####################################################
# Transportation Routes
#####################################################

class TransportationRoute(BaseModel):
    """
    Represents a transportation route within or to the destination.
    It can be a travel routes to travel within the destination or a route from source to destination.
    """
    start_point: Annotated[str, "Starting point of the route"]
    end_point: Annotated[str, "End point of the route"]
    mode_of_transport: Annotated[str, "Mode of transport (e.g. bus, train, car)"]
    duration: Annotated[str, "Estimated duration of travel"]

class TransportationRoutes(BaseModel):
    """Represents a list of transportation routes within or to the destination."""
    routes: Annotated[List[TransportationRoute], "List of transportation routes"]

#####################################################
# Stay Options
#####################################################

class StayOption(BaseModel):
    """Represents an accommodation or stay option."""
    area: Annotated[str, "Area or location where the stay is located"]
    type_of_stay: Annotated[str, "Type of accommodation (e.g., hotel, hostel, Airbnb, resort, homestay, etc.)"]
    person_capacity: Annotated[int, "Number of people the stay can accommodate"]
    estimated_price_range: Annotated[str, "Estimated price range for the stay"]
    rationale: Annotated[str, "Reason for recommending this stay option"]
    sources: Annotated[List[str], "Sources with information about the stay"]

class StayOptions(BaseModel):
    """Represents a list of accommodation or stay options."""
    options: Annotated[List[StayOption], "List of accommodation or stay options"]

#####################################################
# Travel Research
#####################################################

class TravelResearch(BaseModel):
    """Comprehensive research summary for a travel destination."""
    places_to_visit: Annotated[Optional[PlacesToVisit], "List of places recommended to visit"] = None
    weather_details: Annotated[Optional[WeatherDetails], "Weather summary for the destination"] = None
    transportation_routes: Annotated[Optional[TransportationRoutes], "Recommended routes and transport options"] = None
    stay_options: Annotated[Optional[StayOptions], "Recommended accommodation options"] = None

class TravelPlan(BaseModel):
    """
    Travels plans for a proposed travel destination.
    Key is the brief name of the plan(balanced, adventurous, luxury, etc.), Value is the travel research summary.
    """
    travel_plans: Annotated[dict[str, TravelResearch], "Plan mapping travel types(balanced, adventurous, luxury, etc.) to their research"]


#####################################################
# Travel Subgraph State
#####################################################

class TravelPlanState(BaseModel):
    """
    State for the Travel Research Subgraph.
    The workspace/whiteboard where agents write their work
    Handles input from parent, intermediate research data, and output.
    """
    # ========================================
    # INPUT FIELDS
    # ========================================
    user_query: Annotated[Optional[str], "Original user travel query"] = None
    destination: Annotated[Optional[str], "Travel destination"] = None
    source: Annotated[Optional[str], "Starting location/source city"] = None
    start_date: Annotated[Optional[str], "Trip start date"] = None
    end_date: Annotated[Optional[str], "Trip end date"] = None
    budget: Annotated[Optional[float], "Total budget for the trip"] = None
    travel_vibe: Annotated[Optional[str], "Travel vibe/type preference (e.g., relaxed, adventurous)"] = None
    
    # ========================================
    # INTERMEDIATE FIELDS (from child agents)
    # ========================================
    places_to_visit: Annotated[Optional[PlacesToVisit], "Research from places agent"] = None
    weather_details: Annotated[Optional[WeatherDetails], "Research from weather agent"] = None
    transportation_routes: Annotated[Optional[TransportationRoutes], "Research from transportation agent"] = None
    stay_options: Annotated[Optional[StayOptions], "Research from stay agent"] = None
    
    # ========================================
    # OUTPUT FIELD (to parent supervisor)
    # ========================================
    travel_plans: Annotated[Optional[dict[str, TravelResearch]], "Final 2-3 travel plan variants"] = None