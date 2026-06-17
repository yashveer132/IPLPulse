import apiClient from "./apiClient.js";

export const auctionApi = {
  getAuctionEntries: (params) => apiClient.get("/auctions", { params }),
  getSearchSuggestions: (q) =>
    apiClient.get("/auctions/search-suggestions", { params: { q } }),
  getAuctionSeasons: () => apiClient.get("/auctions/seasons"),
};
