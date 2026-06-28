from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.chat import MessageResponse
from app.services.chat_service import get_messages
from app.utils.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.get("/{booking_id}")
async def fetch_messages(
    booking_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Fetch all chat messages for a booking session (ordered oldest → newest)."""
    messages = await get_messages(db, booking_id, current_user.id)
    return messages
