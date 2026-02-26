"""
Itinerary Planner Agent - Creates detailed day-by-day travel itineraries.

This agent takes a selected travel plan and generates a comprehensive daily itinerary
that organizes all researched places, activities, and logistics into a practical schedule.
"""
from langchain.agents import create_agent
from langchain_openai import ChatOpenAI

from app.ai.prompts.itinerary_planner import itinerary_planner_prompt
from app.core.config import settings
from app.models.travel_agent import DayByDayItinerary

from dotenv import load_dotenv

load_dotenv()

model = ChatOpenAI(
    model=settings.OPENAI_MODEL,
    api_key=settings.OPENAI_API_KEY,
    temperature=0.2,
    verbose=True,
)

itinerary_planner_agent = create_agent(
    model=model,
    name="itinerary_planner",
    system_prompt=itinerary_planner_prompt,
    response_format=DayByDayItinerary
)
