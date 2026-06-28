import api from './axios';
import { normalizeCompanion } from './normalizers';

export const getAllCompanions = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.city) params.append('city', filters.city);
  if (filters.hobby) params.append('hobby', filters.hobby);
  if (filters.minRate) params.append('min_rate', filters.minRate);
  if (filters.maxRate) params.append('max_rate', filters.maxRate);
  if (filters.search) params.append('search', filters.search);

  const query = params.toString();
  const response = await api.get(`/companions/all${query ? `?${query}` : ''}`);
  return response.data.map(normalizeCompanion);
};

export const getCompanionDetails = async (id) => {
  const response = await api.get(`/companions/${id}`);
  return normalizeCompanion(response.data);
};

export const getMyCompanionProfile = async () => {
  const response = await api.get('/companions/me');
  return normalizeCompanion(response.data);
};

export const updateCompanionSettings = async (settings) => {
  const payload = {
    hourlyRate: settings.hourlyRate === '' || settings.hourlyRate == null ? null : Number(settings.hourlyRate),
    availableDates: settings.availableDates ?? [],
    availableTimeSlots: settings.availableTimeSlots ?? [],
    isActive: Boolean(settings.isActive),
  };
  const response = await api.post('/companions/update', payload);
  return {
    ...response.data,
    companion: normalizeCompanion(response.data.companion),
  };
};
