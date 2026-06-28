from pydantic import BaseModel
from typing import Optional, List


class CompanionResponse(BaseModel):
    id: int
    userId: int
    fullName: str
    age: Optional[int] = None
    city: Optional[str] = None
    interests: List[str] = []
    profilePhoto: Optional[str] = None
    hourlyRate: Optional[float] = None
    availableDates: List[str] = []
    availableTimeSlots: List[str] = []
    isActive: bool = True
    isMock: bool = False

    model_config = {"from_attributes": True}


class CompanionUpdateRequest(BaseModel):
    hourlyRate: Optional[float] = None
    availableDates: Optional[List[str]] = None
    availableTimeSlots: Optional[List[str]] = None
    isActive: Optional[bool] = None


class CompanionListFilters(BaseModel):
    """Query params for filtering companions in the browse page."""
    city: Optional[str] = None
    hobby: Optional[str] = None
    min_rate: Optional[float] = None
    max_rate: Optional[float] = None
    search: Optional[str] = None
