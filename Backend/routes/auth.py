from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, login_required
# Import your specific helper functions/models below
from services import create_user, authenticate_user


# Define the blueprint
auth_bp = Blueprint('auth', __name__)

# SIGN-UP
@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json() or {}

    fullname = data.get('fullName')
    email = data.get('email')
    password = data.get('password')

    if not fullname or not email or not password:
        return jsonify({
            "success": False,
            "message": "All fields are required"
        }), 400
    
    new_user = create_user(fullname, email, password)
    
    if not new_user:
        return jsonify({
            "success": False,
            "message": "Email already registered"
        }), 400

    login_user(new_user, remember=True)

    return jsonify({
        "success": True,
        "message": "User created",
        "user": {
            "id": new_user.id,
            "email": new_user.email
        }
    })

# LOGIN
@auth_bp.route('/login', methods=['POST', 'GET'])
def login():
    if request.method == "GET":
        return jsonify({"message": "Login required"}), 401
        
    data = request.get_json() or {}

    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({
            "success": False,
            "message": "Email and password required"
        }), 400

    user = authenticate_user(email, password)
    
    if user:
        login_user(user, remember=True)
        return jsonify({
            "success": True,
            "message": "Login successful",
            "user": {
                "id": user.id,
                "email": user.email
            }
        })
    else:
        return jsonify({
            "success": False,
            "message": "Invalid credentials"
        }), 401

# LOGOUT
@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({"success": True})