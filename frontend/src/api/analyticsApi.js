import apiClient from "./apiClient.js";

export const analyticsApi = {
  getTeamDevelopmentIndex: () => apiClient.get("/analytics/team-development"),
  getTeamDevelopmentBreakdown: (franchiseId) =>
    apiClient.get(`/analytics/team-development/${franchiseId}`),
  getRetentionAnalytics: (params) =>
    apiClient.get("/analytics/retentions", { params }),
  getPlayerValueRankings: (params) =>
    apiClient.get("/analytics/player-value", { params }),
  getPlayerValueBreakdown: (playerId) =>
    apiClient.get(`/analytics/player-value/${playerId}`),
  getFastestMilestone: (target) =>
    apiClient.get(`/analytics/fastest-milestone?target=${target}`),
  getFastestMilestoneCurve: () =>
    apiClient.get("/analytics/fastest-milestone-curve"),
  getPlatformSummary: () => apiClient.get("/analytics/summary"),
};
