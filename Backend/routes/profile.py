import os
import uuid
from flask import Blueprint, request, jsonify, send_from_directory, current_app
from flask_login import login_required, current_user
from database import db # Import your SQLAlchemy db instance

profile_bp = Blueprint('profile', __name__)

# Helper to check file extensions
def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# GET PROFILE
@profile_bp.route("/me", methods=["GET"])
@login_required
def get_my_profile():
    interests = current_user.interests

    if isinstance(interests, str):
        interests = interests.split(",")
    elif interests is None:
        interests = []

    return jsonify({
        "fullname": current_user.fullname,
        "age": current_user.age,
        "city": current_user.city,
        "interests": interests,
        "profilePhoto": current_user.profilePhoto
    })

# UPDATE PROFILE
@profile_bp.route("/update", methods=["POST"])
@login_required
def update_profile():
    data = request.json or {}

    if "fullName" in data:
        current_user.fullname = data["fullName"]
    if "age" in data:
        current_user.age = data["age"]
    if "city" in data:
        current_user.city = data["city"]
    if "interests" in data:
        current_user.interests = data["interests"] 
    if "profilePhoto" in data:
        current_user.profilePhoto = data["profilePhoto"]

    db.session.commit()
    return jsonify({"message": "Profile updated successfully"})

# UPLOAD PHOTO
@profile_bp.route("/upload-photo", methods=["POST"])
@login_required  # Good practice to require login for image assets
def upload_photo():
    if "photo" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["photo"]

    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    if file and allowed_file(file.filename):
        ext = file.filename.rsplit(".", 1)[1].lower()
        filename = f"{uuid.uuid4()}.{ext}"

        # Use current_app context wrapper to pull dynamic server filepaths safely
        filepath = os.path.join(current_app.config["UPLOAD_FOLDER"], filename)
        file.save(filepath)

        image_url = f"http://localhost:5000/api/profile/uploads/{filename}"

        return jsonify({
            "url": image_url
        })

    return jsonify({"error": "Invalid file type"}), 400

# SERVE UPLOADED IMAGES
@profile_bp.route("/uploads/<filename>")
def uploaded_file(filename):
    return send_from_directory(current_app.config["UPLOAD_FOLDER"], filename)