import apiClient from './apiClient.js';

export const rankingApi = {
  getGreatestPurchases: (params) => apiClient.get('/rankings/greatest-purchases', { params }),
  getBiggestBargains: (params) => apiClient.get('/rankings/biggest-bargains', { params }),
  getBiggestDisasters: (params) => apiClient.get('/rankings/biggest-disasters', { params }),
  getFranchiseAuctionIq: (params) => apiClient.get('/rankings/franchise-auction-iq', { params }),
};
