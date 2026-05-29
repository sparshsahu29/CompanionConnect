import api from './axios';

export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const signup = async (fullName, email, password) => {
  const response = await api.post('/auth/signup', { fullName, email, password });
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get('/profile/me');
  return response.data;
};
