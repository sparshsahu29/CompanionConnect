import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ChatBubble from '../components/ChatBubble';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../hooks/useChat';
import { Send, ChevronLeft, Info, Phone, Video, MoreVertical, Smile } from 'lucide-react';

const Chat = () => {
  const { bookingId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { messages, loading, sendMessage } = useChat(bookingId);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    sendMessage(newMessage);
    setNewMessage('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 flex flex-col overflow-hidden">
        <div className="bg-white rounded-t-3xl shadow-sm border border-gray-100 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
              <img src={`https://picsum.photos/seed/${bookingId}/100/100`} alt="Chat Partner" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Chat Session #{bookingId}</h3>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Online</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Phone className="w-5 h-5" /></button>
            <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Video className="w-5 h-5" /></button>
            <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Info className="w-5 h-5" /></button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all"><MoreVertical className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="flex-1 bg-white border-x border-gray-100 overflow-y-auto p-6 space-y-2">
          {messages.length > 0 ? (
            messages.map((msg, idx) => (
              <ChatBubble key={msg.id || idx} message={msg} isMe={msg.senderId === currentUser?.id} />
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Send className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-sm font-medium">Start the conversation.</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="bg-white rounded-b-3xl shadow-sm border border-gray-100 p-4">
          <form onSubmit={handleSend} className="flex items-center gap-3">
            <button type="button" className="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
              <Smile className="w-6 h-6" />
            </button>
            <input
              type="text"
              className="flex-1 bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-indigo-600 text-white p-3 rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:scale-95"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
