"""
Dashboard API routes — summary statistics and aggregations.
"""
from fastapi import APIRouter

router = APIRouter()


@router.get("/api/dashboard/summary")
async def get_dashboard_summary():
    """Get aggregated dashboard statistics."""
    from demo_data import generate_dashboard_summary
    return generate_dashboard_summary()


@router.get("/api/dashboard/activities")
async def get_recent_activities():
    """Get recent activity feed items."""
    from demo_data import generate_activities
    return {"activities": generate_activities(15)}
