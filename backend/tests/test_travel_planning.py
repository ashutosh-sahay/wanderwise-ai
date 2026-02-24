"""
Quick Manual Test for Travel Planning Graph.

A simplified test for rapid development and debugging.
Tests real-world scenarios with Indian travel queries.

Run with: python -m tests.test_travel_planning_quick
"""

import asyncio
import json
from app.ai.graph.graph import travel_planning_graph, TravelInputs


async def test_complete_info():
    """
    Test with complete information - Rishikesh adventure trip.
    User provides all required details upfront.
    """
    print("\n" + "="*80)
    print(" TEST 1: Complete Information - Rishikesh Adventure Trip")
    print("="*80 + "\n")
    
    print("📝 Scenario: User provides all required info in first message\n")
    
    state = {
        "user_query": """Plan a 4-day solo backpacking trip to Rishikesh under ₹15,000.
I love adventure sports and spiritual experiences.
Traveling from Delhi next weekend.
I prefer budget stays and local food.""",
        "conversation_history": [],
        "travel_inputs": None,
        "all_required_inputs_present": False,
        "awaiting_user_input": False
    }
    
    print("🔹 STEP 1: Initial Invocation")
    print("-" * 80)
    print(f"User Query:\n{state['user_query']}\n")
    
    try:
        print("Invoking graph...")
        result = await travel_planning_graph.ainvoke(state)
        
        print("\n📊 Result:")
        print(json.dumps({
            "all_required_inputs_present": result.get("all_required_inputs_present"),
            "awaiting_user_input": result.get("awaiting_user_input"),
            "has_proposed_plans": result.get("proposed_travel_plans") is not None,
            "selected_plan_name": result.get("selected_plan_name"),
            "has_accepted_plan": result.get("accepted_travel_plan") is not None
        }, indent=2))
        
        if result.get("travel_inputs"):
            inputs = result["travel_inputs"]
            print(f"\n📍 Extracted Travel Inputs:")
            print(f"  • Destination: {inputs.destination or 'NOT SET'}")
            print(f"  • Source: {inputs.source or 'NOT SET'}")
            print(f"  • Budget: ₹{inputs.budget or 'NOT SET'}")
            print(f"  • Duration: {inputs.travel_duration or 'NOT SET'} days")
            print(f"  • Travel Type: {inputs.travel_type or 'NOT SET'}")
            print(f"  • Travel Vibe: {inputs.travel_vibe or 'NOT SET'}")
        
        # Show last message from conversation
        if result.get("conversation_history"):
            last_msg = result["conversation_history"][-1]
            print(f"\n💬 AI Response:")
            print(f"  {last_msg.get('content', '')[:200]}...")
        
        if result.get("proposed_travel_plans"):
            print(f"\n📋 Proposed Travel Plans:")
            plans = result["proposed_travel_plans"].travel_plans
            for plan_name in plans.keys():
                print(f"  • {plan_name.title()}")
            
            # Simulate user selection
            print("\n\n🔹 STEP 2: User Selects Plan")
            print("-" * 80)
            
            selected = list(plans.keys())[0]
            print(f"User selects: {selected}\n")
            
            result["selected_plan_name"] = selected
            result["user_query"] = f"I'll go with the {selected} plan"
            
            print("Resuming graph...")
            final_result = await travel_planning_graph.ainvoke(result)
            
            print("\n📊 Final Result:")
            print(json.dumps({
                "selected_plan_name": final_result.get("selected_plan_name"),
                "has_accepted_plan": final_result.get("accepted_travel_plan") is not None,
                "awaiting_user_input": final_result.get("awaiting_user_input")
            }, indent=2))
            
            if final_result.get("accepted_travel_plan"):
                print("\n🎉 SUCCESS! Travel plan finalized!")
                print("\n✅ Test Result: PASS")
            else:
                print("\n⚠️  Plan not finalized")
                print("\n❌ Test Result: FAIL")
        
        elif not result.get("all_required_inputs_present"):
            print("\n⚠️  Missing required inputs - graph paused")
            print("   Expected: All inputs present")
            print("\n❌ Test Result: FAIL - Should have proceeded to research")
        
        print("\n" + "="*80)
        print(" Test Complete")
        print("="*80 + "\n")
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        print("\n❌ Test Result: FAIL")


