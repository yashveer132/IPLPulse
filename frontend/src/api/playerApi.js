import apiClient from "./apiClient.js";

export const playerApi = {
  getPlayers: (params) => apiClient.get("/players", { params }),
  getPlayerById: (id) => apiClient.get(`/players/${id}`),
  getPlayerStats: (id) => apiClient.get(`/players/${id}/stats`),
  getPlayerAuctionHistory: (id) =>
    apiClient.get(`/players/${id}/auction-history`),
};
