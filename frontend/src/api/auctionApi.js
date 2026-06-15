import apiClient from './apiClient.js';

export const auctionApi = {
  getAuctionEntries: (params) => apiClient.get('/auctions', { params }),
  getAuctionSeasons: () => apiClient.get('/auctions/seasons'),
};
