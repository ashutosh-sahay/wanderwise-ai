from langgraph.graph import END, StateGraph

from app.ai.agents.research_pod.places_to_visit_agent import places_to_visit_agent
from app.ai.agents.research_pod.research_synthesizer import research_synthesizer_agent
from app.ai.agents.research_pod.weather_agent import weather_agent
from app.ai.agents.research_pod.transport_finder import transport_finder_agent
from app.ai.agents.research_pod.stay_finder import stay_finder_agent
from app.models.research_pod import TravelPlanState, WeatherDetails
from app.utils.logger import get_logger

log = get_logger("research_subgraph")

# ========================================
# DEPENDENCY MAPPING FOR DELTA EXECUTION
# ========================================

NODE_DEPENDENCIES = {
    "destination": {"places_to_visit", "weather", "transport", "stay"},  # Full re-run
    "source": {"transport"},
    "start_date": {"transport", "stay", "weather"},
    "end_date": {"transport", "stay", "weather"},
    "budget": {"transport", "stay", "places_to_visit"},
    "travel_vibe": {"places_to_visit", "stay"},
}


def detect_nodes_to_execute(previous: dict, current: dict) -> set[str]:
    """
    Determines which research nodes need re-execution based on input delta.
    
    Args:
        previous: Dictionary of previous input values
        current: Dictionary of current input values
    
    Returns:
        Set of node names to execute (e.g., {"transport", "stay"})
        
    Examples:
        - destination changed → all nodes
        - source changed → transport only
        - dates changed → transport, stay, weather
        - budget changed → transport, stay, places_to_visit
    """
    # Find what changed
    changed_fields = {
        field for field in current.keys()
        if current.get(field) != previous.get(field)
    }
    
    if not changed_fields:
        # Nothing changed - could skip research entirely or re-synthesize
        log.info("📌 No input changes detected")
        return set()
    
    log.info(f"🔄 Input changes detected: {changed_fields}")
    
    # Map changes to affected nodes
    nodes_to_run = set()
    for field in changed_fields:
        if field in NODE_DEPENDENCIES:
            affected_nodes = NODE_DEPENDENCIES[field]
            nodes_to_run.update(affected_nodes)
            log.debug(f"  • Field '{field}' changed → affects {affected_nodes}")
    
    return nodes_to_run


def make_conditional_node(node_name: str, node_func):
    """
    Wraps a research node to conditionally execute based on nodes_to_execute.
    
    If the node is in state.nodes_to_execute, it executes normally.
    Otherwise, it skips execution and returns empty dict (preserves existing state).
    
    Args:
        node_name: Name of the node (e.g., "transport", "stay")
        node_func: The actual async node function to wrap
    
    Returns:
        Wrapped async function that checks execution conditions
    """
    async def wrapper(state: TravelPlanState) -> dict:
        # Check if this node should execute
        if node_name in (state.nodes_to_execute or set()):
            log.info(f"✅ Executing {node_name} node (input changes detected)")
            return await node_func(state)
        else:
            log.info(f"⏭️  Skipping {node_name} node (no relevant input changes)")
            return {}  # Empty dict preserves existing state values
    
    return wrapper

# ========================================
# NODE WRAPPER FUNCTIONS (ASYNC)
# ========================================

