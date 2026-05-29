# CompanionConnect Backend Setup Guide

This guide provides instructions on how to set up and run the Flask backend for the CompanionConnect platform. The frontend is configured to communicate with this backend at `http://localhost:5000/api`.

## Prerequisites

- Python 3.8 or higher
- pip (Python package installer)

## 1. Project Structure (Recommended)

It is recommended to keep your backend in a separate directory or a `backend/` folder within your project root.

```text
companion-connect/
├── frontend/ (This React app)
└── backend/
    ├── app.py
    ├── models.py
    ├── routes/
    └── requirements.txt
```

## 2. Setup Virtual Environment

Navigate to your backend directory and create a virtual environment:

```bash
cd backend
python -m venv venv

# Activate on Windows:
venv\Scripts\activate

# Activate on macOS/Linux:
source venv/bin/activate
```

## 3. Install Dependencies

Install the required Python packages:

```bash
pip install Flask Flask-Login Flask-Cors Flask-SQLAlchemy
```

*Note: You may also need `python-dotenv` for environment variable management.*

## 4. Backend Configuration (app.py)

Ensure your Flask app is configured to handle CORS and session cookies correctly for the React frontend.

```python
from flask import Flask
from flask_cors import CORS
from flask_login import LoginManager

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-very-secret-key'
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax' # Required for cross-origin cookies in some browsers
app.config['SESSION_COOKIE_SECURE'] = False   # Set to True in production with HTTPS

# CRITICAL: Configure CORS to allow the frontend URL and credentials
CORS(app, supports_credentials=True, origins=["http://localhost:3000"])

login_manager = LoginManager()
login_manager.init_app(app)

# Your routes and logic here...

if __name__ == '__main__':
    app.run(port=5000, debug=True)
```

## 5. Expected API Endpoints

The frontend expects the following API structure under the `/api` prefix:

### Authentication (`/api/auth`)
- `POST /login`: Authenticate user and start session.
- `POST /signup`: Create a new user account.
- `POST /logout`: End the current session.
- `GET /profile`: Get the currently logged-in user's basic info.

### Profile (`/api/profile`)
- `GET /me`: Get detailed profile of the current user.
- `POST /update`: Update profile information (age, city, interests, photo).

### Companions (`/api/companions`)
- `GET /`: List all active companions.
- `GET /<id>`: Get details for a specific companion.
- `POST /settings`: Update companion-specific settings (rate, availability).

### Bookings (`/api/bookings`)
- `POST /create/<companion_id>`: Create a new booking request.
- `GET /requests`: List booking requests for the logged-in companion.
- `POST /<booking_id>/accept`: Accept a booking.
- `POST /<booking_id>/decline`: Decline a booking.

### Chat (`/api/chat`)
- `GET /<booking_id>`: Fetch message history for a booking.
- `POST /<booking_id>/send`: Send a new message.

## 6. Running the Server

With your virtual environment activated, run:

```bash
python app.py
```

The backend will be available at `http://localhost:5000`. The frontend is already configured to point to this address.

## 7. Troubleshooting

- **CORS Errors**: Ensure `supports_credentials=True` is set in your `CORS()` configuration.
- **Session Issues**: If login doesn't persist, check that your browser is accepting cookies from `localhost:5000` and that `withCredentials: true` is set in the frontend Axios configuration (which it is).
