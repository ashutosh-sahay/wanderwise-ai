from typing import List
from langchain.agents.factory import create_agent
from langchain_openai import ChatOpenAI
from langchain_tavily import TavilySearch

from app.core.config import settings
from app.ai.prompts.research_pod.places_to_visit_agent import places_to_visit_agent_prompt
from app.models.research_pod import PlacesToVisit

from dotenv import load_dotenv

load_dotenv()

model = ChatOpenAI(
    model=settings.OPENAI_MODEL,
    api_key=settings.OPENAI_API_KEY,
    temperature=0.2,
    verbose=True,
)

tavily_search_tool = TavilySearch(
    max_results=7,
    topic="general",
    search_depth="advanced"
)

places_to_visit_agent = create_agent(
    model=model, 
    name="places_to_visit_agent", 
    system_prompt=places_to_visit_agent_prompt, 
    tools=[tavily_search_tool],
    response_format=PlacesToVisit
)

