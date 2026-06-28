export const normalizeUser = (user = {}) => {
  const fullName = user.fullName ?? user.fullname ?? '';
  const profilePhoto = user.profilePhoto ?? user.profile_photo ?? '';

  return {
    ...user,
    fullName,
    fullname: user.fullname ?? fullName,
    profilePhoto,
    profile_photo: user.profile_photo ?? profilePhoto,
  };
};

export const normalizeCompanion = (companion = {}) => ({
  ...companion,
  id: companion.id,
  userId: companion.userId ?? companion.user_id,
  fullName: companion.fullName ?? companion.fullname ?? 'Unknown',
  age: companion.age ?? '',
  city: companion.city ?? 'Not Specified',
  interests: Array.isArray(companion.interests) ? companion.interests : [],
  profilePhoto: companion.profilePhoto ?? companion.profile_photo ?? '',
  hourlyRate: companion.hourlyRate ?? companion.hourly_rate ?? 0,
  availableDates: Array.isArray(companion.availableDates)
    ? companion.availableDates
    : companion.available_dates ?? [],
  availableTimeSlots: Array.isArray(companion.availableTimeSlots)
    ? companion.availableTimeSlots
    : companion.available_time_slots ?? [],
  isActive: companion.isActive ?? companion.is_active ?? false,
  isMock: companion.isMock ?? companion.is_mock ?? false,
});

export const normalizeBooking = (booking = {}) => ({
  ...booking,
  id: booking.id,
  clientId: booking.clientId ?? booking.client_id,
  companionId: booking.companionId ?? booking.companion_id,
  bookingDate: booking.bookingDate ?? booking.booking_date ?? booking.date ?? '',
  timeSlot: booking.timeSlot ?? booking.time_slot ?? booking.time ?? '',
  totalPrice: booking.totalPrice ?? booking.total_price ?? 0,
  status: booking.status ?? 'pending',
  createdAt: booking.createdAt ?? booking.created_at ?? '',
  clientName: booking.clientName ?? booking.userName ?? 'Unknown',
  userName: booking.userName ?? booking.clientName ?? 'Unknown',
  userPhoto: booking.userPhoto ?? booking.clientPhoto ?? '',
  date: booking.date ?? booking.bookingDate ?? booking.booking_date ?? '',
  time: booking.time ?? booking.timeSlot ?? booking.time_slot ?? '',
});

export const normalizeMessage = (message = {}) => ({
  ...message,
  id: message.id,
  bookingId: message.bookingId ?? message.booking_id,
  senderId: message.senderId ?? message.sender_id,
  sender_id: message.sender_id ?? message.senderId,
  content: message.content ?? '',
  timestamp: message.timestamp ?? message.created_at ?? '',
});

export const getApiErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  const detail = error?.response?.data?.detail;
  if (Array.isArray(detail)) {
    return detail
      .map((item) => item?.msg || item?.message)
      .filter(Boolean)
      .join(', ') || fallback;
  }
  return error?.response?.data?.message || detail || error?.message || fallback;
};
