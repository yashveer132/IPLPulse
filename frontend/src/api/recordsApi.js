import apiClient from './apiClient.js';

export const recordsApi = {
  getSeasonLeaderboards: () => apiClient.get('/records'),
  getDynamicRecord: (categoryId, recordId) => apiClient.get(`/records/${categoryId}/${recordId}`),
};
