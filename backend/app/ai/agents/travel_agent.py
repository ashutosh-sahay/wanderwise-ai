from langchain_openai import ChatOpenAI
from langchain.agents import create_agent
from app.core.config import settings
from app.ai.prompts.travel_agent import travel_agent_system_prompt
from app.models.travel_agent import TravelAgentResponse
from datetime import datetime
from langchain.tools import tool

@tool
def get_current_date_day() -> str:
    """Returns the current date and day of the week."""
    now = datetime.now()
    return now.strftime("Today is %A, %B %d, %Y.")


model = ChatOpenAI(
    model=settings.OPENAI_MODEL,
    api_key=settings.OPENAI_API_KEY,
    temperature=0.3,  # Slightly higher for better interaction with user
    verbose=True,
)

travel_agent = create_agent(
    model=model,
    name="travel_agent",
    tools=[get_current_date_day],
    system_prompt=travel_agent_system_prompt,
    response_format=TravelAgentResponse  # AI returns rich structured response
)
