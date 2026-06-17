import { Router } from "express";
import * as recordsController from "../controllers/records.controller.js";

const router = Router();

router.get("/", recordsController.getSeasonLeaderboards);
router.get("/:categoryId/:recordId", recordsController.getDynamicRecord);

export default router;
