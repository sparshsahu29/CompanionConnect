from flask_socketio import emit, join_room
from flask_login import current_user
from database import db, Message

def init_chat_sockets(socketio):
    """Binds all production WebSocket event listeners to the active server instance."""
    
    # ==========================================
    # 1. JOIN ROOM EVENT
    # ==========================================
    @socketio.on('join')
    def on_join(data):
        # Validate payload
        booking_id = data.get('bookingId')
        if not booking_id:
            emit('error', {'message': 'bookingId is required to join a room.'})
            return

        # Join the specific booking room
        room = f"booking_{booking_id}"
        join_room(room)
        print(f"🚪 Real-Time Chat: User joined room -> {room}")


    # ==========================================
    # 2. SEND MESSAGE EVENT
    # ==========================================
    @socketio.on('send_message')
    def handle_send_message(data):
        # 1. Extract and validate data
        booking_id = data.get('bookingId')
        message_text = data.get('message', '').strip()
        
        if not booking_id or not message_text:
            emit('error', {'message': 'Both bookingId and message text are required.'})
            return

        room = f"booking_{booking_id}"

        # 2. Handle Authentication
        # 🚨 PROD NOTE: Uncomment the lines below in production to block unauthenticated users
        # if not current_user.is_authenticated:
        #     emit('error', {'message': 'Unauthorized request. Please log in.'})
        #     return
        
        # Smart fallback: Use logged-in user id; if testing via Postman, default to ID 1
        sender_id = current_user.id if current_user.is_authenticated else 1

        # 3. Database Transaction
        try:
            new_msg = Message(
                booking_id=booking_id,
                sender_id=sender_id,
                content=message_text
            )
            db.session.add(new_msg)
            db.session.commit()

            print(f"💾 Message saved to DB! ID: {new_msg.id} -> Room: {room}")

            # 4. Broadcast to the room
            # Sends the parsed dictionary directly to everyone listening in the room
            emit('receive_message', new_msg.to_dict(), to=room)
            
        except Exception as e:
            # If the database fails (e.g., invalid booking ID foreign key constraint), rollback safely
            db.session.rollback()
            print(f"❌ DATABASE ERROR: {str(e)}")
            emit('error', {"message": "Internal server error: Could not save message."})