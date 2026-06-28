from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.booking import Booking
from app.models.companion import Companion
from app.core.exceptions import NotFoundException, ForbiddenException, BadRequestException


def booking_to_dict(b: Booking) -> dict:
    return {
        "id": b.id,
        "clientId": b.client_id,
        "companionId": b.companion_id,
        "bookingDate": b.booking_date,
        "timeSlot": b.time_slot,
        "totalPrice": b.total_price,
        "status": b.status,
        "createdAt": b.created_at.isoformat() if b.created_at else None,
        "clientName": b.client.fullname if b.client else "Unknown",
    }


async def create_booking(
    db: AsyncSession,
    companion_id: int,
    client_id: int,
    booking_date: str,
    time_slot: str,
    total_price: float,
) -> dict:
    # Validate companion exists
    result = await db.execute(select(Companion).where(Companion.id == companion_id))
    companion = result.scalar_one_or_none()

    if not companion:
        raise NotFoundException("Companion not found")

    # Prevent self-booking
    if companion.user_id == client_id:
        raise BadRequestException("You cannot book your own companion profile")

    new_booking = Booking(
        client_id=client_id,
        companion_id=companion_id,
        booking_date=booking_date,
        time_slot=time_slot,
        total_price=total_price,
    )
    db.add(new_booking)
    await db.commit()
    await db.refresh(new_booking)

    # Reload with relationships
    result2 = await db.execute(
        select(Booking)
        .options(selectinload(Booking.client))
        .where(Booking.id == new_booking.id)
    )
    booking = result2.scalar_one()
    return booking_to_dict(booking)


async def get_booking_requests(db: AsyncSession, user_id: int) -> list[dict]:
    """Returns all bookings targeting the logged-in user's companion profile."""
    comp_result = await db.execute(
        select(Companion).where(Companion.user_id == user_id)
    )
    companion = comp_result.scalar_one_or_none()

    if not companion:
        return []

    result = await db.execute(
        select(Booking)
        .options(selectinload(Booking.client))
        .where(Booking.companion_id == companion.id)
        .order_by(Booking.created_at.desc())
    )
    bookings = result.scalars().all()
    return [booking_to_dict(b) for b in bookings]


async def handle_booking_action(
    db: AsyncSession,
    booking_id: int,
    action: str,
    current_user_id: int,
) -> dict:
    if action not in ("accept", "reject"):
        raise BadRequestException("Action must be 'accept' or 'reject'")

    result = await db.execute(
        select(Booking)
        .options(selectinload(Booking.client), selectinload(Booking.companion_profile))
        .where(Booking.id == booking_id)
    )
    booking = result.scalar_one_or_none()

    if not booking:
        raise NotFoundException("Booking not found")

    if booking.companion_profile.user_id != current_user_id:
        raise ForbiddenException("Only the companion can update this booking")

    booking.status = "accepted" if action == "accept" else "rejected"
    await db.commit()
    await db.refresh(booking)

    return booking_to_dict(booking)