async def coordinator_node(state: TravelPlanState) -> dict:
    """
    Entry point - validates inputs and determines which nodes need re-execution
    based on input delta from previous run.
    
    For first run: executes all nodes
    For subsequent runs: only executes nodes affected by changed inputs
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
    
    # Build current inputs snapshot
    current_inputs = {
        "destination": state.destination,
        "source": state.source,
        "start_date": state.start_date,
        "end_date": state.end_date,
        "budget": state.budget,
        "travel_vibe": state.travel_vibe,
    }
    
    # Detect changes and determine which nodes to execute
    if state.previous_inputs is None:
        # First run - execute all nodes
        nodes_to_execute = {"places_to_visit", "weather", "transport", "stay"}
        log.info("🆕 First run - executing all research nodes")
    else:
        # Delta detection - only execute affected nodes
        nodes_to_execute = detect_nodes_to_execute(
            previous=state.previous_inputs,
            current=current_inputs
        )
        if nodes_to_execute:
            log.info(f"🔄 Delta detected - re-running nodes: {nodes_to_execute}")
        else:
            log.info("✅ No changes detected - will re-synthesize with existing data")
    
    log.info("✅ Input validation passed - Starting research execution")
    
    return {
        "nodes_to_execute": nodes_to_execute,
        "previous_inputs": current_inputs  # Save for next iteration
    }


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


async def transport_node(state: TravelPlanState) -> dict:
    """
    Calls transport_finder_agent and writes to state.transportation_routes.
    Uses ainvoke for non-blocking parallel execution.
    """
    log.info(f"🚗 Researching transportation options for {state.destination}")
    
    # Format specific query with destination, source, and preferences
    query = f"Research transportation options and routes for {state.destination}."
    if state.source:
        query += f" Traveling from {state.source} to {state.destination}."
    if state.start_date and state.end_date:
        query += f" Travel dates: {state.start_date} to {state.end_date}."
    elif state.start_date:
        query += f" Travel starts on {state.start_date}."
    if state.budget:
        query += f" Budget: ${state.budget}."
    if state.travel_vibe:
        query += f" Travel vibe: {state.travel_vibe}."
    
    # Pass formatted message instead of entire state
    result = await transport_finder_agent.ainvoke({"messages": [{"role": "user", "content": query}]})
    
    # Extract structured response from create_agent result
    transport_data = result["structured_response"]
    log.info(
        f"✅ Transportation research complete for {state.destination}",
        routes_count=len(transport_data.routes) if transport_data and transport_data.routes else 0
    )
    return {"transportation_routes": transport_data}


async def stay_node(state: TravelPlanState) -> dict:
    """
    Calls stay_finder_agent and writes to state.stay_options.
    Uses ainvoke for non-blocking parallel execution.
    """
    log.info(f"🏨 Researching accommodation options for {state.destination}")
    
    # Format specific query with destination, dates, and preferences
    query = f"Research accommodation and stay options in {state.destination}."
    if state.start_date and state.end_date:
        query += f" Travel dates: {state.start_date} to {state.end_date}."
    elif state.start_date:
        query += f" Travel starts on {state.start_date}."
    if state.budget:
        query += f" Budget: ${state.budget}."
    if state.travel_vibe:
        query += f" Travel vibe: {state.travel_vibe}."
    
    # Pass formatted message instead of entire state
    result = await stay_finder_agent.ainvoke({"messages": [{"role": "user", "content": query}]})
    
    # Extract structured response from create_agent result
    stay_data = result["structured_response"]
    log.info(
        f"✅ Accommodation research complete for {state.destination}",
        options_count=len(stay_data.options) if stay_data and stay_data.options else 0
    )
    return {"stay_options": stay_data}


async def validate_research(state: TravelPlanState) -> dict:
    """
    Validates that required research data is present before synthesis.
    For delta execution: only validates fields for nodes that were re-executed.
    For skipped nodes: verifies cached data still exists from previous run.
    """
    log.info("🔍 Validating research data completeness")
    
    nodes_executed = state.nodes_to_execute or set()
    
    # Validate places_to_visit
    if "places_to_visit" in nodes_executed:
        if not state.places_to_visit:
            log.error("❌ Validation failed: places_to_visit re-run failed")
            raise ValueError("places_to_visit was re-executed but not populated - places agent may have failed")
        log.debug("✓ places_to_visit: re-executed and validated")
    else:
        if not state.places_to_visit:
            log.error("❌ Validation failed: places_to_visit missing from cache")
            raise ValueError("places_to_visit was skipped but no cached data exists")
        log.debug("✓ places_to_visit: using cached data")
    
    # Validate weather_details
    if "weather" in nodes_executed:
        if not state.weather_details:
            log.error("❌ Validation failed: weather_details re-run failed")
            raise ValueError("weather was re-executed but not populated - weather agent may have failed")
        log.debug("✓ weather_details: re-executed and validated")
    else:
        if not state.weather_details:
            log.error("❌ Validation failed: weather_details missing from cache")
            raise ValueError("weather was skipped but no cached data exists")
        log.debug("✓ weather_details: using cached data")
    
    # Validate transportation_routes
    if "transport" in nodes_executed:
        if not state.transportation_routes:
            log.error("❌ Validation failed: transportation_routes re-run failed")
            raise ValueError("transport was re-executed but not populated - transport agent may have failed")
        log.debug("✓ transportation_routes: re-executed and validated")
    else:
        if not state.transportation_routes:
            log.error("❌ Validation failed: transportation_routes missing from cache")
            raise ValueError("transport was skipped but no cached data exists")
        log.debug("✓ transportation_routes: using cached data")
    
    # Validate stay_options
    if "stay" in nodes_executed:
        if not state.stay_options:
            log.error("❌ Validation failed: stay_options re-run failed")
            raise ValueError("stay was re-executed but not populated - stay agent may have failed")
        log.debug("✓ stay_options: re-executed and validated")
    else:
        if not state.stay_options:
            log.error("❌ Validation failed: stay_options missing from cache")
            raise ValueError("stay was skipped but no cached data exists")
        log.debug("✓ stay_options: using cached data")
    
    log.info("✅ Research validation passed - Ready for synthesis")
    
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
Create 3-4 distinct travel plan variants for {state.destination}.

Trip Details:
- Destination: {state.destination}
- Source: {state.source or 'Not specified'}
- Start Date: {state.start_date or 'Not specified'}
- End Date: {state.end_date or 'Not specified'}
- Budget: Rs. {state.budget} INR
- Travel Vibe: {state.travel_vibe or 'Not specified'}

IMPORTANT: The user's Travel Vibe is "{state.travel_vibe or 'balanced'}". Generate plan names and content that align with this vibe.
For example:
- If vibe is "relax", "unwind", or "chill" → create plans like "relaxation", "wellness", "leisure"
- If vibe is "adventure" → create plans like "adventurous", "explorer", "adrenaline"
- If vibe is "luxury" → create plans like "luxury", "premium", "deluxe"

Research Data Available:

PLACES TO VISIT:
{state.places_to_visit.model_dump_json(indent=2) if state.places_to_visit else 'No data'}

WEATHER DETAILS:
{state.weather_details.model_dump_json(indent=2) if state.weather_details else 'No data'}

TRANSPORTATION:
{state.transportation_routes.model_dump_json(indent=2) if state.transportation_routes else 'No data available yet'}

ACCOMMODATIONS:
{state.stay_options.model_dump_json(indent=2) if state.stay_options else 'No data available yet'}

Create 2-3 distinct plan variants that match the "{state.travel_vibe or 'balanced'}" vibe with different intensity/budget levels.
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
# Wrap research nodes with conditional execution logic
graph.add_node("places_to_visit", make_conditional_node("places_to_visit", places_to_visit_node))
graph.add_node("weather", make_conditional_node("weather", weather_node))
graph.add_node("transport", make_conditional_node("transport", transport_node))
graph.add_node("stay", make_conditional_node("stay", stay_node))
graph.add_node("validate_research", validate_research)
graph.add_node("synthesizer", synthesizer_node)

# Set entry point
graph.set_entry_point("coordinator")

# Parallel fan-out from coordinator
graph.add_edge("coordinator", "places_to_visit")
graph.add_edge("coordinator", "weather")
graph.add_edge("coordinator", "transport")
graph.add_edge("coordinator", "stay")

# Convergence to validation
graph.add_edge("places_to_visit", "validate_research")
graph.add_edge("weather", "validate_research")
graph.add_edge("transport", "validate_research")
graph.add_edge("stay", "validate_research")

# Validation to synthesizer
graph.add_edge("validate_research", "synthesizer")

# Synthesizer to END
graph.add_edge("synthesizer", END)

# Compile graph
log.info("✅ Research subgraph compiled successfully")
research_subgraph = graph.compile()







