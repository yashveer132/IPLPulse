import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { seasonApi } from "../api/index.js";

export const useSeasons = (options = {}) => {
  return useQuery({
    queryKey: ["seasons"],
    queryFn: () => seasonApi.getSeasons(),
    staleTime: Infinity,
    ...options,
  });
};

export const useSeasonIntelligence = (year, options = {}) => {
  return useQuery({
    queryKey: ["seasonIntelligence", year],
    queryFn: () => seasonApi.getSeasonIntelligence(year),
    enabled: !!year,
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
    ...options,
  });
};
