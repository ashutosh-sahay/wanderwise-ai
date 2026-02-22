"""
Health check endpoints
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health_check() -> dict[str, str]:
    """Health check endpoint."""
    return {"status": "healthy"}


@router.get("/")
async def root() -> dict[str, str]:
    """Root endpoint returning API status."""
    return {
        "message": "Welcome to WanderWise AI API",
        "status": "active",
        "version": "0.1.0"
    }
