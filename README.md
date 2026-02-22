# WanderWise AI

> Autonomous travel planning for the modern nomad

WanderWise AI is an AI-powered web application that helps users plan their travel adventures with intelligent recommendations and personalized itineraries.

## Project Structure

This is a monorepo containing:

```
wanderwise-ai/
├── frontend/          # Next.js web application
├── backend/           # FastAPI server
└── README.md         # This file
```

## Technology Stack

### Frontend
- **Framework**: Next.js 16.1.6 (App Router)
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS 4
- **UI Library**: React 19.2.3

### Backend
- **Language**: Python 3.12
- **Framework**: FastAPI 0.115.6
- **Server**: Uvicorn 0.34.0
- **Validation**: Pydantic 2.10.6

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.12+
- pip

### Setup Instructions

#### 1. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at http://localhost:3000

#### 2. Backend Setup

```bash
cd backend
python3.12 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

The backend API will be available at http://localhost:8000

**API Documentation:**
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Development

Both frontend and backend support hot-reloading during development:

- **Frontend**: Changes to TypeScript/React files will automatically refresh
- **Backend**: Changes to Python files will automatically restart the server (when using `--reload`)

## Project Status

🚧 **Initial Setup Complete** - Basic scaffolding is ready. Features and components will be added incrementally.

## Documentation

For detailed information about each component:

- [Frontend Documentation](./frontend/README.md)
- [Backend Documentation](./backend/README.md)

## License

TBD

## Contributing

TBD
