"""
Test script for places_to_visit_agent.

This script tests the places_to_visit_agent standalone to verify it works correctly.
"""
import asyncio
import json
from langchain_core.messages import AIMessage
from app.ai.agents.research_pod.places_to_visit_agent import places_to_visit_agent
from app.ai.prompts.research_pod.places_to_visit_agent import places_to_visit_agent_prompt


async def test_places_agent(destination: str):
    """
    Test the places_to_visit_agent with a given destination.
    
    Args:
        destination: The travel destination to search for places to visit.
    """
    try:
        print(f"\n{'='*60}")
        print(f"Testing Places to Visit Agent for: {destination}")
        print(f"{'='*60}\n")
        
        # Invoke the agent
        print("Invoking agent...")
        result = await places_to_visit_agent.ainvoke({
            "messages": [f"Find places to visit in {destination}"]
        })
        
        print("\n" + "="*60)
        print("RESULTS:")
        print("="*60 + "\n")
        
        # Print only LLM outputs in JSON format
        if "messages" in result:
            for message in result["messages"]:
                # Only display AIMessage (LLM output), skip ToolMessage
                if isinstance(message, AIMessage):
                    print(f"\nLLM Output (Structured JSON):")
                    print("-" * 60)
                    
                    # Parse and pretty-print the structured output
                    if hasattr(message, 'content') and message.content:
                        try:
                            # If content is already a dict/object, convert to JSON
                            if isinstance(message.content, str):
                                # Try to parse if it's a JSON string
                                try:
                                    parsed_content = json.loads(message.content)
                                    print(json.dumps(parsed_content, indent=2, ensure_ascii=False))
                                except json.JSONDecodeError:
                                    # If not JSON, just print as is
                                    print(message.content)
                            else:
                                # If it's already a Python object, convert to JSON
                                print(json.dumps(message.content, indent=2, ensure_ascii=False))
                        except Exception as e:
                            # Fallback to raw content
                            print(message.content)
                    print("-" * 60)
        else:
            print(result)
        
        return result
        
    except Exception as e:
        print(f"\n❌ Error testing agent: {str(e)}")
        import traceback
        traceback.print_exc()
        return None


def main():
    """Main entry point for testing."""
    # Test with a sample destination
    test_destination = "Rishikesh, India"
    
    print("\n" + "="*60)
    print("PLACES TO VISIT AGENT - STANDALONE TEST")
    print("="*60)
    print(f"\nAgent System Prompt:\n{places_to_visit_agent_prompt}\n")
    
    # Run the async test
    result = asyncio.run(test_places_agent(test_destination))
    
    if result:
        print("\n" + "="*60)
        print("✅ Test completed successfully!")
        print("="*60 + "\n")
    else:
        print("\n" + "="*60)
        print("❌ Test failed!")
        print("="*60 + "\n")


if __name__ == "__main__":
    main()
