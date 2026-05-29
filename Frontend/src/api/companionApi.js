import api from './axios';

export const getAllCompanions = async () => {
  const response = await api.get('/companions/all');
  return response.data;
};

export const getCompanionDetails = async () => {
  const response = await api.get(`/companions/me`);
  return response.data;
};

export const updateCompanionSettings = async (settings) => {
  const response = await api.post('/companions/update', settings);
  return response.data;
};
