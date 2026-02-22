# Backend Application Structure

## Directory Overview

```
app/
├── __init__.py          # Package initialization
├── api/                 # API routes and endpoints
│   ├── __init__.py
│   └── v1/              # API version 1
│       ├── __init__.py  # Router aggregation
│       └── health.py    # Health check endpoints
├── core/                # Core configuration
│   ├── __init__.py
│   ├── config.py        # Application settings
│   └── app.py           # FastAPI app factory
├── models/              # Data models and schemas
│   └── __init__.py
├── services/            # Business logic services
│   └── __init__.py
├── ai/                  # AI and agentic workflow modules
│   └── __init__.py      # Ready for AI implementations
└── utils/               # Utility functions
    └── __init__.py
```

## Module Descriptions

### `api/` - API Routes
Contains all API endpoints organized by version.
- **v1/health.py**: Health check and root endpoints

### `core/` - Core Configuration
Application-wide configuration and setup.
- **config.py**: Settings loaded from environment variables
- **app.py**: FastAPI application factory

### `models/` - Data Models
Pydantic models for request/response validation.

### `services/` - Business Logic
Service layer for business logic and data processing.

### `ai/` - AI Modules
AI and agentic workflow modules. Ready for AI implementations.

### `utils/` - Utilities
Helper functions and utilities.

## Adding New Features

### Adding a New Endpoint

1. Create endpoint file in `app/api/v1/`:
```python
from fastapi import APIRouter

router = APIRouter()

@router.get("/example")
async def example():
    return {"message": "example"}
```

2. Include router in `app/api/v1/__init__.py`:
```python
from app.api.v1 import example
router.include_router(example.router, prefix="/example", tags=["example"])
```

### Adding AI Modules

Create new files in `app/ai/` for your AI implementations:
- Agent definitions
- LLM integrations
- RAG implementations
- Workflow orchestration

## Configuration

Settings are managed in `app/core/config.py` and can be overridden via environment variables or `.env` file.

## Running the Server

```bash
# Development
uvicorn main:app --reload

# Production
python main.py
```
