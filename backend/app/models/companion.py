from sqlalchemy import Integer, Float, JSON, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional, List

from app.db.session import Base


class Companion(Base):
    __tablename__ = "companions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    hourly_rate: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    available_dates: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True)
    available_time_slots: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_mock: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    user: Mapped["User"] = relationship(  # noqa: F821
        "User", back_populates="companion_profile", lazy="selectin"
    )
    bookings: Mapped[List["Booking"]] = relationship(  # noqa: F821
        "Booking", back_populates="companion_profile", cascade="all, delete-orphan"
    )
