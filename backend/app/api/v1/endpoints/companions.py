from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.db.session import get_db
from app.schemas.companion import CompanionUpdateRequest, CompanionResponse
from app.services.companion_service import (
    get_all_companions,
    get_companion_by_id,
    get_companion_by_user_id,
    upsert_companion,
)
from app.utils.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/companions", tags=["Companions"])


@router.get("/all")
async def list_companions(
    db: AsyncSession = Depends(get_db),
    # ── Search & Filter query params ──────────────────────────────
    city: Optional[str] = Query(None, description="Filter by city (partial match)"),
    hobby: Optional[str] = Query(None, description="Filter by hobby/interest"),
    min_rate: Optional[float] = Query(None, description="Minimum hourly rate (₹/hr)"),
    max_rate: Optional[float] = Query(None, description="Maximum hourly rate (₹/hr)"),
    search: Optional[str] = Query(None, description="Full-text search: name, city, or interest"),
):
    """
    Return active companions with optional filters.

    Query params:
    - `city`     – e.g. `?city=Mumbai`
    - `hobby`    – e.g. `?hobby=Yoga`
    - `min_rate` – e.g. `?min_rate=15`
    - `max_rate` – e.g. `?max_rate=30`
    - `search`   – e.g. `?search=travel` (matches name, city, interests)
    """
    companions = await get_all_companions(
        db,
        city=city,
        hobby=hobby,
        min_rate=min_rate,
        max_rate=max_rate,
        search=search,
    )
    return companions


@router.get("/me")
async def get_my_companion_profile(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return the companion profile for the currently logged-in user."""
    return await get_companion_by_user_id(db, current_user.id)


@router.get("/{companion_id}")
async def get_companion(companion_id: int, db: AsyncSession = Depends(get_db)):
    """Return a single companion profile by ID (public endpoint)."""
    return await get_companion_by_id(db, companion_id)


@router.post("/update", status_code=status.HTTP_200_OK)
async def update_companion_profile(
    payload: CompanionUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create or update the logged-in user's companion profile (upsert)."""
    companion_dict, is_new = await upsert_companion(db, current_user.id, payload.model_dump(exclude_none=False))
    return {
        "message": "Companion profile created" if is_new else "Companion profile updated",
        "companion": companion_dict,
    }
