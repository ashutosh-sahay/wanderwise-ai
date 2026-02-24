from typing import Literal
from langgraph.graph import END, StateGraph
from langgraph.types import interrupt

from app.ai.agents.travel_agent import travel_agent
from app.ai.agents.itinerary_planner import itinerary_planner_agent
from app.ai.graph.research_subgraph import research_subgraph
from app.models.research_pod import TravelPlan, TravelResearch
from app.models.travel_agent import TravelAgentState, TravelInputs, TravelAgentResponse
from app.utils.logger import get_logger

log = get_logger("travel_planning_graph")


# ========================================
# NODE FUNCTIONS
# ========================================

async def extract_parameters_node(state: TravelAgentState) -> dict:
    """
    Uses travel_agent AI to extract and validate travel parameters from user query.
    AI returns comprehensive TravelAgentResponse with extraction, validation, and intent.
    
    HUMAN-IN-LOOP: If required parameters are missing, sets awaiting_user_input=True
    to pause and wait for user to provide missing info.
    """
    log.info(
        "🔍 Step 1: Extracting travel parameters",
        user_query=state.user_query[:100] + "..." if len(state.user_query) > 100 else state.user_query,
        has_existing_inputs=state.travel_inputs is not None
    )
    
    # Prepare messages for AI agent
    messages = [
        {"role": "system", "content": "You are analyzing user travel queries."},
        *state.conversation_history,  # Include full conversation history
        {"role": "user", "content": state.user_query}
    ]
    
    # Invoke AI agent - returns TravelAgentResponse with rich structured data
    response = await travel_agent.ainvoke({"messages": messages})
    ai_response : TravelAgentResponse = response["structured_response"]
    
    log.info(
        "✅ Parameter extraction complete",
        user_intent=ai_response.user_intent,
        all_inputs_present=ai_response.all_required_inputs_present,
        missing_fields=ai_response.missing_required_fields or []
    )
    
    # Merge travel inputs (preserve previous data, update with new info)
    if state.travel_inputs:
        # Start with existing data
        existing_dict = state.travel_inputs.model_dump()
        new_dict = ai_response.travel_inputs.model_dump()
        
        # Update only fields that have non-None values in new response
        for key, value in new_dict.items():
            if value is not None:
                existing_dict[key] = value
        
        travel_inputs = TravelInputs(**existing_dict)
        log.debug("Merged travel inputs with existing state")
    else:
        travel_inputs = ai_response.travel_inputs
    
    # Build conversation history (Graph manages state, not AI)
    updated_history = state.conversation_history + [
        {"role": "user", "content": state.user_query},
        {"role": "assistant", "content": ai_response.response_message}
    ]
    
    # Determine if we should wait for user input
    # Wait if: inputs incomplete OR user selected a plan (need to finalize)
    awaiting_input = (
        not ai_response.all_required_inputs_present or
        ai_response.user_intent == "selecting_plan"
    )
    
    if awaiting_input:
        log.info(
            "⏸️  Pausing for user input",
            reason="missing_inputs" if not ai_response.all_required_inputs_present else "plan_selection"
        )
    
    # Return state updates
    return {
        "travel_inputs": travel_inputs,
        "all_required_inputs_present": ai_response.all_required_inputs_present,
        "awaiting_user_input": awaiting_input,
        "conversation_history": updated_history,
        # If user selected a plan, capture it
        "selected_plan_name": ai_response.selected_plan_name if ai_response.user_intent == "selecting_plan" else state.selected_plan_name
    }


async def research_planning_node(state: TravelAgentState) -> dict:
    """
    Delegates to research_subgraph to generate 2-3 travel plan variants.
    Only called when all required inputs are present.
    """
    log.info(
        "🔬 Step 2: Starting travel research",
        destination=state.travel_inputs.destination,
        budget=state.travel_inputs.budget,
        duration=f"{state.travel_inputs.start_date} to {state.travel_inputs.end_date}" if state.travel_inputs.start_date else None
    )
    
    # Prepare input for research subgraph
    subgraph_input = {
        "user_query": state.user_query,
        "destination": state.travel_inputs.destination,
        "start_date": state.travel_inputs.start_date,
        "end_date": state.travel_inputs.end_date,
        "budget": state.travel_inputs.budget,
        "travel_vibe": state.travel_inputs.travel_vibe,
    }
    
    # Invoke research subgraph (async)
    result = await research_subgraph.ainvoke(subgraph_input)
    
    plan_count = len(result["travel_plans"])
    log.info(
        "✅ Research complete - Plans generated",
        plan_count=plan_count,
        plan_names=list(result["travel_plans"].keys())
    )
    
    return {
        "proposed_travel_plans": TravelPlan(travel_plans=result["travel_plans"]),
        "awaiting_user_input": True  # Wait for user to select a plan
    }


