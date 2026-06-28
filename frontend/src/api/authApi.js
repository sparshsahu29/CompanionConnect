import api from './axios';
import { normalizeUser } from './normalizers';

export const signup = async (fullName, email, password) => {
  const response = await api.post('/auth/signup', { fullName, email, password });
  const { access_token, user } = response.data;
  localStorage.setItem('access_token', access_token);
  return normalizeUser(user);
};

export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  const { access_token, user } = response.data;
  localStorage.setItem('access_token', access_token);
  return normalizeUser(user);
};

export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } finally {
    localStorage.removeItem('access_token');
  }
};

export const getProfile = async () => {
  const response = await api.get('/profile/me');
  return normalizeUser(response.data);
};
