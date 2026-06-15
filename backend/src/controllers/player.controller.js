import { asyncHandler, ApiResponse, ApiError } from '../utils/index.js';
import * as playerService from '../services/player.service.js';

export const getPlayers = asyncHandler(async (req, res) => {
  const { search, role, nationality, page, limit } = req.query;
  const result = await playerService.getPlayers({
    search, role, nationality,
    page: parseInt(page, 10) || 1,
    limit: parseInt(limit, 10) || 20,
  });
  ApiResponse(res, { data: result });
});

export const getPlayerById = asyncHandler(async (req, res) => {
  const player = await playerService.getPlayerById(req.params.id);
  if (!player) throw ApiError.notFound('Player not found');
  ApiResponse(res, { data: player });
});

export const getPlayerStats = asyncHandler(async (req, res) => {
  const stats = await playerService.getPlayerStats(req.params.id);
  ApiResponse(res, { data: stats });
});

export const getPlayerAuctionHistory = asyncHandler(async (req, res) => {
  const history = await playerService.getPlayerAuctionHistory(req.params.id);
  ApiResponse(res, { data: history });
});
