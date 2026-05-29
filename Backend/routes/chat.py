from flask import Blueprint, jsonify
from flask_login import login_required, current_user
from sqlalchemy import select
from database import db, Message, Booking

chat_bp = Blueprint('chat', __name__)

# ==============================================================================
# KEEP THIS: Fetch historical messages when the chat window first loads
# Axios hook: getMessages(bookingId) in Chat.jsx
# ==============================================================================
@chat_bp.route('/<int:booking_id>', methods=['GET'])
@login_required
def get_messages(booking_id):
    try:
        # 1. Security Check: Verify the booking exists
        stmt = select(Booking).filter_by(id=booking_id)
        booking = db.session.execute(stmt).scalar_one_or_none()

        if not booking:
            return jsonify({"error": "Booking session not found"}), 404

        # 2. Security Check: Verify the logged-in user belongs to this chat
        if current_user.id != booking.client_id and current_user.id != booking.companion_profile.user_id:
            return jsonify({"error": "Unauthorized access to this conversation channel"}), 403

        # 3. Fetch history: Ordered from oldest to newest so it reads naturally
        msg_stmt = select(Message).filter_by(booking_id=booking_id).order_by(Message.timestamp.asc())
        results = db.session.execute(msg_stmt).scalars().all()

        return jsonify([msg.to_dict() for msg in results]), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500