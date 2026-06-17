import { useQuery } from "@tanstack/react-query";
import { recordsApi } from "../api/recordsApi.js";

export function useSeasonLeaderboards() {
  return useQuery({
    queryKey: ["seasonLeaderboards"],
    queryFn: async () => {
      const response = await recordsApi.getSeasonLeaderboards();
      return response;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useDynamicRecord(categoryId, recordId) {
  return useQuery({
    queryKey: ["dynamicRecord", categoryId, recordId],
    queryFn: async () => {
      if (!categoryId || !recordId) return null;
      return await recordsApi.getDynamicRecord(categoryId, recordId);
    },
    enabled: !!categoryId && !!recordId,
    staleTime: 5 * 60 * 1000,
  });
}
