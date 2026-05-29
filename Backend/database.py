from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin
from datetime import datetime, timezone


db = SQLAlchemy()
login_manager = LoginManager()


class User(UserMixin, db.Model):
    __tablename__ = 'user'
    
    id = db.Column(db.Integer, primary_key=True)
    fullname = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)
    age = db.Column(db.Integer)
    city = db.Column(db.String(120))
    interests = db.Column(db.JSON)
    profilePhoto = db.Column(db.String(500))

    # Explicit relationship pointing to Companion
    companion_profile = db.relationship('Companion', back_populates='user', uselist=False)


class Companion(db.Model, UserMixin):
    __tablename__ = 'companion'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))

    hourly_rate = db.Column(db.Float)
    available_dates = db.Column(db.JSON)
    available_time_slots = db.Column(db.JSON)
    is_active = db.Column(db.Boolean, default=True)

    # 1. Explicitly state the relationship back to User so joinedload works perfectly
    user = db.relationship('User', back_populates='companion_profile')

    # Relationship: Connects to bookings targeted at this companion profile
    bookings = db.relationship('Booking', back_populates='companion_profile', cascade="all, delete-orphan")

    # 2. Double-check that this function is inside THIS Companion class block!
    def to_dict(self):
        user_record = self.user
        return {
            "id": self.id,
            "userId": self.user_id,
            "hourlyRate": self.hourly_rate,
            "availableDates": self.available_dates if self.available_dates is not None else [],
            "availableTimeSlots": self.available_time_slots if self.available_time_slots is not None else [],
            "isActive": self.is_active,
            "fullName": getattr(user_record, 'fullname', 'Unknown'),
            "city": getattr(user_record, 'city', 'Not Specified'),
            "interests": getattr(user_record, 'interests', []) if getattr(user_record, 'interests', None) is not None else [],
            "profilePhoto": getattr(user_record, 'profilePhoto', None)
        }
    
class Booking(db.Model):
    __tablename__ = 'booking'

    id = db.Column(db.Integer, primary_key=True)
    
    # Who requested the service (Regular user account id)
    client_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Who is being hired (Target Companion record id)
    companion_id = db.Column(db.Integer, db.ForeignKey('companion.id'), nullable=False)
    
    # Booking Parameters
    booking_date = db.Column(db.String(100), nullable=False)       # e.g., "2026-06-15"
    time_slot = db.Column(db.String(100), nullable=False)          # e.g., "14:00 - 16:00"
    total_price = db.Column(db.Float, nullable=False)
    
    # Transaction Processing States: 'pending', 'accepted', 'rejected'
    status = db.Column(db.String(50), default='pending')
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships mapping
    client = db.relationship('User', foreign_keys=[client_id])
    companion_profile = db.relationship('Companion', foreign_keys=[companion_id], back_populates='bookings')

    def to_dict(self):
        return {
            "id": self.id,
            "clientId": self.client_id,
            "companionId": self.companion_id,
            "bookingDate": self.booking_date,
            "timeSlot": self.time_slot,
            "totalPrice": self.total_price,
            "status": self.status,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            
            # Displays the human details of the requester on the companion dashboard
            "clientName": self.client.fullname if self.client else "Unknown User"
        }
    
class Message(db.Model):
    __tablename__ = 'message'

    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey('booking.id'), nullable=False)
    sender_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships to pull context details quickly
    sender = db.relationship('User', foreign_keys=[sender_id])

    def to_dict(self):
        return {
            "id": self.id,
            "bookingId": self.booking_id,
            "senderId": self.sender_id,
            "content": self.content,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None
        }

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))