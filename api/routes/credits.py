"""
Carbon Credits API routes — credit listing and history.
"""
from fastapi import APIRouter, Query
from typing import Optional

router = APIRouter()


@router.get("/api/credits")
async def list_credits(
    status: Optional[str] = Query(None, description="Filter by status"),
    region_id: Optional[str] = Query(None, description="Filter by region"),
    limit: int = Query(50, ge=1, le=200)
):
    """List carbon credit records."""
    from demo_data import generate_credits
    credits = generate_credits(limit)

    if status:
        credits = [c for c in credits if c["status"] == status]
    if region_id:
        credits = [c for c in credits if c["region_id"] == region_id]

    return {"credits": credits, "total": len(credits)}


@router.get("/api/credits/history")
async def get_credit_history():
    """Get monthly credit generation/verification/retirement history."""
    from demo_data import generate_credit_history
    return {"history": generate_credit_history()}
