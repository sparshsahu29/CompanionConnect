from sqlalchemy import Integer, String, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional, List

from app.db.session import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    fullname: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(String(150), unique=True, index=True, nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    age: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    city: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    interests: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True)
    profile_photo: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # Relationships
    companion_profile: Mapped[Optional["Companion"]] = relationship(  # noqa: F821
        "Companion", back_populates="user", uselist=False, lazy="selectin"
    )
