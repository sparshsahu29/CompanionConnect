import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import BookingRequestCard from '../components/BookingRequestCard';
import ChatDrawer from '../components/chatdrawer'; // 👈 Imported the isolated chat component
import { getBookingRequests, handleBookingRequest } from '../api/bookingApi';
import { updateCompanionSettings, getCompanionDetails } from '../api/companionApi';
import { useAuth } from '../context/AuthContext';
import { Settings, Calendar, Clock, DollarSign, LayoutDashboard, Bell, CheckCircle2 } from 'lucide-react';

const CompanionDashboard = () => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [settings, setSettings] = useState({
    hourlyRate: '',
    availableDates: '',
    availableTimeSlots: '',
    isActive: false
  });
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // 🚨 NEW: Simple state to track which chat is open
  const [activeChatBooking, setActiveChatBooking] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reqData, companionData] = await Promise.all([
          getBookingRequests(),
          getCompanionDetails(currentUser.id).catch(() => null)
        ]);
        
        setRequests(reqData || []);

        if (companionData) {
          setSettings({
            hourlyRate: companionData.hourlyRate || '',
            availableDates: companionData.availableDates?.join(', ') || '',
            availableTimeSlots: companionData.availableTimeSlots?.join(', ') || '',
            isActive: companionData.isActive !== false
          });
        } else {
          setSettings({
            hourlyRate: '',
            availableDates: '',
            availableTimeSlots: '',
            isActive: true 
          });
        }
      } catch (error) {
        console.error('Dashboard data fetch failed', error);
      } finally {
        setLoading(false);
      }
    };
    if (currentUser) fetchData();
  }, [currentUser]);

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      const formattedSettings = {
        ...settings,
        availableDates: settings.availableDates.split(',').map(d => d.trim()),
        availableTimeSlots: settings.availableTimeSlots.split(',').map(t => t.trim())
      };
      await updateCompanionSettings(formattedSettings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Settings update failed', error);
    } finally {
      setSaveLoading(false);
    }
  };

  const onHandleRequest = async (id, action) => {
    try {
      await handleBookingRequest(id, action);
      setRequests(requests.map(r => r.id === id ? { ...r, status: action === 'accept' ? 'accepted' : 'rejected' } : r));
    } catch (error) {
      console.error('Request action failed', error);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-x-hidden">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900">Companion Dashboard</h1>
            <p className="text-gray-600">Manage your profile, availability, and bookings.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Settings Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-xl font-bold text-gray-900">Companion state</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold uppercase tracking-wider ${settings.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                    {settings.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <button 
                    type="button"
                    onClick={() => setSettings({ ...settings, isActive: !settings.isActive })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${settings.isActive ? 'bg-indigo-600' : 'bg-gray-200'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSettingsSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Hourly Rate ($)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      required
                      className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                      value={settings.hourlyRate}
                      onChange={(e) => setSettings({ ...settings, hourlyRate: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Available Dates</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      required
                      className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                      placeholder="Mon, Wed, Fri"
                      value={settings.availableDates}
                      onChange={(e) => setSettings({ ...settings, availableDates: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Time Slots</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Clock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      required
                      className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                      placeholder="10am-2pm, 4pm-8pm"
                      value={settings.availableTimeSlots}
                      onChange={(e) => setSettings({ ...settings, availableTimeSlots: e.target.value })}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saveLoading}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-50"
                >
                  {saveLoading ? 'Saving...' : saveSuccess ? <><CheckCircle2 className="w-4 h-4" /> Saved</> : 'Save Settings'}
                </button>
              </form>
            </div>
          </div>

          {/* Bookings Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 min-h-150">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-xl font-bold text-gray-900">Booking Requests</h3>
                </div>
                <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold">
                  {requests.filter(r => r.status === 'pending').length} New
                </span>
              </div>

              {requests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {requests.map(request => (
                    <BookingRequestCard 
                      key={request.id} 
                      request={request} 
                      onAccept={() => onHandleRequest(request.id, 'accept')}
                      onDecline={() => onHandleRequest(request.id, 'decline')}
                      onOpenChat={(booking) => setActiveChatBooking(booking)} // 👈 NEW: Triggers the drawer to open!
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <Bell className="w-10 h-10 text-gray-200" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-1">No requests yet</h4>
                  <p className="text-gray-500 max-w-xs">When users book sessions with you, they will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 🚨 NEW: The isolated chat drawer manages its own layout, state, and socket connection */}
      <ChatDrawer 
        isOpen={!!activeChatBooking} 
        onClose={() => setActiveChatBooking(null)} 
        booking={activeChatBooking} 
      />
    </div>
  );
};

export default CompanionDashboard;