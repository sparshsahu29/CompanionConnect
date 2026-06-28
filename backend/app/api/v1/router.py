from fastapi import APIRouter

from app.api.v1.endpoints import auth, profile, companions, bookings, chat

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(profile.router)
api_router.include_router(companions.router)
api_router.include_router(bookings.router)
api_router.include_router(chat.router)
