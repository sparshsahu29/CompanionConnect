from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.auth import SignupRequest, LoginRequest, TokenResponse, AuthUserResponse
from app.services.auth_service import create_user, authenticate_user
from app.core.security import create_access_token
from app.utils.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(payload: SignupRequest, db: AsyncSession = Depends(get_db)):
    """Register a new user and return a JWT access token."""
    user = await create_user(
        db,
        fullname=payload.fullName,
        email=payload.email,
        password=payload.password,
    )
    token = create_access_token(data={"sub": str(user.id)})
    return {
        "success": True,
        "message": "Account created successfully",
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user.id, "email": user.email, "fullname": user.fullname},
    }


@router.post("/login")
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate user credentials and return a JWT access token."""
    user = await authenticate_user(db, email=payload.email, password=payload.password)
    token = create_access_token(data={"sub": str(user.id)})
    return {
        "success": True,
        "message": "Login successful",
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user.id, "email": user.email, "fullname": user.fullname},
    }


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """
    Stateless JWT logout — client simply discards the token.
    This endpoint exists so the frontend can call it symmetrically.
    """
    return {"success": True, "message": "Logged out successfully"}


@router.get("/me", response_model=AuthUserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Return the currently authenticated user's basic info."""
    return current_user
