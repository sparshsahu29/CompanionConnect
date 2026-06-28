import api from './axios';
import { normalizeMessage } from './normalizers';

export const getMessages = async (bookingId) => {
  const response = await api.get(`/chat/${bookingId}`);
  return response.data.map(normalizeMessage);
};
