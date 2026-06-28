from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import Optional

from app.models.companion import Companion
from app.models.user import User
from app.core.exceptions import NotFoundException


# ──────────────────────────────────────────────
# Helper: serialize Companion → dict
# ──────────────────────────────────────────────
def companion_to_dict(c: Companion) -> dict:
    u = c.user
    return {
        "id": c.id,
        "userId": c.user_id,
        "fullName": getattr(u, "fullname", "Unknown"),
        "age": getattr(u, "age", None),
        "city": getattr(u, "city", None) or "Not Specified",
        "interests": getattr(u, "interests", []) or [],
        "profilePhoto": getattr(u, "profile_photo", None),
        "hourlyRate": c.hourly_rate,
        "availableDates": c.available_dates or [],
        "availableTimeSlots": c.available_time_slots or [],
        "isActive": c.is_active,
        "isMock": c.is_mock,
    }


# ──────────────────────────────────────────────
# Get all active companions with optional filters
# ──────────────────────────────────────────────
async def get_all_companions(
    db: AsyncSession,
    city: Optional[str] = None,
    hobby: Optional[str] = None,
    min_rate: Optional[float] = None,
    max_rate: Optional[float] = None,
    search: Optional[str] = None,
) -> list[dict]:
    stmt = (
        select(Companion)
        .options(selectinload(Companion.user))
        .where(Companion.is_active == True)  # noqa: E712
    )

    results = await db.execute(stmt)
    companions = results.scalars().all()

    output = [companion_to_dict(c) for c in companions]

    # ── Post-query filters (works cleanly with both real + mock data) ──

    if city:
        city_lower = city.strip().lower()
        output = [c for c in output if c["city"] and city_lower in c["city"].lower()]

    if hobby:
        hobby_lower = hobby.strip().lower()
        output = [
            c for c in output
            if any(hobby_lower in i.lower() for i in (c["interests"] or []))
        ]

    if min_rate is not None:
        output = [c for c in output if c["hourlyRate"] is not None and c["hourlyRate"] >= min_rate]

    if max_rate is not None:
        output = [c for c in output if c["hourlyRate"] is not None and c["hourlyRate"] <= max_rate]

    if search:
        s = search.strip().lower()
        output = [
            c for c in output
            if s in c["fullName"].lower()
            or s in (c["city"] or "").lower()
            or any(s in i.lower() for i in (c["interests"] or []))
        ]

    return output


# ──────────────────────────────────────────────
# Get single companion by ID
# ──────────────────────────────────────────────
async def get_companion_by_id(db: AsyncSession, companion_id: int) -> dict:
    stmt = (
        select(Companion)
        .options(selectinload(Companion.user))
        .where(Companion.id == companion_id)
    )
    result = await db.execute(stmt)
    companion = result.scalar_one_or_none()

    if not companion:
        raise NotFoundException("Companion not found")

    return companion_to_dict(companion)


# ──────────────────────────────────────────────
# Get companion by user_id (for logged-in companion)
# ──────────────────────────────────────────────
async def get_companion_by_user_id(db: AsyncSession, user_id: int) -> dict:
    stmt = (
        select(Companion)
        .options(selectinload(Companion.user))
        .where(Companion.user_id == user_id)
    )
    result = await db.execute(stmt)
    companion = result.scalar_one_or_none()

    if not companion:
        raise NotFoundException("Companion profile not found")

    return companion_to_dict(companion)


