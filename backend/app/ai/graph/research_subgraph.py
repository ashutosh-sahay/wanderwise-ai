from langgraph.graph import END, StateGraph

from app.ai.agents.research_pod.places_to_visit_agent import places_to_visit_agent
from app.ai.agents.research_pod.research_synthesizer import research_synthesizer_agent
from app.ai.agents.research_pod.weather_agent import weather_agent
from app.models.research_pod import TravelPlanState, WeatherDetails
from app.utils.logger import get_logger

log = get_logger("research_subgraph")

# ========================================
# NODE WRAPPER FUNCTIONS (ASYNC)
# ========================================

async def coordinator_node(state: TravelPlanState) -> dict:
    """
    Entry point - validates that required input fields are provided.
    Assumes parent supervisor already populated: destination, dates, budget.
    
    NOTE: No LLM agent needed here - parent supervisor already extracted/parsed
    all parameters. This node only performs fast validation checks before
    delegating to specialized research agents.
    """
    log.info(
        "🎬 Research subgraph started - Validating inputs",
        destination=state.destination,
        budget=state.budget
    )
    
    # Validate minimum required fields
    if not state.destination:
        log.error("❌ Validation failed: destination is missing")
        raise ValueError("destination is required but not provided by parent supervisor")
    
    # Optional: Validate other fields
    if state.budget:
        if state.budget <= 0:
            log.error("❌ Validation failed: budget must be positive", budget=state.budget)
            raise ValueError(f"budget must be positive, got: {state.budget}")
    
    log.info("✅ Input validation passed - Starting parallel research")
    # Pass through - input fields already populated by parent
    return {}


async def places_to_visit_node(state: TravelPlanState) -> dict:
    """
    Calls places_to_visit_agent and writes to state.places_to_visit.
    Uses ainvoke for non-blocking parallel execution.
    """
    log.info(f"🏛️  Researching places to visit for {state.destination}")
    
    # Format specific query with destination and preferences
    query = f"Research places to visit and attractions in {state.destination}."
    if state.start_date and state.end_date:
        query += f" Travel dates: {state.start_date} to {state.end_date}."
    elif state.start_date:
        query += f" Travel starts on {state.start_date}."
    if state.budget:
        query += f" Budget: ${state.budget}."
    if state.travel_vibe:
        query += f" Travel vibe/style: {state.travel_vibe}."
    
    # Pass formatted message instead of entire state
    result = await places_to_visit_agent.ainvoke({"messages": [{"role": "user", "content": query}]})
    
    # Extract structured response from create_agent result
    places_data = result["structured_response"]
    log.info(
        f"✅ Places research complete for {state.destination}",
        places_count=len(places_data.places_to_visit) if places_data.places_to_visit else 0
    )
    return {"places_to_visit": places_data}


async def weather_node(state: TravelPlanState) -> dict:
    """
    Calls weather_agent and writes to state.weather_details.
    Uses ainvoke for non-blocking parallel execution.
    """
    log.info(f"🌤️  Researching weather details for {state.destination}")
    
    # Format specific query with destination and dates
    query = f"Research weather information for {state.destination}."
    if state.start_date and state.end_date:
        query += f" The travel dates are {state.start_date} to {state.end_date}."
    elif state.start_date:
        query += f" Travel starts on {state.start_date}."
    if state.budget:
        query += f" Budget: ${state.budget}."
    if state.travel_vibe:
        query += f" Travel vibe: {state.travel_vibe}."
    
    # Pass formatted message instead of entire state
    result = await weather_agent.ainvoke({"messages": [{"role": "user", "content": query}]})
    
    # Extract structured response from create_agent result
    weather_data : WeatherDetails= result["structured_response"]
    log.info(
        f"✅ Weather research complete for {state.destination}",
        trends=weather_data.weather_trends if weather_data else None
    )
    return {"weather_details": weather_data}