async def present_plans_node(state: TravelAgentState) -> dict:
    """
    Presents the 2-3 travel plan variants to user and asks for selection.
    
    HUMAN-IN-LOOP: Sets awaiting_user_input=True to pause execution.
    """
    log.info(
        "📋 Step 3: Presenting travel plans to user",
        plan_count=len(state.proposed_travel_plans.travel_plans)
    )
    
    # Use travel agent to format presentation
    plans = state.proposed_travel_plans.travel_plans
    
    # Format plans for presentation
    presentation = "Here are your personalized travel plans:\n\n"
    for plan_name, plan_details in plans.items():
        presentation += f"**{plan_name.title()} Plan**\n"
        # Add summary
        presentation += "\n"
    
    presentation += "\nWhich plan would you like to choose? (or ask for modifications)"
    
    log.info("⏸️  Waiting for user to select a plan")
    
    return {
        "awaiting_user_input": True,
        "conversation_history": state.conversation_history + [
            {"role": "assistant", "content": presentation}
        ]
    }


async def finalize_plan_node(state: TravelAgentState) -> dict:
    """
    Finalizes the user's selected travel plan.
    Handles case-insensitive plan name matching.
    """
    log.info(
        "🎯 Step 4: Finalizing selected plan",
        selected_plan=state.selected_plan_name
    )
    
    # Normalize the selected plan name (lowercase, remove " plan" suffix)
    normalized_name = state.selected_plan_name.lower().replace(" plan", "").strip()
    
    # Try to find the plan with case-insensitive matching
    selected_plan = None
    for plan_name, plan_data in state.proposed_travel_plans.travel_plans.items():
        if plan_name.lower() == normalized_name:
            selected_plan = plan_data
            log.info(
                "✅ Travel plan finalized successfully",
                plan_name=plan_name,
                normalized_from=state.selected_plan_name,
                destination=state.travel_inputs.destination if state.travel_inputs else None
            )
            break
    
    if not selected_plan:
        log.warning(
            "⚠️  Selected plan not found",
            selected_plan_name=state.selected_plan_name,
            normalized_name=normalized_name,
            available_plans=list(state.proposed_travel_plans.travel_plans.keys())
        )
        # Try to pick the first available plan as fallback
        if state.proposed_travel_plans.travel_plans:
            first_plan = next(iter(state.proposed_travel_plans.travel_plans.values()))
            log.info("⚠️  Using first available plan as fallback")
            selected_plan = first_plan
    
    return {
        "accepted_travel_plan": selected_plan,
        "awaiting_user_input": False
    }


