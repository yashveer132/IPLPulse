import apiClient from './apiClient.js';

export const franchiseApi = {
  getFranchises: () => apiClient.get('/franchises'),
  getFranchiseById: (id) => apiClient.get(`/franchises/${id}`),
  getFranchiseSeasons: (id) => apiClient.get(`/franchises/${id}/seasons`),
  getFranchiseSquad: (id, season) => apiClient.get(`/franchises/${id}/squad/${season}`),
  compareFranchises: (ids) => apiClient.get('/franchises/compare', { params: { ids: ids.join(',') } }),
  getFranchiseIntelligence: (id) => apiClient.get(`/franchises/${id}/intelligence`),
  getFranchiseLegends: (id) => apiClient.get(`/franchises/${id}/legends`),
  getFranchiseRivalries: (id) => apiClient.get(`/franchises/${id}/rivalries`),
  getHomeFortress: (id) => apiClient.get(`/franchises/${id}/fortress`),
  getAuctionIntelligence: (id) => apiClient.get(`/franchises/${id}/auction-intelligence`),
};
