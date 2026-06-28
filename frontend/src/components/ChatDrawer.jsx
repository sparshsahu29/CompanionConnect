import React, { useState, useRef, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { useChat } from '../hooks/useChat';
import ChatBubble from './ChatBubble';
import { useAuth } from '../context/AuthContext';

const ChatDrawer = ({ isOpen, onClose, booking }) => {
  const { currentUser } = useAuth();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);
  const { messages, loading, sendMessage } = useChat(isOpen ? booking?.id : null);

  const requesterName = booking?.userName || booking?.clientName || 'Chat';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(inputText);
    setInputText('');
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 z-40 transition-opacity" onClick={onClose} />
      )}

      <div className={`fixed inset-y-0 right-0 w-full sm:w-100 bg-gray-50 shadow-2xl border-l border-gray-100 z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center">
              {requesterName.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 leading-tight">{requesterName}</h3>
              <p className="text-xs text-indigo-600 font-medium">Session #{booking?.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <p className="text-sm text-gray-400 text-center mt-6">Loading messages...</p>
          ) : messages.length ? (
            messages.map((msg, idx) => (
              <ChatBubble key={msg.id || idx} message={msg} isMe={msg.senderId === currentUser?.id} />
            ))
          ) : (
            <p className="text-sm text-gray-400 text-center mt-6">No messages yet.</p>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-200 flex gap-2 items-center">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button type="submit" disabled={!inputText.trim()} className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50">
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </>
  );
};

export default ChatDrawer;
