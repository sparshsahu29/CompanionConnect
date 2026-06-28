from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class BookingCreateRequest(BaseModel):
    bookingDate: str
    timeSlot: str
    totalPrice: float


class BookingResponse(BaseModel):
    id: int
    clientId: int
    companionId: int
    bookingDate: str
    timeSlot: str
    totalPrice: float
    status: str
    createdAt: Optional[str] = None
    clientName: Optional[str] = None

    model_config = {"from_attributes": True}
