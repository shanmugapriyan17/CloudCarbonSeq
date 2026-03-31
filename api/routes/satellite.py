"""
Satellite / NDVI API routes.
"""
from fastapi import APIRouter, Query
from typing import Optional

router = APIRouter()


@router.get("/api/satellite/ndvi")
async def get_ndvi_data(
    region_id: Optional[str] = Query(None, description="Filter by region ID")
):
    """Get NDVI measurement data for regions."""
    from demo_data import generate_ndvi_data
    data = generate_ndvi_data(region_id)
    return {"ndvi_data": data, "total": len(data)}
