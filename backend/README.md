# WanderWise AI - Travel Planning Agent System

AI-powered multi-agent travel planning system built with LangGraph and FastAPI.

## Prerequisites

- Python 3.11+
- OpenAI API key
- Tavily Search API key

## Setup

### 1. Create Virtual Environment

```bash
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```env
OPENAI_API_KEY=your-openai-api-key-here
TAVILY_API_KEY=your-tavily-api-key
```

## Running the Application

### Interactive CLI (Travel Planner)

Run the conversational travel planning interface:

```bash
source .venv/bin/activate  # Activate venv first
python interactive_travel_planner.py
```

Example interaction:

```
You: Plan a 4-day solo backpacking trip to Rishikesh under ₹15,000.
I love adventure sports and spiritual experiences.
Traveling from Delhi next weekend.
I prefer budget stays and local food.

[System researches and presents plan options]

You: Adventurous Plan

[System creates detailed day-by-day itinerary]
```

Commands:

- Type your travel requests naturally
- `exit`, `quit`, or `q` to exit

### API Server

Start the FastAPI server:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Or:

```bash
python main.py
```

Access:

- API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health Check: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

## Running Tests

Run all tests:

```bash
pytest tests/ -v
```

Run specific test file:

```bash
python tests/test_weather_agent.py
```

## Project Structure

```
backend/
├── interactive_travel_planner.py  # CLI interface
├── main.py                        # FastAPI entry point
├── requirements.txt               # Dependencies
├── .env                          # Your API keys (create this)
├── .env.example                  # Template
│
├── app/
│   ├── ai/                       # AI agents and graphs
│   │   ├── agents/              # Individual agents
│   │   ├── graph/               # LangGraph workflows
│   │   └── prompts/             # System prompts
│   ├── models/                  # Data models
│   ├── core/                    # Configuration
│   └── utils/                   # Utilities
│
└── tests/                        # Test suite
```

## Troubleshooting

**ModuleNotFoundError:**

```bash
PYTHONPATH=. python interactive_travel_planner.py
```

**Virtual environment not activated:**

```bash
source .venv/bin/activate  # You should see (.venv) in prompt
```

**API key errors:**

```bash
# Check if keys are set
cat .env | grep API_KEY
```

## Documentation

- `IMPROVEMENT_PLAN.md` - Enhancement roadmap
- `MERMAID.md` - System architecture mermaid code - copy and paste into mermaid editor to see different blocks

---

