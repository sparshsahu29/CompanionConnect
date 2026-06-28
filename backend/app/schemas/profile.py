from pydantic import BaseModel
from typing import Optional, List


class ProfileResponse(BaseModel):
    id: int
    fullname: str
    email: str
    age: Optional[int] = None
    city: Optional[str] = None
    interests: Optional[List[str]] = []
    profile_photo: Optional[str] = None

    model_config = {"from_attributes": True}


class ProfileUpdateRequest(BaseModel):
    fullName: Optional[str] = None
    age: Optional[int] = None
    city: Optional[str] = None
    interests: Optional[List[str]] = None
    profilePhoto: Optional[str] = None


class PhotoUploadResponse(BaseModel):
    url: str
