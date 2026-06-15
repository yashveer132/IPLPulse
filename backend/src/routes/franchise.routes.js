import { Router } from "express";
import * as franchiseController from "../controllers/franchise.controller.js";

const router = Router();

router.get("/", franchiseController.getFranchises);
router.get("/compare", franchiseController.compareFranchises);
router.get("/:id", franchiseController.getFranchiseById);
router.get("/:id/seasons", franchiseController.getFranchiseSeasons);
router.get("/:id/squad/:season", franchiseController.getFranchiseSquad);

router.get("/:id/intelligence", franchiseController.getFranchiseIntelligence);
router.get("/:id/legends", franchiseController.getFranchiseLegends);
router.get("/:id/rivalries", franchiseController.getFranchiseRivalries);
router.get("/:id/fortress", franchiseController.getHomeFortress);
router.get(
  "/:id/auction-intelligence",
  franchiseController.getAuctionIntelligence,
);

export default router;
