import { asyncHandler, ApiResponse, ApiError } from "../utils/index.js";
import * as franchiseService from "../services/franchise.service.js";

export const getFranchises = asyncHandler(async (_req, res) => {
  const franchises = await franchiseService.getFranchises();
  ApiResponse(res, { data: franchises });
});

export const getFranchiseById = asyncHandler(async (req, res) => {
  const franchise = await franchiseService.getFranchiseById(req.params.id);
  if (!franchise) throw ApiError.notFound("Franchise not found");
  ApiResponse(res, { data: franchise });
});

export const getFranchiseSeasons = asyncHandler(async (req, res) => {
  const seasons = await franchiseService.getFranchiseSeasons(req.params.id);
  ApiResponse(res, { data: seasons });
});

export const getFranchiseSquad = asyncHandler(async (req, res) => {
  const { season } = req.params;
  const squad = await franchiseService.getFranchiseSquad(
    req.params.id,
    parseInt(season, 10),
  );
  ApiResponse(res, { data: squad });
});

export const compareFranchises = asyncHandler(async (req, res) => {
  const { ids } = req.query;
  if (!ids) throw ApiError.badRequest("Provide franchise IDs as ?ids=id1,id2");
  const idArray = ids.split(",").map((s) => s.trim());
  if (idArray.length < 2)
    {throw ApiError.badRequest("Provide at least 2 franchise IDs");}
  const result = await franchiseService.compareFranchises(idArray);
  ApiResponse(res, { data: result });
});

export const getFranchiseIntelligence = asyncHandler(async (req, res) => {
  const data = await franchiseService.getFranchiseIntelligence(req.params.id);
  ApiResponse(res, { data });
});

export const getFranchiseLegends = asyncHandler(async (req, res) => {
  const data = await franchiseService.getFranchiseLegends(req.params.id);
  ApiResponse(res, { data });
});

export const getFranchiseRivalries = asyncHandler(async (req, res) => {
  const data = await franchiseService.getFranchiseRivalries(req.params.id);
  ApiResponse(res, { data });
});

export const getHomeFortress = asyncHandler(async (req, res) => {
  const data = await franchiseService.getHomeFortress(req.params.id);
  ApiResponse(res, { data });
});

export const getAuctionIntelligence = asyncHandler(async (req, res) => {
  const data = await franchiseService.getAuctionIntelligence(req.params.id);
  ApiResponse(res, { data });
});
