import { Router } from "express";
import * as auctionController from "../controllers/auction.controller.js";

const router = Router();

router.get("/", auctionController.getAuctionEntries);
router.get("/search-suggestions", auctionController.getSearchSuggestions);
router.get("/seasons", auctionController.getAuctionSeasons);

export default router;
