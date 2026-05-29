import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getCompanionDetails } from '../api/companionApi';
import { createBooking } from '../api/bookingApi';
import { useAuth } from '../context/AuthContext';
import { MapPin, Star, Clock, Calendar, MessageSquare, Send, ChevronLeft, Heart, ShieldCheck } from 'lucide-react';

const CompanionDetails = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [companion, setCompanion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState({ date: '', time: '', message: '' });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await getCompanionDetails(id);
        setCompanion(data);
      } catch (error) {
        console.error('Failed to fetch companion details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      navigate('/login', { state: { from: { pathname: `/companion/${id}` } } });
      return;
    }
    setBookingLoading(true);
    try {
      await createBooking(id, bookingData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      console.error('Booking failed', error);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-10 animate-pulse">
          <div className="h-96 bg-gray-200 rounded-3xl mb-8"></div>
          <div className="h-8 bg-gray-200 w-1/3 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 w-1/2 rounded"></div>
        </div>
      </div>
    );
  }

  if (!companion) return <div>Companion not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 font-bold mb-8 transition-colors group"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Browse
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column: Profile Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="relative h-125">
                <img 
                  src={companion.profilePhoto || `https://picsum.photos/seed/${companion.id}/800/600`} 
                  alt={companion.fullName} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="text-lg font-black text-gray-900">{companion.rating || '4.9'}</span>
                  <span className="text-gray-400 text-sm font-medium">(128 reviews)</span>
                </div>
              </div>
              
              <div className="p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                  <div>
                    <h1 className="text-4xl font-black text-gray-900 mb-2">{companion.fullName}, {companion.age}</h1>
                    <div className="flex items-center gap-4 text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-5 h-5 text-indigo-600" />
                        <span className="font-medium">{companion.city}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-5 h-5 text-green-600" />
                        <span className="font-medium">Verified Companion</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-indigo-50 px-6 py-3 rounded-2xl text-center">
                    <span className="text-3xl font-black text-indigo-600">${companion.hourlyRate}</span>
                    <span className="text-indigo-400 text-sm font-bold block">per hour</span>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">About Me</h3>
                    <p className="text-gray-600 leading-relaxed text-lg">
                      Hi! I'm {companion.fullName}. I love meeting new people and exploring new places. 
                      I'm a great listener and enjoy deep conversations about life, technology, and art. 
                      Whether you need a plus-one for an event or just someone to grab coffee with, I'm here for you!
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Interests</h3>
                    <div className="flex flex-wrap gap-3">
                      {companion.interests?.map((interest, idx) => (
                        <span key={idx} className="px-4 py-2 bg-gray-50 text-gray-700 font-bold rounded-xl border border-gray-100 flex items-center gap-2">
                          <Heart className="w-4 h-4 text-pink-500" />
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Availability */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Availability</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Available Dates</h4>
                    <p className="text-gray-600 text-sm">{companion.availableDates?.join(', ') || 'Mon, Wed, Fri, Sat'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Time Slots</h4>
                    <p className="text-gray-600 text-sm">{companion.availableTimeSlots?.join(', ') || '10:00 AM - 8:00 PM'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Booking Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100/50 border border-gray-100 p-8 sticky top-28">
              <h3 className="text-2xl font-black text-gray-900 mb-6">Book a Session</h3>
              
              {success ? (
                <div className="bg-green-50 border border-green-100 text-green-700 p-6 rounded-2xl text-center animate-bounce-in">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-bold text-lg mb-1">Request Sent!</h4>
                  <p className="text-sm">Wait for {companion.fullName} to accept your booking request.</p>
                </div>
              ) : (
                <form onSubmit={handleBooking} className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Select Date</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        required
                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                        value={bookingData.date}
                        onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Select Time</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Clock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="time"
                        required
                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                        value={bookingData.time}
                        onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Message (Optional)</label>
                    <div className="relative">
                      <div className="absolute top-3 left-3 pointer-events-none">
                        <MessageSquare className="h-5 w-5 text-gray-400" />
                      </div>
                      <textarea
                        rows="3"
                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                        placeholder="Tell them about your plans..."
                        value={bookingData.message}
                        onChange={(e) => setBookingData({ ...bookingData, message: e.target.value })}
                      ></textarea>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-lg text-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                  >
                    {bookingLoading ? 'Sending...' : 'Send Booking Request'}
                  </button>
                  <p className="text-center text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                    No payment required until accepted
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanionDetails;
