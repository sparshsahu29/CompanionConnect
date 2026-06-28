import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Clock } from 'lucide-react';

const CompanionCard = ({ companion }) => {
  return (
    <Link to={`/companion/${companion.id}`} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col">
      <div className="relative aspect-4/5 overflow-hidden">
        <img 
          src={companion.profilePhoto || `https://picsum.photos/seed/${companion.id}/400/500`} 
          alt={companion.fullName} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
          <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
          <span className="text-xs font-bold text-gray-800">{companion.rating || '4.9'}</span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/60 to-transparent p-4">
          <div className="flex items-center gap-2 text-white">
            <MapPin className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">{companion.city}</span>
          </div>
        </div>
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
              {companion.fullName}, {companion.age}
            </h3>
          </div>
          <div className="text-right">
            <span className="text-indigo-600 font-bold text-lg">₹{companion.hourlyRate}</span>
            <span className="text-gray-400 text-xs block">/hr</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1.5 mb-4">
          {companion.interests?.slice(0, 3).map((interest, idx) => (
            <span key={idx} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider rounded-md">
              {interest}
            </span>
          ))}
          {companion.interests?.length > 3 && (
            <span className="px-2 py-0.5 bg-gray-50 text-gray-500 text-[10px] font-bold uppercase tracking-wider rounded-md">
              +{companion.interests.length - 3}
            </span>
          )}
        </div>

        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-gray-500 text-xs">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Available Today</span>
          </div>
          <span className="font-medium text-indigo-600">View Profile</span>
        </div>
      </div>
    </Link>
  );
};

export default CompanionCard;
