import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "../api/index.js";

export const useTeamDevelopmentIndex = (options = {}) => {
  return useQuery({
    queryKey: ["teamDevelopmentIndex"],
    queryFn: () => analyticsApi.getTeamDevelopmentIndex(),
    ...options,
  });
};

export const useTeamDevelopmentBreakdown = (franchiseId, options = {}) => {
  return useQuery({
    queryKey: ["teamDevelopmentBreakdown", franchiseId],
    queryFn: () => analyticsApi.getTeamDevelopmentBreakdown(franchiseId),
    enabled: !!franchiseId,
    ...options,
  });
};

export const useRetentionAnalytics = (params, options = {}) => {
  return useQuery({
    queryKey: ["retentionAnalytics", params],
    queryFn: () => analyticsApi.getRetentionAnalytics(params),
    keepPreviousData: true,
    ...options,
  });
};

export const useFranchiseIntelligenceScore = (options = {}) => {
  return useQuery({
    queryKey: ["franchiseIntelligenceScore"],
    queryFn: () => analyticsApi.getFranchiseIntelligenceScore(),
    ...options,
  });
};

export const useFranchiseTrends = (options = {}) => {
  return useQuery({
    queryKey: ["franchiseTrends"],
    queryFn: () => analyticsApi.getFranchiseTrends(),
    ...options,
  });
};

export const usePlayerValueRankings = (params, options = {}) => {
  return useQuery({
    queryKey: ["playerValueRankings", params],
    queryFn: () => analyticsApi.getPlayerValueRankings(params),
    keepPreviousData: true,
    ...options,
  });
};

export const usePlayerValueBreakdown = (playerId, options = {}) => {
  return useQuery({
    queryKey: ["analytics", "playerValueBreakdown", playerId],
    queryFn: () => analyticsApi.getPlayerValueBreakdown(playerId),
    enabled: !!playerId,
    ...options,
  });
};

export const usePlatformSummary = (options = {}) => {
  return useQuery({
    queryKey: ["analytics", "summary"],
    queryFn: () => analyticsApi.getPlatformSummary(),
    ...options,
  });
};

export const useFastestMilestone = (targetRuns, options = {}) => {
  return useQuery({
    queryKey: ["analytics", "fastestMilestone", targetRuns],
    queryFn: () => analyticsApi.getFastestMilestone(targetRuns),
    enabled: !!targetRuns && targetRuns > 0,
    ...options,
  });
};

export const useFastestMilestoneCurve = (options = {}) => {
  return useQuery({
    queryKey: ["analytics", "fastestMilestoneCurve"],
    queryFn: () => analyticsApi.getFastestMilestoneCurve(),
    ...options,
  });
};
