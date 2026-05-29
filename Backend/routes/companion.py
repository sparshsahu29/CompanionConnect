from flask import Blueprint, jsonify, request
from database import db, Companion

from sqlalchemy import select  # Add this import at the top of your file
from flask_login import current_user,login_required


companion_bp = Blueprint('companions', __name__)


@companion_bp.route('/update', methods=['POST'])
@login_required
def update_companion():
    try:
        # 1. Grab the JSON settings payload sent by your Axios request
        data = request.get_json() or {}

        # 2. Look up the database to see if this user already has a companion row
        stmt = select(Companion).filter_by(user_id=current_user.id)
        companion = db.session.execute(stmt).scalar_one_or_none()

        is_brand_new = False

        # 3. UPSERT LOGIC: If it doesn't exist, create it on the fly
        if not companion:
            companion = Companion(user_id=current_user.id)
            db.session.add(companion)
            is_brand_new = True

        # 4. Update the values. If a field isn't sent in 'settings', keep whatever is currently there.
        companion.hourly_rate = data.get("hourlyRate", companion.hourly_rate)
        
        # Using fallback lists [] ensures nothing breaks if the database records were empty/None
        companion.available_dates = data.get("availableDates", companion.available_dates or [])
        companion.available_time_slots = data.get("availableTimeSlots", companion.available_time_slots or [])
        
        # Default active status to True if creating, otherwise look for frontend toggle
        companion.is_active = data.get("isActive", True if is_brand_new else companion.is_active)

        # 5. Commit all modifications safely to the database
        db.session.commit()

        # 6. Respond back with standard metadata matching your setup
        return jsonify({
            "message": "Companion profile created successfully" if is_brand_new else "Companion updated successfully",
            "companion": companion.to_dict()
        }), 201 if is_brand_new else 200

    except Exception as e:
        # Emergency safety net: undo database changes if any validation or constraint errors pop up
        db.session.rollback()
        return jsonify({
            "error": str(e)
        }), 500


@companion_bp.route('/me', methods=['GET'])
@login_required
def get_my_companion():
    # Modern SQLAlchemy 2.0 query syntax
    stmt = select(Companion).filter_by(user_id=current_user.id)
    companion = db.session.execute(stmt).scalar_one_or_none()

    if not companion:
        return jsonify({
            "error": "Companion not found"
        }), 404

    # Clean, JSON-ready dictionary output sent back to React
    return jsonify(
        companion.to_dict()
    )


from sqlalchemy.orm import joinedload  # 👈 MAKE SURE TO ADD THIS IMPORT AT THE TOP!

@companion_bp.route('/all', methods=['GET'])
def get_all_companions():
    try:
        # 1. Fetch Companions and eagerly JOIN their User profiles in ONE single shot
        stmt = (
            select(Companion)
            .options(joinedload(Companion.user))  # This pulls user data right away
            .filter(Companion.is_active == True)
        )
        results = db.session.execute(stmt).scalars().all()
        
        # 2. Safely parse them into your dictionary array
        companions_list = [companion.to_dict() for companion in results]
        
        return jsonify(companions_list), 200
        
    except Exception as e:
        # If it still fails, this will now catch the exact reason why
        print(f"CRITICAL ERROR IN /all ENDPOINT: {str(e)}")  # This prints directly to your black terminal
        return jsonify({
            "error": "Failed to compile companion listings",
            "details": str(e)
        }), 500
