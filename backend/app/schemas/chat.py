from pydantic import BaseModel
from typing import Optional


class MessageResponse(BaseModel):
    id: int
    bookingId: int
    senderId: int
    content: str
    timestamp: Optional[str] = None

    model_config = {"from_attributes": True}
