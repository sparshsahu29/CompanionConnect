import socketio
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import AsyncSessionLocal
from app.core.security import decode_access_token
from app.services.chat_service import save_message

# ──────────────────────────────────────────────
# Async Socket.IO server (ASGI mode)
# ──────────────────────────────────────────────
sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*",
    logger=False,
    engineio_logger=False,
)


def get_sio_app(fastapi_app):
    """Wrap FastAPI app with Socket.IO ASGI middleware."""
    return socketio.ASGIApp(sio, other_asgi_app=fastapi_app, socketio_path="/socket.io")


# ──────────────────────────────────────────────
# Helper: resolve user_id from token or default
# ──────────────────────────────────────────────
def resolve_user_id(token: str | None, fallback: int = 1) -> int:
    if not token:
        return fallback
    payload = decode_access_token(token)
    if payload and "sub" in payload:
        return int(payload["sub"])
    return fallback


# ──────────────────────────────────────────────
# Socket Events
# ──────────────────────────────────────────────

@sio.event
async def connect(sid: str, environ: dict, auth: dict = None):
    print(f"[WS] Client connected: {sid}")


@sio.event
async def disconnect(sid: str):
    print(f"[WS] Client disconnected: {sid}")


@sio.event
async def join(sid: str, data: dict):
    """Client joins a booking room to receive/send messages."""
    booking_id = data.get("bookingId")
    if not booking_id:
        await sio.emit("error", {"message": "bookingId required"}, to=sid)
        return

    room = f"booking_{booking_id}"
    await sio.enter_room(sid, room)
    print(f"[WS] {sid} joined room {room}")


@sio.event
async def send_message(sid: str, data: dict):
    """
    Persist message to DB and broadcast to the booking room.
    Expected payload: { bookingId, message, token? }
    """
    booking_id = data.get("bookingId")
    message_text = (data.get("message") or "").strip()
    token = data.get("token")

    if not booking_id or not message_text:
        await sio.emit("error", {"message": "bookingId and message are required"}, to=sid)
        return

    sender_id = resolve_user_id(token)
    room = f"booking_{booking_id}"

    async with AsyncSessionLocal() as db:
        try:
            saved = await save_message(db, booking_id=booking_id, sender_id=sender_id, content=message_text)
            await sio.emit("receive_message", saved, room=room)
            print(f"[WS] Message saved (id={saved['id']}) → room {room}")
        except Exception as e:
            print(f"[WS] ERROR saving message: {e}")
            await sio.emit("error", {"message": "Could not save message"}, to=sid)
