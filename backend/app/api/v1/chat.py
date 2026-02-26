"""
Chat API endpoints for travel planning conversations
"""

from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.ai.graph.graph import travel_planning_graph
from app.models.travel_agent import TravelAgentState
from app.utils.logger import get_logger

log = get_logger("chat_api")

router = APIRouter()


class ChatMessageRequest(BaseModel):
    """Request model for chat message."""
    message: str
    conversation_state: Optional[dict] = None


class ChatMessageResponse(BaseModel):
    """Response model for chat message."""
    assistant_message: str
    awaiting_user_input: bool
    conversation_state: dict
    has_travel_plans: bool = False
    has_itinerary: bool = False
    travel_plans: Optional[dict] = None
    itinerary: Optional[dict] = None


def initialize_state(user_query: str) -> TravelAgentState:
    """Initialize graph state with user's first query."""
    return TravelAgentState(
        user_query=user_query,
        conversation_history=[],
        travel_inputs=None,
        all_required_inputs_present=False,
        proposed_travel_plans=None,
        selected_plan_name=None,
        accepted_travel_plan=None,
        awaiting_user_input=False
    )


def update_state_with_query(state_dict: dict, user_query: str) -> TravelAgentState:
    """Update existing state with new user query."""
    state_dict['user_query'] = user_query
    state_dict['awaiting_user_input'] = False
    return TravelAgentState(**state_dict)


@router.post("/chat/message", response_model=ChatMessageResponse)
async def send_message(request: ChatMessageRequest) -> ChatMessageResponse:
    """
    Process a user message and return AI response.
    
    This endpoint runs one iteration of the travel planning graph and returns
    the assistant's response message along with updated conversation state.
    """
    try:
        log.info(
            "📨 Received chat message",
            message_length=len(request.message),
            has_state=request.conversation_state is not None
        )
        
        # Initialize or restore state
        if request.conversation_state:
            try:
                state = update_state_with_query(
                    request.conversation_state.copy(),
                    request.message
                )
            except Exception as e:
                log.warning("Failed to restore state, initializing new", error=str(e))
                state = initialize_state(request.message)
        else:
            state = initialize_state(request.message)
        
        # Run graph iteration
        log.info("🚀 Running graph iteration")
        result = await travel_planning_graph.ainvoke(state)
        
        # Convert result dict to TravelAgentState
        updated_state = TravelAgentState(**result)
        
        # Extract assistant message from conversation history
        assistant_message = ""
        if updated_state.conversation_history:
            last_message = updated_state.conversation_history[-1]
            if last_message.get('role') == 'assistant':
                assistant_message = last_message.get('content', '')
        
        # Fallback: if no message in history, create a default response
        if not assistant_message:
            if updated_state.awaiting_user_input:
                assistant_message = "I'm waiting for your input. How can I help you plan your trip?"
            else:
                assistant_message = "I've processed your request. Let me know if you need anything else!"
        
        log.info(
            "✅ Graph iteration complete",
            awaiting_input=updated_state.awaiting_user_input,
            has_plans=updated_state.proposed_travel_plans is not None,
            has_itinerary=updated_state.day_by_day_itinerary is not None
        )
        
        # Extract travel plans and itinerary if available
        travel_plans = None
        if updated_state.proposed_travel_plans:
            # TravelPlan model has a 'travel_plans' field containing the actual dictionary
            travel_plans_dict = updated_state.proposed_travel_plans.travel_plans
            # Convert each TravelResearch to dict
            travel_plans = {
                plan_name: plan_data.model_dump() 
                for plan_name, plan_data in travel_plans_dict.items()
            }
        
        itinerary = None
        if updated_state.day_by_day_itinerary:
            itinerary = updated_state.day_by_day_itinerary.model_dump()
        
        # Prepare response
        return ChatMessageResponse(
            assistant_message=assistant_message,
            awaiting_user_input=updated_state.awaiting_user_input,
            conversation_state=updated_state.model_dump(),
            has_travel_plans=updated_state.proposed_travel_plans is not None,
            has_itinerary=updated_state.day_by_day_itinerary is not None,
            travel_plans=travel_plans,
            itinerary=itinerary
        )
        
    except Exception as e:
        log.error("❌ Error processing chat message", error=str(e), error_type=type(e).__name__)
        raise HTTPException(
            status_code=500,
            detail=f"Error processing message: {str(e)}"
        )
