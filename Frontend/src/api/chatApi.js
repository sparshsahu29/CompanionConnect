import api from './axios';

export const getMessages = async (bookingId) => {
  const response = await api.get(`/chat/${bookingId}`);
  return response.data;
};

export const sendMessage = async (bookingId, message) => {
  const response = await api.post(`/chat/${bookingId}/send`, { message });
  return response.data;
};
