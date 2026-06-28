from sqlalchemy import Integer, Float, String, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone
from typing import Optional

from app.db.session import Base


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    # Who requested the service
    client_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)

    # Which companion is being booked
    companion_id: Mapped[int] = mapped_column(Integer, ForeignKey("companions.id"), nullable=False)

    # Booking details
    booking_date: Mapped[str] = mapped_column(String(100), nullable=False)
    time_slot: Mapped[str] = mapped_column(String(100), nullable=False)
    total_price: Mapped[float] = mapped_column(Float, nullable=False)

    # Status: pending | accepted | rejected
    status: Mapped[str] = mapped_column(String(50), default="pending", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    client: Mapped["User"] = relationship(  # noqa: F821
        "User", foreign_keys=[client_id], lazy="selectin"
    )
    companion_profile: Mapped[Optional["Companion"]] = relationship(  # noqa: F821
        "Companion", foreign_keys=[companion_id], back_populates="bookings", lazy="selectin"
    )
