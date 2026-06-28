import api from './axios';
import { normalizeBooking } from './normalizers';

export const createBooking = async (companionId, bookingData) => {
  const response = await api.post(`/bookings/create/${companionId}`, {
    bookingDate: bookingData.date || bookingData.bookingDate,
    timeSlot: bookingData.time || bookingData.timeSlot,
    totalPrice: Number(bookingData.totalPrice || 0),
  });
  return {
    ...response.data,
    booking: normalizeBooking(response.data.booking),
  };
};

export const getBookingRequests = async () => {
  const response = await api.get('/bookings/requests');
  return response.data.map(normalizeBooking);
};

export const handleBookingRequest = async (bookingId, action) => {
  const backendAction = action === 'decline' ? 'reject' : action;
  const response = await api.post(`/bookings/${bookingId}/${backendAction}`);
  return {
    ...response.data,
    booking: normalizeBooking(response.data.booking),
  };
};