async def test_partial_info():
    """
    Test with partial information - Goa weekend getaway.
    Missing: source, dates, travel preferences.
    """
    print("\n" + "="*80)
    print(" TEST 2: Partial Information - Goa Weekend Getaway")
    print("="*80 + "\n")
    
    print("📝 Scenario: User provides incomplete info (missing source, dates)\n")
    
    state = {
        "user_query": "Plan a weekend getaway to Goa within ₹15,000",
        "conversation_history": [],
        "travel_inputs": None,
        "all_required_inputs_present": False,
        "awaiting_user_input": False
    }
    
    print("🔹 STEP 1: Initial Query (Incomplete)")
    print("-" * 80)
    print(f"User Query: {state['user_query']}\n")
    
    try:
        print("Invoking graph...")
        result = await travel_planning_graph.ainvoke(state)
        
        print("\n📊 Result:")
        print(f"  • All Inputs Present: {result.get('all_required_inputs_present')}")
        print(f"  • Awaiting User Input: {result.get('awaiting_user_input')}")
        
        if result.get("travel_inputs"):
            inputs = result["travel_inputs"]
            print(f"\n📍 Extracted So Far:")
            print(f"  • Destination: {inputs.destination or 'NOT SET'}")
            print(f"  • Source: {inputs.source or 'NOT SET'}")
            print(f"  • Budget: ₹{inputs.budget if inputs.budget else 'NOT SET'}")
            print(f"  • Dates: {inputs.start_date or 'NOT SET'}")
        
        # Show AI's request for missing info
        if result.get("conversation_history"):
            last_msg = result["conversation_history"][-1]
            print(f"\n💬 AI Asks For:")
            print(f"  {last_msg.get('content', '')}")
        
        if not result.get("all_required_inputs_present"):
            print("\n✅ Graph correctly paused for missing inputs!")
            
            # Simulate providing complete info
            print("\n\n🔹 STEP 2: Providing Complete Information")
            print("-" * 80)
            
            follow_up_query = "From Mumbai, leaving this Friday returning Sunday. I love beaches and water sports."
            print(f"User says: {follow_up_query}\n")
            
            result["user_query"] = follow_up_query
            
            print("Resuming graph with complete info...")
            result2 = await travel_planning_graph.ainvoke(result)
            
            print("\n📊 Result After Complete Info:")
            print(f"  • All Inputs Present: {result2.get('all_required_inputs_present')}")
            print(f"  • Has Proposed Plans: {result2.get('proposed_travel_plans') is not None}")
            print(f"  • Awaiting User Input: {result2.get('awaiting_user_input')}")
            
            if result2.get("travel_inputs"):
                inputs = result2["travel_inputs"]
                print(f"\n📍 Complete Travel Inputs:")
                print(f"  • Destination: {inputs.destination or 'NOT SET'}")
                print(f"  • Source: {inputs.source or 'NOT SET'}")
                print(f"  • Budget: ₹{inputs.budget or 'NOT SET'}")
                print(f"  • Dates: {inputs.start_date or 'NOT SET'} to {inputs.end_date or 'NOT SET'}")
                print(f"  • Travel Vibe: {inputs.travel_vibe or 'NOT SET'}")
            
            if result2.get("proposed_travel_plans"):
                print("\n✅ Research completed! Plans generated after providing complete info.")
                print("\n✅ Test Result: PASS")
            elif result2.get("all_required_inputs_present"):
                print("\n⚠️  All inputs present but no plans generated yet")
                print("   (May need to proceed through graph)")
                print("\n⚠️  Test Result: PARTIAL PASS")
            else:
                print("\n⚠️  Still missing some inputs")
                print("\n❌ Test Result: FAIL")
        else:
            print("\n⚠️  Unexpected: Graph did not pause for missing info")
            print("\n❌ Test Result: FAIL")
        
        print("\n" + "="*80)
        print(" Test Complete")
        print("="*80 + "\n")
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        print("\n❌ Test Result: FAIL")


def main():
    """Main entry point."""
    print("\n" + "="*80)
    print(" TRAVEL PLANNING GRAPH - REAL-WORLD TESTS")
    print("="*80)
    print("\nTesting with actual Indian travel scenarios:")
    print("  1. Complete Info: Rishikesh adventure trip")
    print("  2. Partial Info: Goa weekend getaway")
    print("\n" + "="*80 + "\n")
    
    print("\nSelect test to run:")
    print("1. Complete Info Test (Rishikesh) - default")
    print("2. Partial Info Test (Goa)")
    print("3. Run Both Tests")
    
    choice = input("\nEnter choice (1, 2, or 3): ").strip() or "1"
    
    if choice == "2":
        asyncio.run(test_partial_info())
    elif choice == "3":
        asyncio.run(test_complete_info())
        print("\n\n")
        asyncio.run(test_partial_info())
    else:
        asyncio.run(test_complete_info())


if __name__ == "__main__":
    main()
