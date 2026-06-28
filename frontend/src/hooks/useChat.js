import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { getMessages } from '../api/chatApi';
import { SOCKET_BASE_URL } from '../api/axios';
import { normalizeMessage } from '../api/normalizers';

export const useChat = (bookingId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(Boolean(bookingId));
  const socketRef = useRef(null);

  useEffect(() => {
    if (!bookingId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    getMessages(bookingId)
      .then((data) => setMessages(data))
      .catch(console.error)
      .finally(() => setLoading(false));

    socketRef.current = io(SOCKET_BASE_URL, {
      path: '/socket.io',
      transports: ['websocket'],
    });

    socketRef.current.on('connect', () => {
      socketRef.current.emit('join', { bookingId: Number(bookingId) });
    });

    socketRef.current.on('receive_message', (msg) => {
      setMessages((prev) => [...prev, normalizeMessage(msg)]);
    });

    socketRef.current.on('error', (err) => {
      console.error('[Socket] Error:', err);
    });

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [bookingId]);

  const sendMessage = (text) => {
    if (!socketRef.current || !text.trim()) return;
    const token = localStorage.getItem('access_token');
    socketRef.current.emit('send_message', {
      bookingId: Number(bookingId),
      message: text.trim(),
      token,
    });
  };

  return { messages, loading, sendMessage };
};
