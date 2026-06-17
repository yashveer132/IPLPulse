import { asyncHandler, ApiResponse, ApiError } from "../utils/index.js";
import * as advancedService from "../services/advanced.service.js";
import * as playerAdvancedService from "../services/playerAdvanced.service.js";

const cache = new Map();
const getCached = async (key, fetcher) => {
  if (cache.has(key)) return cache.get(key);
  const data = await fetcher();
  cache.set(key, data);
  return data;
};

export const getTeamDevelopmentIndex = asyncHandler(async (_req, res) => {
  const result = await advancedService.getTeamDevelopmentIndex();
  ApiResponse(res, { data: result });
});

export const getTeamDevelopmentBreakdown = asyncHandler(async (req, res) => {
  const result = await advancedService.getTeamDevelopmentBreakdown(
    req.params.franchiseId,
  );
  ApiResponse(res, { data: result });
});

export const getRetentionAnalytics = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await advancedService.getRetentionAnalytics(
    parseInt(page, 10) || 1,
    parseInt(limit, 10) || 25,
  );
  ApiResponse(res, { data: result });
});

export const getFranchiseIntelligenceScore = asyncHandler(async (_req, res) => {
  const result = await advancedService.getFranchiseIntelligenceScore();
  ApiResponse(res, { data: result });
});

export const getFranchiseTrends = asyncHandler(async (_req, res) => {
  const result = await advancedService.getFranchiseTrends();
  ApiResponse(res, { data: result });
});

export const getPlayerValueRankings = asyncHandler(async (req, res) => {
  const { role, page, limit } = req.query;
  const result = await advancedService.getPlayerValueRankings(
    role || "all",
    parseInt(page, 10) || 1,
    parseInt(limit, 10) || 50,
  );
  ApiResponse(res, { data: result });
});

export const getPlayerValueBreakdown = asyncHandler(async (req, res) => {
  const { playerId } = req.params;
  const result = await advancedService.getPlayerValueBreakdown(playerId);
  if (!result.player) {
    throw new ApiError(404, "Player not found");
  }
  ApiResponse(res, { data: result });
});

export const getPlatformSummary = asyncHandler(async (_req, res) => {
  const result = await advancedService.getPlatformSummary();
  ApiResponse(res, { data: result });
});

export const getFastestMilestone = asyncHandler(async (req, res) => {
  const { target } = req.query;
  const targetRuns = parseInt(target, 10);
  if (!targetRuns || targetRuns < 1 || targetRuns > 200) {
    return ApiResponse(
      res,
      { success: false, message: "Invalid target runs" },
      400,
    );
  }
  const result = await advancedService.getFastestMilestone(targetRuns);
  ApiResponse(res, { data: result });
});

export const getFastestMilestoneCurve = asyncHandler(async (_req, res) => {
  const result = await advancedService.getFastestMilestoneCurve();
  ApiResponse(res, { data: result });
});

export const getHeadToHead = asyncHandler(async (req, res) => {
  const { batterId, bowlerId } = req.query;
  if (!batterId || !bowlerId)
    {return ApiResponse(
      res,
      { success: false, message: "Missing players" },
      400,
    );}
  const result = await advancedService.getHeadToHead(batterId, bowlerId);
  ApiResponse(res, { data: result });
});

export const getVenueMastery = asyncHandler(async (req, res) => {
  const { playerId } = req.params;
  const result = await advancedService.getVenueMastery(playerId);
  ApiResponse(res, { data: result });
});

export const getCrazyStats = asyncHandler(async (req, res) => {
  const { playerId } = req.params;
  const result = await advancedService.getCrazyStats(playerId);
  ApiResponse(res, { data: result });
});

export const getSimilarPlayers = asyncHandler(async (req, res) => {
  const result = await getCached(`similar_${req.params.playerId}`, () =>
    playerAdvancedService.getSimilarPlayers(req.params.playerId),
  );
  ApiResponse(res, { data: result });
});

export const getLegacyScore = asyncHandler(async (req, res) => {
  const result = await getCached(`legacy_${req.params.playerId}`, () =>
    playerAdvancedService.getLegacyScore(req.params.playerId),
  );
  ApiResponse(res, { data: result });
});

export const getHistoricalRankings = asyncHandler(async (req, res) => {
  const result = await getCached(`hof_${req.params.playerId}`, () =>
    playerAdvancedService.getHistoricalRankings(req.params.playerId),
  );
  ApiResponse(res, { data: result });
});

export const getCareerMilestones = asyncHandler(async (req, res) => {
  const result = await getCached(`milestones_${req.params.playerId}`, () =>
    playerAdvancedService.getCareerMilestones(req.params.playerId),
  );
  ApiResponse(res, { data: result });
});

export const getImpactDifferential = asyncHandler(async (req, res) => {
  const result = await getCached(`impact_${req.params.playerId}`, () =>
    playerAdvancedService.getImpactDifferential(req.params.playerId),
  );
  ApiResponse(res, { data: result });
});

export const getHistoricalRivalries = asyncHandler(async (req, res) => {
  const result = await getCached(`rivalries_${req.params.playerId}`, () =>
    playerAdvancedService.getHistoricalRivalries(req.params.playerId),
  );
  ApiResponse(res, { data: result });
});

export const getCareerRecordsBook = asyncHandler(async (req, res) => {
  const result = await getCached(`records_${req.params.playerId}`, () =>
    playerAdvancedService.getCareerRecordsBook(req.params.playerId),
  );
  ApiResponse(res, { data: result });
});

export const getPlayerDNA = asyncHandler(async (req, res) => {
  const result = await getCached(`dna_${req.params.playerId}`, () =>
    playerAdvancedService.getPlayerDNA(req.params.playerId),
  );
  ApiResponse(res, { data: result });
});

export const getCareerTrajectory = asyncHandler(async (req, res) => {
  const result = await getCached(`trajectory_${req.params.playerId}`, () =>
    playerAdvancedService.getCareerTrajectory(req.params.playerId),
  );
  ApiResponse(res, { data: result });
});