async def validate_research(state: TravelPlanState) -> dict:
    """
    Validates that all required research data is present before synthesis.
    Ensures child agents completed successfully.
    """
    log.info("🔍 Validating research data completeness - is everything researched ?")
    
    # Validate required fields (currently implemented)
    if not state.places_to_visit:
        log.error("❌ Validation failed: places_to_visit is missing")
        raise ValueError("places_to_visit is required but not populated - places agent may have failed")
    if not state.weather_details:
        log.error("❌ Validation failed: weather_details is missing")
        raise ValueError("weather_details is required but not populated - weather agent may have failed")
    
    log.info("✅ Research validation passed - Ready for synthesis")
    
    # transportation_routes and stay_options are optional for now
    # When you implement them, add validation here
    # if not state.transportation_routes:
    #     raise ValueError("transportation_routes is required but not populated")
    # if not state.stay_options:
    #     raise ValueError("stay_options is required but not populated")
    
    return {}


async def synthesizer_node(state: TravelPlanState) -> dict:
    """
    Creates 2-3 TravelPlan variants from collected research.
    This is the exit point that creates the final output.
    Uses ainvoke for non-blocking execution.
    """
    log.info("🎨 Synthesizing travel plan variants")
    
    # Format comprehensive message with all research data
    synthesis_query = f"""
Create 2-3 distinct travel plan variants for {state.destination}.

Trip Details:
- Destination: {state.destination}
- Start Date: {state.start_date or 'Not specified'}
- End Date: {state.end_date or 'Not specified'}
- Budget: ${state.budget} USD
- Travel Vibe: {state.travel_vibe or 'Not specified'}

Research Data Available:

PLACES TO VISIT:
{state.places_to_visit.model_dump_json(indent=2) if state.places_to_visit else 'No data'}

WEATHER DETAILS:
{state.weather_details.model_dump_json(indent=2) if state.weather_details else 'No data'}

TRANSPORTATION:
{state.transportation_routes.model_dump_json(indent=2) if state.transportation_routes else 'No data available yet'}

ACCOMMODATIONS:
{state.stay_options.model_dump_json(indent=2) if state.stay_options else 'No data available yet'}

Create 2-3 distinct plan variants (e.g., balanced, adventurous, luxury) that best suit different traveler preferences.
"""
    
    # Pass formatted message instead of entire state
    result = await research_synthesizer_agent.ainvoke({"messages": [{"role": "user", "content": synthesis_query}]})
    
    # Extract structured response from create_agent result
    travel_plan_data = result["structured_response"]
    
    # Handle case where AI returns dict without travel_plans wrapper
    if isinstance(travel_plan_data, dict) and "travel_plans" not in travel_plan_data:
        # AI returned the plans directly, wrap them
        log.info("Wrapping direct travel plans response in proper structure")
        travel_plans_dict = travel_plan_data
    else:
        # AI returned proper TravelPlan structure
        travel_plans_dict = travel_plan_data.travel_plans if hasattr(travel_plan_data, 'travel_plans') else travel_plan_data.get('travel_plans', travel_plan_data)
    
    plan_count = len(travel_plans_dict) if travel_plans_dict else 0
    log.info(
        "✅ Synthesis complete - Travel plans created",
        plan_count=plan_count,
        plan_names=list(travel_plans_dict.keys()) if travel_plans_dict else []
    )
    
    return {"travel_plans": travel_plans_dict}


# ========================================
# BUILD GRAPH
# ========================================

log.info("🏗️  Initializing research subgraph")

# Initialize graph
graph = StateGraph(TravelPlanState)

# Add nodes
graph.add_node("coordinator", coordinator_node)
graph.add_node("places_to_visit", places_to_visit_node)
graph.add_node("weather", weather_node)
graph.add_node("validate_research", validate_research)
graph.add_node("synthesizer", synthesizer_node)

# Set entry point
graph.set_entry_point("coordinator")

# Parallel fan-out from coordinator
graph.add_edge("coordinator", "places_to_visit")
graph.add_edge("coordinator", "weather")

# Convergence to validation
graph.add_edge("places_to_visit", "validate_research")
graph.add_edge("weather", "validate_research")

# Validation to synthesizer
graph.add_edge("validate_research", "synthesizer")

# Synthesizer to END
graph.add_edge("synthesizer", END)

# Compile graph
log.info("✅ Research subgraph compiled successfully")
research_subgraph = graph.compile()