async def create_itinerary_node(state: TravelAgentState) -> dict:
    """
    Creates a detailed day-by-day itinerary based on the accepted travel plan.
    This node is called after the user selects a plan.
    """
    log.info(
        "📅 Step 5: Creating day-by-day itinerary",
        destination=state.travel_inputs.destination,
        duration=f"{state.travel_inputs.start_date} to {state.travel_inputs.end_date}"
    )
    
    # Calculate number of days
    from datetime import datetime
    try:
        if state.travel_inputs.start_date and state.travel_inputs.end_date:
            start = datetime.strptime(state.travel_inputs.start_date, "%Y-%m-%d")
            end = datetime.strptime(state.travel_inputs.end_date, "%Y-%m-%d")
            num_days = (end - start).days + 1
        elif state.travel_inputs.travel_duration:
            num_days = state.travel_inputs.travel_duration
        else:
            num_days = 7  # Default fallback
    except Exception as e:
        log.warning(f"Could not calculate days, using duration or default: {e}")
        num_days = state.travel_inputs.travel_duration or 7
    
    # Format comprehensive message for itinerary planner
    itinerary_request = f"""
Create a detailed day-by-day itinerary for this trip:

TRIP DETAILS:
- Destination: {state.travel_inputs.destination}
- Start Date: {state.travel_inputs.start_date or 'Not specified'}
- End Date: {state.travel_inputs.end_date or 'Not specified'}
- Duration: {num_days} days
- Budget: ${state.travel_inputs.budget} USD
- Travel Vibe: {state.travel_inputs.travel_vibe or 'Balanced'}
- Travel Type: {state.travel_inputs.travel_type or 'Not specified'}
- Source/Origin: {state.travel_inputs.source or 'Not specified'}

SELECTED TRAVEL PLAN: {state.selected_plan_name.upper()}

RESEARCHED INFORMATION:

Places to Visit:
{state.accepted_travel_plan.places_to_visit.model_dump_json(indent=2) if state.accepted_travel_plan.places_to_visit else 'No data'}

Weather Information:
{state.accepted_travel_plan.weather_details.model_dump_json(indent=2) if state.accepted_travel_plan.weather_details else 'No data'}

Transportation Options:
{state.accepted_travel_plan.transportation_routes.model_dump_json(indent=2) if state.accepted_travel_plan.transportation_routes else 'No data available'}

Accommodation Options:
{state.accepted_travel_plan.stay_options.model_dump_json(indent=2) if state.accepted_travel_plan.stay_options else 'No data available'}

Please create a comprehensive day-by-day itinerary that:
1. Distributes all the places to visit across the {num_days} days
2. Organizes them logically based on proximity and logistics
3. Includes specific times for each activity
4. Accounts for meals, travel time, and rest
5. Stays within the ${state.travel_inputs.budget} budget
6. Matches the {state.travel_inputs.travel_vibe or 'balanced'} travel vibe
7. Provides practical tips and cost estimates
"""
    
    # Invoke itinerary planner agent
    result = await itinerary_planner_agent.ainvoke({"messages": [{"role": "user", "content": itinerary_request}]})
    
    # Extract structured response
    itinerary_data = result["structured_response"]
    
    log.info(
        "✅ Itinerary created successfully",
        total_days=itinerary_data.total_days,
        total_cost=itinerary_data.total_estimated_cost
    )
    
    return {
        "day_by_day_itinerary": itinerary_data
    }


# ========================================
# CONDITIONAL ROUTING
# ========================================

def route_after_extraction(state: TravelAgentState) -> Literal["research_planning", "finalize_plan", "human_input"]:
    """
    Routes based on whether all required inputs are present AND what the user intent is.
    
    - If user just selected a plan: go to finalize
    - If all required inputs present and no plans yet: proceed to research
    - If plans exist but user wants modifications: proceed to research again
    - If missing inputs: wait for human to provide them
    """
    # Check if user just selected a plan
    if state.selected_plan_name and state.proposed_travel_plans:
        log.info(f"➡️  Routing: Plan '{state.selected_plan_name}' selected → Finalizing")
        return "finalize_plan"
    
    # Check if inputs are complete
    if state.all_required_inputs_present:
        # Only do research if we don't have plans OR user wants modifications
        if not state.proposed_travel_plans:
            log.info("➡️  Routing: All inputs present → Proceeding to research")
            return "research_planning"
        else:
            # Plans exist but no selection - shouldn't happen normally
            log.info("➡️  Routing: Plans already exist → Waiting for selection")
            return "human_input"
    else:
        log.info("➡️  Routing: Missing inputs → Waiting for user input")
        return "human_input"  # END and wait for user


# ========================================
# BUILD GRAPH
# ========================================

log.info("🏗️  Initializing travel planning graph")

# Initialize graph
graph = StateGraph(TravelAgentState)

# Add nodes
graph.add_node("extract_parameters", extract_parameters_node)
graph.add_node("research_planning", research_planning_node)
graph.add_node("present_plans", present_plans_node)
graph.add_node("finalize_plan", finalize_plan_node)
graph.add_node("create_itinerary", create_itinerary_node)

# Set entry point
graph.set_entry_point("extract_parameters")

# Add conditional routing
graph.add_conditional_edges(
    "extract_parameters",
    route_after_extraction,
    {
        "research_planning": "research_planning",
        "finalize_plan": "finalize_plan",  # User selected a plan
        "human_input": END  # Wait for user to provide missing inputs
    }
)

# After research, present plans and wait for user selection
graph.add_edge("research_planning", "present_plans")

# After presenting plans, END and wait for user to select
graph.add_edge("present_plans", END)

# After finalization, create itinerary
graph.add_edge("finalize_plan", "create_itinerary")

# After itinerary creation, end
graph.add_edge("create_itinerary", END)

# Compile graph
log.info("✅ Travel planning graph compiled successfully")
travel_planning_graph = graph.compile()