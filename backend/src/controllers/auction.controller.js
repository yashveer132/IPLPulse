import { asyncHandler, ApiResponse } from '../utils/index.js';
import * as auctionService from '../services/auction.service.js';

export const getAuctionEntries = asyncHandler(async (req, res) => {
  const result = await auctionService.getAuctionEntries(req.query);
  ApiResponse(res, { data: result });
});

export const getAuctionSeasons = asyncHandler(async (_req, res) => {
  const seasons = await auctionService.getAuctionSeasons();
  ApiResponse(res, { data: seasons });
});
