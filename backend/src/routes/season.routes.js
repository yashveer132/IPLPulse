import { Router } from "express";
import * as seasonController from "../controllers/season.controller.js";

const router = Router();

router.get("/", seasonController.getSeasons);
router.get("/:year/intelligence", seasonController.getSeasonIntelligence);

export default router;
