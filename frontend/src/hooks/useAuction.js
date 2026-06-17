import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { auctionApi } from "../api/index.js";

export const useAuctionEntries = (params, options = {}) => {
  return useQuery({
    queryKey: ["auctionEntries", params],
    queryFn: () => auctionApi.getAuctionEntries(params),
    placeholderData: keepPreviousData,
    ...options,
  });
};

export const useAuctionSeasons = (options = {}) => {
  return useQuery({
    queryKey: ["auctionSeasons"],
    queryFn: () => auctionApi.getAuctionSeasons(),
    ...options,
  });
};
