from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO

# 1. Database and Auth Core Configurations
from database import db, login_manager, User  # Pulling the single instance directly

# 2. Router/Blueprint Component Registrations
from routes.chat import chat_bp 
from routes.companion import companion_bp
from routes.booking import booking_bp
from routes.auth import auth_bp
from routes.profile import profile_bp

# 3. Socket Event Initializer Blueprint
from routes.chat_sockets import init_chat_sockets

# Initialize Core App Foundations
app = Flask(__name__)
app.config["UPLOAD_FOLDER"] = "uploads"

# Database Configuration Context
app.config['SECRET_KEY'] = 'skey'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Stateful Session Cookie Configuration
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax' 
app.config['SESSION_COOKIE_SECURE'] = False 

# Enable Cross-Origin Resource Sharing for React Frontend
CORS(app, origins=["http://localhost:3000"], supports_credentials=True)

# Register System Blueprints
app.register_blueprint(companion_bp, url_prefix='/api/companions')
app.register_blueprint(booking_bp, url_prefix='/api/bookings')
app.register_blueprint(chat_bp, url_prefix='/api/chat')
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(profile_bp, url_prefix='/api/profile')

# Bind Core Extension Engines
db.init_app(app)
login_manager.init_app(app) # 💡 Reuses the imported instance directly without redefining it

@login_manager.user_loader
def load_user(user_id):
    return db.session.get(User, int(user_id))

# Initialize WebSockets Engine
socketio = SocketIO(app, cors_allowed_origins="*")
init_chat_sockets(socketio)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
       
    socketio.run(app, debug=True, port=5000)



