# ──────────────────────────────────────────────
# Upsert companion profile settings
# ──────────────────────────────────────────────
async def upsert_companion(db: AsyncSession, user_id: int, data: dict) -> tuple[dict, bool]:
    stmt = select(Companion).where(Companion.user_id == user_id)
    result = await db.execute(stmt)
    companion = result.scalar_one_or_none()

    is_new = companion is None
    if is_new:
        companion = Companion(user_id=user_id)
        db.add(companion)

    if "hourlyRate" in data and data["hourlyRate"] is not None:
        companion.hourly_rate = data["hourlyRate"]
    if "availableDates" in data and data["availableDates"] is not None:
        companion.available_dates = data["availableDates"]
    if "availableTimeSlots" in data and data["availableTimeSlots"] is not None:
        companion.available_time_slots = data["availableTimeSlots"]
    if "isActive" in data and data["isActive"] is not None:
        companion.is_active = data["isActive"]
    elif is_new:
        companion.is_active = True

    await db.commit()
    await db.refresh(companion)

    # Reload with user
    stmt2 = (
        select(Companion)
        .options(selectinload(Companion.user))
        .where(Companion.id == companion.id)
    )
    result2 = await db.execute(stmt2)
    companion = result2.scalar_one()

    return companion_to_dict(companion), is_new


