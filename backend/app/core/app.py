"""
FastAPI application factory
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings


def create_app() -> FastAPI:
    """Create and configure FastAPI application."""
    
    app = FastAPI(
        title=settings.APP_NAME,
        description="AI-powered travel planning for the modern nomad",
        version=settings.APP_VERSION,
        debug=settings.DEBUG,
    )
    
    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Include routers
    from app.api.v1 import router as api_router
    app.include_router(api_router, prefix=settings.API_V1_PREFIX)
    
    return app
