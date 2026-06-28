"""
Entrypoint for CompanionConnect FastAPI backend.

Run with:
    uvicorn main:app --reload --port 8000
"""
from app.main import app as fastapi_app
from app.sockets import get_sio_app

# Wrap FastAPI with Socket.IO ASGI middleware
# Socket.IO handles /socket.io/* — everything else goes to FastAPI
app = get_sio_app(fastapi_app)
