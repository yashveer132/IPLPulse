import { useQuery } from '@tanstack/react-query';
import { playerApi } from '../api/index.js';

export const usePlayers = (params, options = {}) => {
  return useQuery({
    queryKey: ['players', params],
    queryFn: () => playerApi.getPlayers(params),
    keepPreviousData: true,
    ...options,
  });
};

export const usePlayerById = (id, options = {}) => {
  return useQuery({
    queryKey: ['player', id],
    queryFn: () => playerApi.getPlayerById(id),
    enabled: !!id,
    ...options,
  });
};

export const usePlayerStats = (id, options = {}) => {
  return useQuery({
    queryKey: ['player', id, 'stats'],
    queryFn: () => playerApi.getPlayerStats(id),
    enabled: !!id,
    ...options,
  });
};

export const usePlayerAuctionHistory = (id, options = {}) => {
  return useQuery({
    queryKey: ['player', id, 'auctionHistory'],
    queryFn: () => playerApi.getPlayerAuctionHistory(id),
    enabled: !!id,
    ...options,
  });
};
