import React from 'react';

const ChatBubble = ({ message, isMe }) => {
  // Safe helper to convert ISO strings or timestamps into clean time format
  const formatTime = (timeInput) => {
    if (!timeInput) return '';
    try {
      const date = new Date(timeInput);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} mb-4 animate-fade-in`}>
      {/* Message Text Container */}
      <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm shadow-sm transition-all ${
        isMe 
          ? 'bg-indigo-600 text-white rounded-tr-none' 
          : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
      }`}>
        {message.content}
      </div>
      
      {/* Timestamp fallback layout */}
      <span className="text-[10px] text-gray-400 mt-1 px-1">
        {/* 🚨 Uses created_at from your backend dictionary with a fallback to timestamp */}
        {formatTime(message.created_at || message.timestamp)}
      </span>
    </div>
  );
};

export default ChatBubble;