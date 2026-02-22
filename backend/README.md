# WanderWise AI Backend

FastAPI backend server for WanderWise AI - an AI-powered travel planning application.

## Technology Stack

- **Python**: 3.12
- **Framework**: FastAPI 0.115.6
- **Server**: Uvicorn 0.34.0
- **Validation**: Pydantic 2.10.6
- **Settings**: Pydantic Settings 2.6.1

## Setup

### Prerequisites

- Python 3.12+
- pip

### Installation

1. Create and activate virtual environment:

```bash
python3.12 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

## Running the Server

### Development Mode

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Or simply:

```bash
python main.py
```

The API will be available at:
- **API**: http://localhost:8000
- **API Docs (Swagger)**: http://localhost:8000/docs
- **Alternative Docs (ReDoc)**: http://localhost:8000/redoc

## API Endpoints

### Root & Health
- **GET** `/api/v1/` - Welcome message and API status
- **GET** `/api/v1/health` - Health check endpoint

See API documentation at http://localhost:8000/docs for interactive API explorer.

## Project Structure

```
backend/
├── main.py              # FastAPI application entry point
├── requirements.txt     # Python dependencies
├── app/                 # Application package
│   ├── api/            # API routes and endpoints
│   │   └── v1/         # API version 1
│   │       └── health.py
│   ├── core/           # Core configuration
│   │   ├── config.py   # Settings
│   │   └── app.py      # App factory
│   ├── models/         # Data models
│   ├── services/       # Business logic
│   ├── ai/             # AI and agentic workflow (ready for implementations)
│   └── utils/          # Utilities
├── venv/               # Virtual environment (git-ignored)
└── README.md           # This file
```

See `app/README.md` for detailed structure documentation.

## Environment Variables

Currently no environment variables are required. When needed, create a `.env` file in this directory.

## CORS Configuration

The API is configured to accept requests from:
- `http://localhost:3000` (Frontend development server)

## Development

The server uses auto-reload in development mode, so changes to the code will automatically restart the server.
