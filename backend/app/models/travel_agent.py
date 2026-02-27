from typing import Annotated, Optional, Literal, List
from pydantic import BaseModel, Field
from app.models.research_pod import TravelPlan, TravelResearch

# ========================================
# ITINERARY MODELS
# ========================================

class DayActivity(BaseModel):
    """Represents a single activity in the itinerary."""
    time: Annotated[str, "Time of day (e.g., '9:00 AM - 12:00 PM')"]
    activity_name: Annotated[str, "Name of the activity or place to visit"]
    description: Annotated[str, "Brief description of what to do"]
    location: Annotated[str, "Specific location/address if applicable"]
    estimated_cost: Annotated[Optional[float], "Estimated cost for this activity in INR"] = None
    travel_time_from_previous: Annotated[Optional[str], "Travel time from previous activity"] = None
    notes: Annotated[Optional[str], "Additional notes, tips, or recommendations"] = None


class DayPlan(BaseModel):
    """Represents a single day in the itinerary."""
    day_number: Annotated[int, "Day number (1-indexed)"]
    date: Annotated[str, "Date in YYYY-MM-DD format"]
    title: Annotated[str, "Short title/theme for the day (e.g., 'Exploring Old City')"]
    activities: Annotated[List[DayActivity], "List of activities for this day"]
    accommodation: Annotated[Optional[str], "Where to stay this night"] = None
    total_estimated_cost: Annotated[Optional[float], "Total estimated cost for the day"] = None
    notes: Annotated[Optional[str], "General notes for the day"] = None


class DayByDayItinerary(BaseModel):
    """Complete day-by-day itinerary for the entire trip."""
    destination: Annotated[str, "Primary destination"]
    start_date: Annotated[str, "Trip start date"]
    end_date: Annotated[str, "Trip end date"]
    total_days: Annotated[int, "Total number of days"]
    daily_plans: Annotated[List[DayPlan], "Day-by-day plans"]
    total_estimated_cost: Annotated[Optional[float], "Total estimated cost for entire trip"] = None
    packing_suggestions: Annotated[Optional[List[str]], "List of packing suggestions"] = None
    travel_tips: Annotated[Optional[List[str]], "General travel tips for the destination"] = None


# ========================================
# TRAVEL PARAMETERS MODEL
# ========================================

class TravelInputs(BaseModel):
    """Extracted travel parameters from user query."""
    destination: Annotated[Optional[str], "Travel destination"] = None
    source: Annotated[Optional[str], "Starting location"] = None
    start_date: Annotated[Optional[str], "Trip start date in YYYY-MM-DD format"] = None
    end_date: Annotated[Optional[str], "Trip end date in YYYY-MM-DD format"] = None
    travel_duration: Annotated[Optional[int], "Travel duration in days"] = None
    budget: Annotated[Optional[float], "Total budget (numeric value only)"] = None
    travel_type: Annotated[Optional[str], "Type of travel (solo, couple, family, etc.)"] = None
    travel_vibe: Annotated[Optional[str], "Travel vibe (adventurous, relaxed, luxury, etc.)"] = None


# ========================================
# AGENT RESPONSE MODEL
# ========================================

class TravelAgentResponse(BaseModel):
    """
    Structured response from travel agent AI.
    Contains everything the AI can intelligently determine from user's message.
    """
    # Extracted parameters
    travel_inputs: Annotated[TravelInputs, "Extracted travel parameters from user's message"]
    
    # Validation
    all_required_inputs_present: Annotated[
        bool,
        "Whether all required fields (destination, source, budget, duration) are present"
    ]
    missing_required_fields: Annotated[
        list[str],
        "List of missing required field names"
    ] = Field(default_factory=list)
    
    # Response to user
    response_message: Annotated[
        str,
        "Natural language message to display to user"
    ]
    
    # Intent classification
    user_intent: Annotated[
        Literal[
            "providing_info",      # User is providing travel details
            "selecting_plan",      # User is selecting from proposed plans
            "modifying_request",   # User wants to modify/adjust plans
            "general_question"     # User is asking a general question
        ],
        "Classification of what the user is trying to do"
    ]
    
    # Plan selection (only if user_intent = "selecting_plan")
    selected_plan_name: Annotated[
        Optional[str],
        "Name of the travel plan user selected (e.g., 'balanced', 'luxury', 'adventurous')"
    ] = None
    
    # Clarification
    needs_clarification: Annotated[
        bool,
        "Whether agent needs to ask clarifying questions"
    ] = False
    clarification_question: Annotated[
        Optional[str],
        "Specific clarifying question to ask user"
    ] = None


# ========================================
# GRAPH STATE MODEL
# ========================================

class TravelAgentState(BaseModel):
    """State for the main travel agent graph with human-in-the-loop."""
    
    # User interaction
    user_query: Annotated[str, "Current user query/message"]
    conversation_history: Annotated[list[dict], "Chat history"] = []
    
    # Extracted parameters
    travel_inputs: Annotated[Optional[TravelInputs], "Extracted travel parameters"] = None
    all_required_inputs_present: Annotated[bool, "Whether all required params are present"] = False
    previous_travel_inputs: Annotated[Optional[TravelInputs], "Previous travel inputs for delta detection"] = None
    
    # Research results
    proposed_travel_plans: Annotated[Optional[TravelPlan], "2-3 plan variants from research"] = None
    
    # User selection
    selected_plan_name: Annotated[Optional[str], "User's selected plan name (e.g., 'balanced')"] = None
    accepted_travel_plan: Annotated[Optional[TravelResearch], "Final accepted travel plan"] = None
    
    # Itinerary
    day_by_day_itinerary: Annotated[Optional["DayByDayItinerary"], "Detailed day-by-day itinerary"] = None
    
    # Control flow
    awaiting_user_input: Annotated[bool, "Whether graph is waiting for user input"] = False
