from langchain_openai import ChatOpenAI
from langchain.agents import create_agent
from app.core.config import settings
from app.ai.prompts.research_pod.research_synthesizer import research_synthesizer_prompt
from app.models.research_pod import TravelPlan


model = ChatOpenAI(
    model=settings.OPENAI_MODEL,
    api_key=settings.OPENAI_API_KEY,
    temperature=0.3,  # Slightly higher for creative plan variants
    verbose=True,
)

research_synthesizer_agent = create_agent(
    model=model,
    name="research_synthesizer",
    system_prompt=research_synthesizer_prompt,
    response_format=TravelPlan
)