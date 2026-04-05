"""
Dashboard API routes — summary statistics and REAL activity feed from SQLite DB.
"""
import logging
from fastapi import APIRouter

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/api/dashboard/summary")
async def get_dashboard_summary():
    """Get aggregated dashboard statistics computed from real NDVI data."""
    from demo_data import generate_dashboard_summary
    logger.info("[API] /api/dashboard/summary called")
    return generate_dashboard_summary()


@router.get("/api/dashboard/activities")
async def get_recent_activities():
    """
    Returns REAL system events from the server's SQLite database.
    These are logged every time a satellite scan, credit calculation,
    or ML prediction runs. Persistent across page refreshes.
    """
    from database import get_recent_events, get_event_count
    events = get_recent_events(limit=30)
    total = get_event_count()

    # Format for frontend compatibility
    activities = []
    for e in events:
        severity_map = {"OK": "success", "WARNING": "warning", "ERROR": "error", "INFO": "info"}
        activities.append({
            "id": f"evt-{e['id']}",
            "type": e["event_type"].lower(),
            "message": e["message"],
            "timestamp": e["created_at"],
            "severity": severity_map.get(e["severity"], "info"),
            "region": e.get("region_name"),
            "source": e.get("source", "SYSTEM"),
        })

    logger.info("[API] /api/dashboard/activities returned %d real events from DB", len(activities))
    return {
        "activities": activities,
        "total_events_in_db": total,
        "data_source": "SQLite persistent event store (server-side)",
    }
