from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from sqlalchemy import select
from database import db, Booking, Companion

booking_bp = Blueprint('bookings', __name__)

# ==============================================================================
# 1. CREATE BOOKING REQUEST
# Axios call: api.post(`/bookings/create/${companionId}`, bookingData)
# ==============================================================================
@booking_bp.route('/create/<int:companion_id>', methods=['POST'])
@login_required
def create_booking(companion_id):
    try:
        data = request.get_json() or {}

        # 1. Fetch target companion profile
        stmt = select(Companion).filter_by(id=companion_id)
        target_companion = db.session.execute(stmt).scalar_one_or_none()
        
        if not target_companion:
            return jsonify({"error": "Companion profile not found"}), 404
            
        # 2. Safety Rule: Prevent users from hiring themselves
        if target_companion.user_id == current_user.id:
            return jsonify({"error": "You cannot book your own companion profile"}), 400

        # 3. Formulate and stage new Booking record
        new_booking = Booking(
            client_id=current_user.id,
            companion_id=companion_id,
            booking_date=data.get("bookingDate"),
            time_slot=data.get("timeSlot"),
            total_price=float(data.get("totalPrice", 0.0))
        )

        db.session.add(new_booking)
        db.session.commit()

        return jsonify({
            "message": "Booking request sent successfully!",
            "booking": new_booking.to_dict()
        }), 201

    except ValueError:
        return jsonify({"error": "Invalid format passed into totalPrice"}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# ==============================================================================
# 2. GET INCOMING BOOKING REQUESTS (For the Companion Dashboard)
# Axios call: api.get('/bookings/requests')
# ==============================================================================
@booking_bp.route('/requests', methods=['GET'])
@login_required
def get_booking_requests():
    try:
        # 1. Find if the logged-in user even has a companion profile configured
        stmt_comp = select(Companion).filter_by(user_id=current_user.id)
        my_profile = db.session.execute(stmt_comp).scalar_one_or_none()

        # If they aren't registered as a companion, return an empty array gracefully
        if not my_profile:
            return jsonify([]), 200

        # 2. Pull all booking interactions targeting this companion profile
        stmt_bookings = (
            select(Booking)
            .filter_by(companion_id=my_profile.id)
            .order_by(Booking.created_at.desc())
        )
        results = db.session.execute(stmt_bookings).scalars().all()

        # 3. Map into array of serializable dictionaries
        return jsonify([booking.to_dict() for booking in results]), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ==============================================================================
# 3. ACCEPT / REJECT A REQUEST
# Axios call: api.post(`/bookings/${bookingId}/${action}`)
# ==============================================================================
@booking_bp.route('/<int:booking_id>/<string:action>', methods=['POST'])
@login_required
def handle_booking_request(booking_id, action):
    try:
        # 1. Enforce specific string actions to prevent payload exploitation
        if action not in ['accept', 'reject']:
            return jsonify({"error": "Invalid action parameter. Must be 'accept' or 'reject'."}), 400

        # 2. Fetch target booking transaction
        stmt = select(Booking).filter_by(id=booking_id)
        booking = db.session.execute(stmt).scalar_one_or_none()

        if not booking:
            return jsonify({"error": "Booking transaction record not found"}), 404

        # 3. Check ownership: Only the target Companion can alter this request status
        if booking.companion_profile.user_id != current_user.id:
            return jsonify({"error": "Unauthorized manipulation access denied"}), 403

        # 4. Process modification updates
        if action == 'accept':
            booking.status = 'accepted'
        elif action == 'reject':
            booking.status = 'rejected'

        db.session.commit()
        
        return jsonify({
            "message": f"Booking successfully {booking.status}!",
            "booking": booking.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500