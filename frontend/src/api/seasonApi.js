import apiClient from "./apiClient.js";

export const seasonApi = {
  getSeasons: () => apiClient.get("/seasons"),
  getSeasonIntelligence: (year) =>
    apiClient.get(`/seasons/${year}/intelligence`),
};
