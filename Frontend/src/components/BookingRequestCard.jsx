import React from 'react';
import { Calendar, Clock, MessageSquare, Check, X } from 'lucide-react';

const BookingRequestCard = ({ request, onAccept, onDecline, onOpenChat }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
      {/* Card Header: User details and status badge */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
            {request.userPhoto ? (
              <img 
                src={request.userPhoto} 
                alt={request.userName} 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer" 
              />
            ) : (
              <span className="text-indigo-600 font-bold text-lg">
                {request.userName?.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <h4 className="font-bold text-gray-900">{request.userName}</h4>
            <span className="text-xs text-gray-500">Sent {request.createdAt}</span>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
          request.status === 'pending' ? 'bg-yellow-50 text-yellow-600' : 
          request.status === 'accepted' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
        }`}>
          {request.status}
        </div>
      </div>

      {/* Booking schedule details */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4 text-indigo-500" />
          <span>{request.date}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4 text-indigo-500" />
          <span>{request.time}</span>
        </div>
      </div>

      {/* Optional request intro message */}
      {request.message && (
        <div className="bg-gray-50 rounded-lg p-3 mb-5 flex gap-2">
          <MessageSquare className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
          <p className="text-sm text-gray-600 italic">"{request.message}"</p>
        </div>
      )}

      {/* Actions: Render buttons dynamically based on booking request lifecycle status */}
      {request.status === 'pending' && (
        <div className="flex gap-2">
          <button 
            onClick={() => onAccept(request.id)}
            className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            Accept
          </button>
          <button 
            onClick={() => onDecline(request.id)}
            className="flex-1 bg-white text-gray-600 border border-gray-200 py-2 rounded-lg font-bold text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Decline
          </button>
        </div>
      )}
      
      {request.status === 'accepted' && (
        <button 
          onClick={() => onOpenChat(request)} // 👈 Triggers state up to open the specific chat screen
          className="w-full bg-indigo-50 text-indigo-600 py-2 rounded-lg font-bold text-sm hover:bg-indigo-100 transition-colors"
        >
          Open Chat
        </button>
      )}
    </div>
  );
};

export default BookingRequestCard;