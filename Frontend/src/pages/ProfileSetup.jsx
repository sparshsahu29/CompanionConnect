import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateProfile } from '../api/profileApi';
import api from '../api/axios';
import { Camera, MapPin, Hash, Heart, CheckCircle } from 'lucide-react';

const ProfileSetup = () => {
  const [formData, setFormData] = useState({
    age: '',
    city: '',
    interests: '',
    profilePhoto: ''
  });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const interestsArray = formData.interests
        .split(',')
        .map(i => i.trim())
        .filter(i => i !== '');

      await updateProfile({
        ...formData,
        interests: interestsArray
      });

      navigate('/browse');

    } catch (error) {
      console.error('Profile setup failed', error);
    } finally {
      setLoading(false);
    }
  };

  // PHOTO UPLOAD HANDLER
  const handlePhotoUpload = async (e) => {

    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append("photo", file);

    setUploading(true);

    try {

      const res = await api.post(
        "/profile/upload-photo",
        uploadData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      setFormData({
        ...formData,
        profilePhoto: res.data.url
      });

    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">

      <div className="max-w-xl mx-auto">

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-2xl text-indigo-600 mb-4">
            <CheckCircle className="w-8 h-8" />
          </div>

          <h2 className="text-3xl font-black text-gray-900">
            Complete your profile
          </h2>

          <p className="mt-2 text-gray-600">
            Help others get to know you better.
          </p>
        </div>


        <div className="bg-white shadow-xl shadow-indigo-100/50 rounded-3xl p-8 border border-gray-100">

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* PHOTO SECTION */}

            <div className="flex flex-col items-center mb-8">

              <div className="relative group">

                <div className="w-32 h-32 rounded-full bg-gray-100 border-4 border-white shadow-md overflow-hidden flex items-center justify-center">

                  {formData.profilePhoto ? (

                    <img
                      src={formData.profilePhoto}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />

                  ) : (

                    <Camera className="w-8 h-8 text-gray-400" />

                  )}

                </div>

                <label
                  className="absolute bottom-1 right-1 bg-indigo-600 text-white p-2 rounded-full shadow-lg hover:bg-indigo-700 transition-all cursor-pointer"
                >

                  <Camera className="w-4 h-4" />

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />

                </label>

              </div>

              <p className="mt-3 text-xs text-gray-500 font-medium">
                {uploading ? "Uploading photo..." : "Click icon to upload a photo"}
              </p>

            </div>


            {/* AGE + CITY */}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

              <div>

                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Age
                </label>

                <div className="relative">

                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Hash className="h-5 w-5 text-gray-400" />
                  </div>

                  <input
                    type="number"
                    required
                    placeholder="25"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-indigo-600"
                    value={formData.age}
                    onChange={(e) =>
                      setFormData({ ...formData, age: e.target.value })
                    }
                  />

                </div>

              </div>


              <div>

                <label className="block text-sm font-bold text-gray-700 mb-1">
                  City
                </label>

                <div className="relative">

                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>

                  <input
                    type="text"
                    required
                    placeholder="New York"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-indigo-600"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                  />

                </div>

              </div>

            </div>


            {/* INTERESTS */}

            <div>

              <label className="block text-sm font-bold text-gray-700 mb-1">
                Interests (comma separated)
              </label>

              <div className="relative">

                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Heart className="h-5 w-5 text-gray-400" />
                </div>

                <input
                  type="text"
                  required
                  placeholder="Hiking, Gaming, Cooking"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-indigo-600"
                  value={formData.interests}
                  onChange={(e) =>
                    setFormData({ ...formData, interests: e.target.value })
                  }
                />

              </div>

              <p className="mt-2 text-xs text-gray-500">
                Add things you love to do so we can match you with the right people.
              </p>

            </div>


            {/* SUBMIT BUTTON */}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl shadow-lg text-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 mt-8"
            >

              {loading ? "Saving profile..." : "Complete Profile"}

            </button>

          </form>

        </div>

      </div>

    </div>
  );
};

export default ProfileSetup;