# ──────────────────────────────────────────────
# Seed mock companion profiles (idempotent)
# ──────────────────────────────────────────────
MOCK_PROFILES = [
    {
        "fullname": "Aarav Sharma",
        "email": "aarav.mock@companionconnect.dev",
        "age": 26,
        "city": "Mumbai",
        "interests": ["Travel", "Photography", "Coffee"],
        "profile_photo": "https://picsum.photos/seed/aarav/400/500",
        "hourly_rate": 18.0,
        "available_dates": ["Mon", "Wed", "Fri"],
        "available_time_slots": ["10:00 AM - 1:00 PM", "4:00 PM - 8:00 PM"],
    },
    {
        "fullname": "Priya Kapoor",
        "email": "priya.mock@companionconnect.dev",
        "age": 24,
        "city": "Delhi",
        "interests": ["Yoga", "Cooking", "Art"],
        "profile_photo": "https://picsum.photos/seed/priya/400/500",
        "hourly_rate": 22.0,
        "available_dates": ["Tue", "Thu", "Sat"],
        "available_time_slots": ["9:00 AM - 12:00 PM", "2:00 PM - 6:00 PM"],
    },
    {
        "fullname": "Rohan Mehta",
        "email": "rohan.mock@companionconnect.dev",
        "age": 29,
        "city": "Bangalore",
        "interests": ["Gaming", "Music", "Hiking"],
        "profile_photo": "https://picsum.photos/seed/rohan/400/500",
        "hourly_rate": 15.0,
        "available_dates": ["Sat", "Sun"],
        "available_time_slots": ["11:00 AM - 3:00 PM", "5:00 PM - 9:00 PM"],
    },
    {
        "fullname": "Sneha Verma",
        "email": "sneha.mock@companionconnect.dev",
        "age": 27,
        "city": "Hyderabad",
        "interests": ["Books", "Dance", "Travel"],
        "profile_photo": "https://picsum.photos/seed/sneha/400/500",
        "hourly_rate": 20.0,
        "available_dates": ["Mon", "Tue", "Wed", "Thu"],
        "available_time_slots": ["10:00 AM - 2:00 PM"],
    },
    {
        "fullname": "Kabir Singh",
        "email": "kabir.mock@companionconnect.dev",
        "age": 31,
        "city": "Chennai",
        "interests": ["Fitness", "Cooking", "Movies"],
        "profile_photo": "https://picsum.photos/seed/kabir/400/500",
        "hourly_rate": 25.0,
        "available_dates": ["Wed", "Fri", "Sun"],
        "available_time_slots": ["8:00 AM - 12:00 PM", "6:00 PM - 10:00 PM"],
    },
    {
        "fullname": "Ananya Patel",
        "email": "ananya.mock@companionconnect.dev",
        "age": 23,
        "city": "Pune",
        "interests": ["Art", "Café Hopping", "Photography"],
        "profile_photo": "https://picsum.photos/seed/ananya/400/500",
        "hourly_rate": 17.0,
        "available_dates": ["Mon", "Thu", "Sat", "Sun"],
        "available_time_slots": ["12:00 PM - 4:00 PM", "6:00 PM - 9:00 PM"],
    },
    {
        "fullname": "Vikram Nair",
        "email": "vikram.mock@companionconnect.dev",
        "age": 34,
        "city": "Kolkata",
        "interests": ["Jazz", "Reading", "Chess"],
        "profile_photo": "https://picsum.photos/seed/vikram/400/500",
        "hourly_rate": 30.0,
        "available_dates": ["Tue", "Sat", "Sun"],
        "available_time_slots": ["3:00 PM - 7:00 PM"],
    },
    {
        "fullname": "Meera Iyer",
        "email": "meera.mock@companionconnect.dev",
        "age": 28,
        "city": "Mumbai",
        "interests": ["Dance", "Travel", "Foodie"],
        "profile_photo": "https://picsum.photos/seed/meera/400/500",
        "hourly_rate": 21.0,
        "available_dates": ["Mon", "Wed", "Fri", "Sun"],
        "available_time_slots": ["10:00 AM - 1:00 PM", "7:00 PM - 10:00 PM"],
    },
    {
        "fullname": "Arjun Bose",
        "email": "arjun.mock@companionconnect.dev",
        "age": 30,
        "city": "Delhi",
        "interests": ["Cycling", "Music", "Cooking"],
        "profile_photo": "https://picsum.photos/seed/arjun/400/500",
        "hourly_rate": 19.0,
        "available_dates": ["Mon", "Fri", "Sat"],
        "available_time_slots": ["9:00 AM - 12:00 PM", "4:00 PM - 7:00 PM"],
    },
    {
        "fullname": "Divya Rajput",
        "email": "divya.mock@companionconnect.dev",
        "age": 25,
        "city": "Jaipur",
        "interests": ["Trekking", "Poetry", "Painting"],
        "profile_photo": "https://picsum.photos/seed/divya/400/500",
        "hourly_rate": 16.0,
        "available_dates": ["Thu", "Fri", "Sat", "Sun"],
        "available_time_slots": ["11:00 AM - 3:00 PM"],
    },
    {
        "fullname": "Ishaan Grover",
        "email": "ishaan.mock@companionconnect.dev",
        "age": 32,
        "city": "Bangalore",
        "interests": ["Tech Talks", "Coffee", "Gaming"],
        "profile_photo": "https://picsum.photos/seed/ishaan/400/500",
        "hourly_rate": 28.0,
        "available_dates": ["Sat", "Sun"],
        "available_time_slots": ["2:00 PM - 6:00 PM", "8:00 PM - 11:00 PM"],
    },
    {
        "fullname": "Tanvi Mishra",
        "email": "tanvi.mock@companionconnect.dev",
        "age": 26,
        "city": "Hyderabad",
        "interests": ["Yoga", "Travel", "Reading"],
        "profile_photo": "https://picsum.photos/seed/tanvi/400/500",
        "hourly_rate": 23.0,
        "available_dates": ["Mon", "Tue", "Thu"],
        "available_time_slots": ["7:00 AM - 10:00 AM", "5:00 PM - 8:00 PM"],
    },
]


async def seed_mock_profiles(db: AsyncSession) -> int:
    """
    Seed mock companion profiles if they don't already exist.
    Returns the count of newly created profiles.
    """
    created = 0
    for profile in MOCK_PROFILES:
        # Check if mock user already exists
        result = await db.execute(select(User).where(User.email == profile["email"]))
        existing_user = result.scalar_one_or_none()

        if existing_user:
            continue  # Already seeded, skip

        # Create the mock User
        mock_user = User(
            fullname=profile["fullname"],
            email=profile["email"],
            password="mock_hashed_password_not_for_login",
            age=profile["age"],
            city=profile["city"],
            interests=profile["interests"],
            profile_photo=profile["profile_photo"],
        )
        db.add(mock_user)
        await db.flush()  # Get the user ID without full commit

        # Create the mock Companion profile
        mock_companion = Companion(
            user_id=mock_user.id,
            hourly_rate=profile["hourly_rate"],
            available_dates=profile["available_dates"],
            available_time_slots=profile["available_time_slots"],
            is_active=True,
            is_mock=True,
        )
        db.add(mock_companion)
        created += 1

    await db.commit()
    return created
