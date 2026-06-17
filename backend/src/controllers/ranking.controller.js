import { asyncHandler, ApiResponse } from "../utils/index.js";
import * as rankingService from "../services/ranking.service.js";

export const getGreatestPurchases = asyncHandler(async (req, res) => {
  const result = await rankingService.getGreatestPurchases(req.query);
  ApiResponse(res, { data: result });
});

export const getBiggestBargains = asyncHandler(async (req, res) => {
  const result = await rankingService.getBiggestBargains(req.query);
  ApiResponse(res, { data: result });
});

export const getBiggestDisasters = asyncHandler(async (req, res) => {
  const result = await rankingService.getBiggestDisasters(req.query);
  ApiResponse(res, { data: result });
});

export const getFranchiseAuctionIq = asyncHandler(async (req, res) => {
  const result = await rankingService.getFranchiseAuctionIq(req.query);
  ApiResponse(res, { data: result });
});
