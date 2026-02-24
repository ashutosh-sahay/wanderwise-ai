#!/usr/bin/env python3
"""
Interactive Travel Planning Script

This script allows you to interact with the travel planning graph in real-time.
You can provide inputs, see the AI's responses, and make selections interactively.

Usage:
python interactive_travel_planner.py
"""    

import asyncio
import sys
from typing import Optional
from pydantic import ValidationError

from app.ai.graph.graph import travel_planning_graph
from app.models.travel_agent import TravelAgentState
from app.utils.logger import get_logger

log = get_logger("interactive_travel_planner")


class InteractiveTravelPlanner:
    """Interactive session manager for travel planning graph."""
    
    def __init__(self):
        self.state: Optional[TravelAgentState] = None
        self.session_active = True
        
    def print_separator(self, char: str = "=", length: int = 80):
        """Print a visual separator."""
        print(char * length)
    
    def print_header(self, text: str):
        """Print a formatted header."""
        self.print_separator()
        print(f"  {text}")
        self.print_separator()
    
    def print_assistant_message(self, message: str):
        """Print assistant message with formatting."""
        print(f"\n🤖 Assistant: {message}\n")
    
    def print_plans(self, plans: dict):
        """Format and print travel plans."""
        self.print_header("🗺️  TRAVEL PLANS")
        
        for idx, (plan_name, plan_details) in enumerate(plans.items(), 1):
            print(f"\n{idx}. **{plan_name.upper()} PLAN**")
            print()
            
            # Places to visit
            if plan_details.places_to_visit and plan_details.places_to_visit.places_to_visit:
                print(f"   🎯 Places to Visit:")
                for place in plan_details.places_to_visit.places_to_visit[:5]:  # Show top 5
                    print(f"      • {place.name}")
                    print(f"        {place.description}")
                if len(plan_details.places_to_visit.places_to_visit) > 5:
                    print(f"      ... and {len(plan_details.places_to_visit.places_to_visit) - 5} more places")
                print()
            
            # Weather details
            if plan_details.weather_details:
                weather = plan_details.weather_details
                print(f"   🌤️  Weather Information:")
                print(f"      Current: {weather.current_weather_condition}, {weather.current_temperature}")
                print(f"      Best time to visit: {weather.best_time_to_visit}")
                print()
            
            # Transportation
            if plan_details.transportation_routes and plan_details.transportation_routes.routes:
                print(f"   🚗 Transportation Options:")
                for route in plan_details.transportation_routes.routes[:3]:  # Show top 3
                    print(f"      • {route.start_point} → {route.end_point}")
                    print(f"        Via {route.mode_of_transport} (~{route.duration})")
                if len(plan_details.transportation_routes.routes) > 3:
                    print(f"      ... and {len(plan_details.transportation_routes.routes) - 3} more routes")
                print()
            
            # Stay options
            if plan_details.stay_options and plan_details.stay_options.options:
                print(f"   🏨 Accommodation Options:")
                for stay in plan_details.stay_options.options[:3]:  # Show top 3
                    print(f"      • {stay.area} - {stay.type_of_stay}")
                    print(f"        Price: {stay.estimated_price_range}")
                    print(f"        {stay.rationale}")
                if len(plan_details.stay_options.options) > 3:
                    print(f"      ... and {len(plan_details.stay_options.options) - 3} more options")
                print()
            
            print()
        
        self.print_separator("-")
    
    def print_itinerary(self, itinerary):
        """Format and print day-by-day itinerary."""
        self.print_header("📅 YOUR DAY-BY-DAY ITINERARY")
        
        print(f"\n🌍 Destination: {itinerary.destination}")
        print(f"📆 Dates: {itinerary.start_date} to {itinerary.end_date}")
        print(f"⏱️  Duration: {itinerary.total_days} days")
        if itinerary.total_estimated_cost:
            print(f"💰 Estimated Total Cost: ${itinerary.total_estimated_cost:.2f}")
        
        print("\n" + "="*80 + "\n")
        
        # Print each day
        for day_plan in itinerary.daily_plans:
            print(f"📍 DAY {day_plan.day_number} - {day_plan.date}")
            print(f"   Theme: {day_plan.title}")
            print()
            
            # Print activities
            for activity in day_plan.activities:
                print(f"   🕐 {activity.time}")
                print(f"      {activity.activity_name}")
                print(f"      📝 {activity.description}")
                if activity.location:
                    print(f"      📍 Location: {activity.location}")
                if activity.estimated_cost:
                    print(f"      💵 Cost: ${activity.estimated_cost:.2f}")
                if activity.travel_time_from_previous:
                    print(f"      🚗 Travel time: {activity.travel_time_from_previous}")
                if activity.notes:
                    print(f"      💡 Note: {activity.notes}")
                print()
            
            # Day summary
            if day_plan.accommodation:
                print(f"   🏨 Accommodation: {day_plan.accommodation}")
            if day_plan.total_estimated_cost:
                print(f"   💰 Day Total: ${day_plan.total_estimated_cost:.2f}")
            if day_plan.notes:
                print(f"   📌 Notes: {day_plan.notes}")
            
            print("\n" + "-"*80 + "\n")
        
        # Packing suggestions
        if itinerary.packing_suggestions:
            print("🎒 PACKING SUGGESTIONS:")
            for item in itinerary.packing_suggestions:
                print(f"   • {item}")
            print()
        
        # Travel tips
        if itinerary.travel_tips:
            print("💡 TRAVEL TIPS:")
            for tip in itinerary.travel_tips:
                print(f"   • {tip}")
            print()
        
        print("\n✨ Your complete itinerary is ready! Have an amazing trip! ✈️🌍\n")
    
    def get_user_input(self, prompt: str = "You: ") -> str:
        """Get user input with error handling."""
        try:
            user_input = input(prompt).strip()
            if user_input.lower() in ['exit', 'quit', 'q']:
                self.session_active = False
                return ""
            return user_input
        except (EOFError, KeyboardInterrupt):
            print("\n\n👋 Session interrupted. Goodbye!")
            self.session_active = False
            return ""
    
    def initialize_state(self, user_query: str) -> TravelAgentState:
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
    
    def update_state_with_query(self, user_query: str) -> TravelAgentState:
        """Update existing state with new user query."""
        # Create updated state with new query
        state_dict = self.state.model_dump()
        state_dict['user_query'] = user_query
        state_dict['awaiting_user_input'] = False
        
        return TravelAgentState(**state_dict)
    
    async def run_graph_iteration(self, state: TravelAgentState) -> TravelAgentState:
        """
        Run one iteration of the graph.
        
        Returns:
            Updated state after graph execution
        """
        try:
            log.info("🚀 Starting graph iteration")
            
            # Invoke graph (async)
            result = await travel_planning_graph.ainvoke(state)
            
            # Convert result dict to TravelAgentState
            updated_state = TravelAgentState(**result)
            
            log.info(
                "✅ Graph iteration complete",
                awaiting_input=updated_state.awaiting_user_input,
                has_plans=updated_state.proposed_travel_plans is not None,
                has_final_plan=updated_state.accepted_travel_plan is not None
            )
            
            return updated_state
            
        except ValidationError as e:
            log.error("❌ State validation error", error=str(e))
            print(f"\n⚠️  Error: Invalid state - {e}\n")
            raise
        except Exception as e:
            log.error("❌ Graph execution error", error=str(e), error_type=type(e).__name__)
            print(f"\n⚠️  Error during graph execution: {e}\n")
            raise
    
    def display_state_update(self, state: TravelAgentState):
        """Display the latest state updates to user."""
        
        # Show latest assistant message from conversation history
        if state.conversation_history:
            last_message = state.conversation_history[-1]
            if last_message.get('role') == 'assistant':
                self.print_assistant_message(last_message.get('content', ''))
        
        # If plans are available and not yet displayed, show them
        if state.proposed_travel_plans and not state.selected_plan_name:
            self.print_plans(state.proposed_travel_plans.travel_plans)
        
        # If final plan is accepted, show summary
        if state.accepted_travel_plan and not state.day_by_day_itinerary:
            self.print_header("✅ FINAL TRAVEL PLAN")
            plan = state.accepted_travel_plan
            
            # Show destination and budget from state
            print(f"\n🎉 Your travel plan is finalized!\n")
            
            if state.travel_inputs:
                print(f"Destination: {state.travel_inputs.destination}")
                if state.travel_inputs.start_date and state.travel_inputs.end_date:
                    print(f"Duration: {state.travel_inputs.start_date} to {state.travel_inputs.end_date}")
                elif state.travel_inputs.travel_duration:
                    print(f"Duration: {state.travel_inputs.travel_duration} days")
                if state.travel_inputs.budget:
                    print(f"Budget: ${state.travel_inputs.budget}")
            
            print()
            
            # Show plan details
            if plan.places_to_visit and plan.places_to_visit.places_to_visit:
                print(f"📍 Key Places: {len(plan.places_to_visit.places_to_visit)} attractions")
            if plan.weather_details:
                print(f"🌤️  Weather: {plan.weather_details.current_weather_condition}")
            if plan.transportation_routes and plan.transportation_routes.routes:
                print(f"🚗 Transport: {len(plan.transportation_routes.routes)} options researched")
            if plan.stay_options and plan.stay_options.options:
                print(f"🏨 Stays: {len(plan.stay_options.options)} accommodation options")
            
            print(f"\n⏳ Creating your detailed day-by-day itinerary...\n")
            self.print_separator()
        
        # If itinerary is created, show it
        if state.day_by_day_itinerary:
            self.print_itinerary(state.day_by_day_itinerary)
            self.print_separator()
    
    async def start(self):
        """Start interactive session."""
        self.print_header("🌍 WanderWise AI - Interactive Travel Planner")
        print("\nWelcome! Let's plan your perfect trip.")
        print("(Type 'exit', 'quit', or 'q' to end the session)\n")
        self.print_separator("-")
        
        # Get initial user query
        print("\n💬 Tell me about your travel plans:")
        initial_query = self.get_user_input("You: ")
        
        if not initial_query or not self.session_active:
            print("\n👋 Goodbye!")
            return
        
        # Initialize state
        self.state = self.initialize_state(initial_query)
        
        # Main conversation loop
        while self.session_active:
            try:
                # Run graph iteration
                print("\n⏳ Processing...\n")
                self.state = await self.run_graph_iteration(self.state)
                
                # Display updates
                self.display_state_update(self.state)
                
                # Check if we're done
                if self.state.day_by_day_itinerary:
                    log.info("✅ Travel planning complete - itinerary created")
                    break
                
                # Check if waiting for user input
                if self.state.awaiting_user_input:
                    # Get next user input
                    user_query = self.get_user_input("\nYou: ")
                    
                    if not user_query or not self.session_active:
                        break
                    
                    # Update state with new query
                    self.state = self.update_state_with_query(user_query)
                else:
                    # Graph completed without waiting for input (shouldn't happen normally)
                    log.warning("Graph completed without awaiting input")
                    break
                    
            except KeyboardInterrupt:
                print("\n\n⏸️  Session paused. Type 'exit' to quit or continue chatting.")
                continue
            except Exception as e:
                log.error("❌ Unexpected error in main loop", error=str(e))
                print(f"\n⚠️  An error occurred: {e}")
                print("Would you like to continue? (y/n)")
                choice = self.get_user_input().lower()
                if choice != 'y':
                    break
        
        print("\n" + "="*80)
        print("  Thank you for using WanderWise AI! Safe travels! 🌍✈️")
        print("="*80 + "\n")


async def main():
    """Main entry point."""
    try:
        planner = InteractiveTravelPlanner()
        await planner.start()
    except Exception as e:
        log.error("❌ Fatal error", error=str(e))
        print(f"\n⚠️  Fatal error: {e}\n")
        sys.exit(1)


if __name__ == "__main__":
    # Run the async main function
    asyncio.run(main())
