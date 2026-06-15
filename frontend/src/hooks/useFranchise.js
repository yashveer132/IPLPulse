import { useQuery } from '@tanstack/react-query';
import { franchiseApi } from '../api/index.js';

export const useFranchises = (options = {}) => {
  return useQuery({
    queryKey: ['franchises'],
    queryFn: () => franchiseApi.getFranchises(),
    ...options,
  });
};

export const useFranchiseById = (id, options = {}) => {
  return useQuery({
    queryKey: ['franchise', id],
    queryFn: () => franchiseApi.getFranchiseById(id),
    enabled: !!id,
    ...options,
  });
};

export const useFranchiseSeasons = (id, options = {}) => {
  return useQuery({
    queryKey: ['franchise', id, 'seasons'],
    queryFn: () => franchiseApi.getFranchiseSeasons(id),
    enabled: !!id,
    ...options,
  });
};

export const useFranchiseSquad = (id, season, options = {}) => {
  return useQuery({
    queryKey: ['franchise', id, 'squad', season],
    queryFn: () => franchiseApi.getFranchiseSquad(id, season),
    enabled: !!id && !!season,
    ...options,
  });
};

export const useCompareFranchises = (ids, options = {}) => {
  return useQuery({
    queryKey: ['compareFranchises', ids],
    queryFn: () => franchiseApi.compareFranchises(ids),
    enabled: Array.isArray(ids) && ids.length > 1,
    ...options,
  });
};

export const useFranchiseIntelligence = (id, options = {}) => {
  return useQuery({
    queryKey: ['franchise', id, 'intelligence'],
    queryFn: () => franchiseApi.getFranchiseIntelligence(id),
    enabled: !!id,
    ...options,
  });
};

export const useFranchiseLegends = (id, options = {}) => {
  return useQuery({
    queryKey: ['franchise', id, 'legends'],
    queryFn: () => franchiseApi.getFranchiseLegends(id),
    enabled: !!id,
    ...options,
  });
};

export const useFranchiseRivalries = (id, options = {}) => {
  return useQuery({
    queryKey: ['franchise', id, 'rivalries'],
    queryFn: () => franchiseApi.getFranchiseRivalries(id),
    enabled: !!id,
    ...options,
  });
};

export const useHomeFortress = (id, options = {}) => {
  return useQuery({
    queryKey: ['franchise', id, 'fortress'],
    queryFn: () => franchiseApi.getHomeFortress(id),
    enabled: !!id,
    ...options,
  });
};

export const useAuctionIntelligence = (id, options = {}) => {
  return useQuery({
    queryKey: ['franchise', id, 'auctionIntelligence'],
    queryFn: () => franchiseApi.getAuctionIntelligence(id),
    enabled: !!id,
    ...options,
  });
};
