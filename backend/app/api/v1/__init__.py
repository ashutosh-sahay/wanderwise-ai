"""
API v1 routes
"""

from fastapi import APIRouter

from app.api.v1 import health, plan

router = APIRouter()

# Include sub-routers
router.include_router(health.router, tags=["health"])
router.include_router(plan.router, tags=["plan"])
