import React, { useState, useEffect,useRef } from 'react';
import Navbar from '../components/Navbar';
import { getMyProfile, updateProfile, uploadPhoto } from '../api/profileApi';
import { useAuth } from '../context/AuthContext';
import { User, MapPin, Hash, Heart, Camera, CheckCircle2, Loader2 } from 'lucide-react';


const Profile = () => {
  const { currentUser, fetchProfile } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    city: '',
    interests: '',
    profilePhoto: ''
  });
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);
  const [showPreview, setShowPreview] = useState(false);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await uploadPhoto(file);
      const newPhotoUrl = res.url;

      setFormData((prev) => ({
        ...prev,
        profilePhoto: newPhotoUrl,
      }));

      await updateProfile({
        profilePhoto: newPhotoUrl,
      });
      await fetchProfile();
    } catch (error) {
      console.error('Upload failed', error);
    }
  };

  useEffect(() => {
    const fetchMyData = async () => {
      try {
        const data = await getMyProfile();
        setFormData({
          fullName: data.fullname || '',
          age: data.age || '',
          city: data.city || '',
          interests: data.interests?.join(', ') || '',
          profilePhoto: data.profilePhoto || data.profile_photo || ''
        });
      } catch (error) {
        console.error('Failed to fetch profile', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      const interestsArray = formData.interests.split(',').map(i => i.trim()).filter(i => i !== '');
      await updateProfile({ ...formData, interests: interestsArray });
      await fetchProfile();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Update failed', error);
    } finally {
      setSaveLoading(false);
    }
  };
  

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin h-12 w-12 text-indigo-600" /></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900">Your Profile</h1>
            <p className="text-gray-600">Manage your personal information and preferences.</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="h-32 bg-linear-to-r from-indigo-500 to-purple-600"></div>
          <div className="px-8 pb-8">
            <div className="relative -mt-16 mb-8 flex justify-center sm:justify-start">
              <div className="relative group">

  <div className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-xl overflow-hidden flex items-center justify-center cursor-pointer"
  onClick={() => formData.profilePhoto && setShowPreview(true)}>
    {formData.profilePhoto ? (
      <img
        src={formData.profilePhoto}
        alt="Profile"
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
        
      />
    ) : (
      <User className="w-12 h-12 text-gray-300" />
    )}
  </div>
  <input
    type="file"
    accept="image/*"
    ref={fileInputRef}
    className="hidden"
    onChange={handlePhotoUpload}
  />

  <button
    type="button"
    onClick={() => fileInputRef.current.click()}
    className="absolute bottom-1 right-1 bg-white text-indigo-600 p-2 rounded-full shadow-lg hover:bg-indigo-50 transition-all border border-gray-100"
  >
    <Camera className="w-4 h-4" />
  </button>

</div>
{showPreview && (
  <div
    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
    onClick={() => setShowPreview(false)}
  >
    <img
      src={formData.profilePhoto}
      alt="Profile Preview"
      className="w-96 h-96 rounded-full object-cover border-4 border-white shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    />
  </div>
)}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    className="block w-full px-4 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Age</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Hash className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      required
                      className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">City</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      required
                      className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Interests (comma separated)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Heart className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      required
                      className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                      value={formData.interests}
                      onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                <p className="text-xs text-gray-400 font-medium">Last updated: Just now</p>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
                >
                  {saveLoading ? <Loader2 className="animate-spin w-5 h-5" /> : success ? <><CheckCircle2 className="w-5 h-5" /> Saved</> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
