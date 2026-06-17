import { Router } from "express";
import { cacheMiddleware } from "../middleware/cache.middleware.js";
import healthRoutes from "./health.routes.js";
import playerRoutes from "./player.routes.js";
import franchiseRoutes from "./franchise.routes.js";
import auctionRoutes from "./auction.routes.js";
import rankingRoutes from "./ranking.routes.js";
import advancedRoutes from "./advanced.routes.js";
import seasonRoutes from "./season.routes.js";
import recordsRoutes from "./records.routes.js";
import flashpointRoutes from "./flashpointRoutes.js";
import entityRoutes from "./entityRoutes.js";

const router = Router();

const cache15m = cacheMiddleware(900);

router.use("/health", healthRoutes);
router.use("/players", cache15m, playerRoutes);
router.use("/franchises", cache15m, franchiseRoutes);
router.use("/auctions", cache15m, auctionRoutes);
router.use("/rankings", cache15m, rankingRoutes);
router.use("/analytics", cache15m, advancedRoutes);
router.use("/seasons", cache15m, seasonRoutes);
router.use("/records", cache15m, recordsRoutes);
router.use("/flashpoints", cache15m, flashpointRoutes);
router.use("/entities", cache15m, entityRoutes);

export default router;
