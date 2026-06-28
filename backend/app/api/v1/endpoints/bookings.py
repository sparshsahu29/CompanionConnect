from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.booking import BookingCreateRequest, BookingResponse
from app.services.booking_service import (
    create_booking,
    get_booking_requests,
    handle_booking_action,
)
from app.utils.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/bookings", tags=["Bookings"])


@router.post("/create/{companion_id}", status_code=status.HTTP_201_CREATED)
async def book_companion(
    companion_id: int,
    payload: BookingCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Send a booking request to a companion."""
    booking = await create_booking(
        db,
        companion_id=companion_id,
        client_id=current_user.id,
        booking_date=payload.bookingDate,
        time_slot=payload.timeSlot,
        total_price=payload.totalPrice,
    )
    return {"message": "Booking request sent successfully", "booking": booking}


@router.get("/requests")
async def incoming_booking_requests(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return all incoming bookings for the logged-in companion's profile."""
    return await get_booking_requests(db, current_user.id)


@router.post("/{booking_id}/{action}")
async def process_booking(
    booking_id: int,
    action: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Accept or reject a booking request. action must be 'accept' or 'reject'."""
    booking = await handle_booking_action(db, booking_id, action, current_user.id)
    return {
        "message": f"Booking {booking['status']} successfully",
        "booking": booking,
    }
