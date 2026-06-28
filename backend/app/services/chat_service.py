from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.message import Message
from app.models.booking import Booking
from app.core.exceptions import NotFoundException, ForbiddenException


def message_to_dict(m: Message) -> dict:
    return {
        "id": m.id,
        "bookingId": m.booking_id,
        "senderId": m.sender_id,
        "content": m.content,
        "timestamp": m.timestamp.isoformat() if m.timestamp else None,
    }


async def get_messages(db: AsyncSession, booking_id: int, current_user_id: int) -> list[dict]:
    # Verify booking exists
    result = await db.execute(
        select(Booking)
        .options(selectinload(Booking.companion_profile))
        .where(Booking.id == booking_id)
    )
    booking = result.scalar_one_or_none()

    if not booking:
        raise NotFoundException("Booking session not found")

    # Verify user belongs to this booking
    companion_user_id = booking.companion_profile.user_id if booking.companion_profile else None
    if current_user_id != booking.client_id and current_user_id != companion_user_id:
        raise ForbiddenException("Unauthorized access to this conversation")

    # Fetch messages ordered oldest → newest
    msg_result = await db.execute(
        select(Message)
        .where(Message.booking_id == booking_id)
        .order_by(Message.timestamp.asc())
    )
    messages = msg_result.scalars().all()
    return [message_to_dict(m) for m in messages]


async def save_message(
    db: AsyncSession,
    booking_id: int,
    sender_id: int,
    content: str,
) -> dict:
    msg = Message(
        booking_id=booking_id,
        sender_id=sender_id,
        content=content,
    )
    db.add(msg)
    await db.commit()
    await db.refresh(msg)
    return message_to_dict(msg)
