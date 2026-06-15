import { Router } from 'express';
import healthRoutes from './health.routes.js';
import playerRoutes from './player.routes.js';
import franchiseRoutes from './franchise.routes.js';
import auctionRoutes from './auction.routes.js';
import rankingRoutes from './ranking.routes.js';
import advancedRoutes from './advanced.routes.js';
import seasonRoutes from './season.routes.js';
import recordsRoutes from './records.routes.js';
import flashpointRoutes from './flashpointRoutes.js';
import entityRoutes from './entityRoutes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/players', playerRoutes);
router.use('/franchises', franchiseRoutes);
router.use('/auctions', auctionRoutes);
router.use('/rankings', rankingRoutes);
router.use('/analytics', advancedRoutes);
router.use('/seasons', seasonRoutes);
router.use('/records', recordsRoutes);
router.use('/flashpoints', flashpointRoutes);
router.use('/entities', entityRoutes);

export default router;
