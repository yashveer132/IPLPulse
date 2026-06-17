import { useQuery } from "@tanstack/react-query";
import { rankingApi } from "../api/index.js";

export const useGreatestPurchases = (params, options = {}) => {
  return useQuery({
    queryKey: ["greatestPurchases", params],
    queryFn: () => rankingApi.getGreatestPurchases(params),
    keepPreviousData: true,
    ...options,
  });
};

export const useBiggestBargains = (params, options = {}) => {
  return useQuery({
    queryKey: ["biggestBargains", params],
    queryFn: () => rankingApi.getBiggestBargains(params),
    keepPreviousData: true,
    ...options,
  });
};

export const useBiggestDisasters = (params, options = {}) => {
  return useQuery({
    queryKey: ["biggestDisasters", params],
    queryFn: () => rankingApi.getBiggestDisasters(params),
    keepPreviousData: true,
    ...options,
  });
};

export const useFranchiseAuctionIq = (params, options = {}) => {
  return useQuery({
    queryKey: ["franchiseAuctionIq", params],
    queryFn: () => rankingApi.getFranchiseAuctionIq(params),
    ...options,
  });
};
