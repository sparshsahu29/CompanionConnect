import api from './axios';

export const createBooking = async (companionId, bookingData) => {
  const response = await api.post(`/bookings/create/${companionId}`, bookingData);
  return response.data;
};

export const getBookingRequests = async () => {
  const response = await api.get('/bookings/requests');
  return response.data;
};

export const handleBookingRequest = async (bookingId, action) => {
  const response = await api.post(`/bookings/${bookingId}/${action}`);
  return response.data;
};
