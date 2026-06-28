import api from './axios';
import { normalizeUser } from './normalizers';

export const getMyProfile = async () => {
  const response = await api.get('/profile/me');
  return normalizeUser(response.data);
};

export const updateProfile = async (data) => {
  const payload = {
    ...data,
    age: data.age === '' || data.age == null ? null : Number(data.age),
  };
  const response = await api.post('/profile/update', payload);
  return response.data;
};

export const uploadPhoto = async (file) => {
  const formData = new FormData();
  formData.append('photo', file);
  const response = await api.post('/profile/upload-photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};
