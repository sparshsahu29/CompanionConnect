import api from './axios';


export const updateProfile = async (profileData) => {
  const response = await api.post('/profile/update', profileData);
  return response.data;
};

export const getMyProfile = async () => {
  const response = await api.get('/profile/me');
  return response.data;
};

export const uploadPhoto = async (formData) => {
  const res = await api.post("/profile/upload-photo", formData);
  return res.data;
};
