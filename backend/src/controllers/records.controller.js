import { asyncHandler, ApiResponse } from "../utils/index.js";
import * as recordsService from "../services/records.service.js";

export const getSeasonLeaderboards = asyncHandler(async (req, res) => {
  const result = await recordsService.getSeasonLeaderboards();
  ApiResponse(res, { data: result });
});

export const getDynamicRecord = asyncHandler(async (req, res) => {
  const { categoryId, recordId } = req.params;
  const result = await recordsService.getDynamicRecord(categoryId, recordId);
  ApiResponse(res, { data: result });
});
