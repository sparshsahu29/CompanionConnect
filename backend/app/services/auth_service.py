from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.user import User
from app.core.security import hash_password, verify_password
from app.core.exceptions import ConflictException, CredentialsException


async def create_user(db: AsyncSession, fullname: str, email: str, password: str) -> User:
    """Register a new user. Raises ConflictException if email is taken."""
    result = await db.execute(select(User).where(User.email == email))
    if result.scalar_one_or_none():
        raise ConflictException("Email already registered")

    new_user = User(
        fullname=fullname,
        email=email,
        password=hash_password(password),
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user


async def authenticate_user(db: AsyncSession, email: str, password: str) -> User:
    """Verify credentials and return user. Raises CredentialsException on failure."""
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(password, user.password):
        raise CredentialsException("Invalid email or password")

    return user
