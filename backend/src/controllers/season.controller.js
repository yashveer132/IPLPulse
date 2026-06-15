import { asyncHandler, ApiResponse, ApiError } from '../utils/index.js';
import * as seasonService from '../services/season.service.js';

export const getSeasons = asyncHandler(async (_req, res) => {
  const result = await seasonService.getSeasons();
  ApiResponse(res, { data: result });
});

export const getSeasonIntelligence = asyncHandler(async (req, res) => {
  const year = parseInt(req.params.year, 10);
  if (isNaN(year)) {
    throw new ApiError(400, 'Invalid year format');
  }

  const result = await seasonService.getSeasonIntelligence(year);
  ApiResponse(res, { data: result });
});
