import os
from fastapi import APIRouter, Depends, UploadFile, File, Request
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.profile import ProfileResponse, ProfileUpdateRequest, PhotoUploadResponse
from app.utils.dependencies import get_current_user
from app.utils.file_upload import save_upload_file
from app.models.user import User
from app.core.config import settings

router = APIRouter(prefix="/profile", tags=["Profile"])


@router.get("/me", response_model=ProfileResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    """Return the logged-in user's profile data."""
    interests = current_user.interests
    if isinstance(interests, str):
        interests = [i.strip() for i in interests.split(",")]
    elif interests is None:
        interests = []

    return ProfileResponse(
        id=current_user.id,
        fullname=current_user.fullname,
        email=current_user.email,
        age=current_user.age,
        city=current_user.city,
        interests=interests,
        profile_photo=current_user.profile_photo,
    )


@router.post("/update")
async def update_profile(
    payload: ProfileUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update one or more profile fields."""
    if payload.fullName is not None:
        current_user.fullname = payload.fullName
    if payload.age is not None:
        current_user.age = payload.age
    if payload.city is not None:
        current_user.city = payload.city
    if payload.interests is not None:
        current_user.interests = payload.interests
    if payload.profilePhoto is not None:
        current_user.profile_photo = payload.profilePhoto

    await db.commit()
    return {"message": "Profile updated successfully"}


@router.post("/upload-photo", response_model=PhotoUploadResponse)
async def upload_photo(
    request: Request,
    photo: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    """Upload a profile photo and return its public URL."""
    filename = await save_upload_file(photo)
    base_url = str(request.base_url).rstrip("/")
    url = f"{base_url}/api/v1/profile/uploads/{filename}"
    return PhotoUploadResponse(url=url)


@router.get("/uploads/{filename}")
async def serve_upload(filename: str):
    """Serve a previously uploaded file."""
    filepath = os.path.join(settings.UPLOAD_DIR, filename)
    if not os.path.exists(filepath):
        from app.core.exceptions import NotFoundException
        raise NotFoundException("File not found")
    return FileResponse(filepath)
