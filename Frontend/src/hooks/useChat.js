// src/hooks/useChat.js
import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from '../api/axios';

export const useChat = (bookingId) => {
  const [messages, setMessages] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!bookingId) return;

    // 1. Fetch History
    const loadHistory = async () => {
      try {
        const response = await axios.get(`/chat/history/${bookingId}`);
        setMessages(response.data || []);
      } catch (err) {
        console.error('Failed to load history:', err);
      }
    };
    loadHistory();

    // 2. Connect WebSockets
    socketRef.current = io('http://localhost:5000');
    socketRef.current.emit('join', { bookingId });

    // 3. Listen for new messages
    socketRef.current.on('receive_message', (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    // 4. Cleanup on unmount or when bookingId changes
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [bookingId]);

  const sendMessage = (text) => {
    if (!text.trim() || !socketRef.current) return;
    socketRef.current.emit('send_message', { bookingId, message: text });
  };

  return { messages, sendMessage };
};