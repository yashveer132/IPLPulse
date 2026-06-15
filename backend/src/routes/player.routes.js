import { Router } from 'express';
import * as playerController from '../controllers/player.controller.js';

const router = Router();

router.get('/', playerController.getPlayers);
router.get('/:id', playerController.getPlayerById);
router.get('/:id/stats', playerController.getPlayerStats);
router.get('/:id/auction-history', playerController.getPlayerAuctionHistory);

export default router;
