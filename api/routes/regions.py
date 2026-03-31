"""
Regions API routes — forest region data and timeseries.
"""
from fastapi import APIRouter, Query
from typing import Optional

router = APIRouter()


@router.get("/api/regions")
async def list_regions(
    state: Optional[str] = Query(None, description="Filter by state"),
    status: Optional[str] = Query(None, description="Filter by status")
):
    """List all monitored forest regions with current stats."""
    from demo_data import generate_regions
    regions = generate_regions()

    if state:
        regions = [r for r in regions if r["state"].lower() == state.lower()]
    if status:
        regions = [r for r in regions if r["status"] == status]

    return {"regions": regions, "total": len(regions)}


@router.get("/api/region/{region_id}/timeseries")
async def get_region_timeseries(
    region_id: str,
    months: int = Query(24, ge=1, le=60, description="Number of months of history")
):
    """Get biomass/carbon/NDVI timeseries for a specific region."""
    from demo_data import generate_timeseries
    return generate_timeseries(region_id, months)
