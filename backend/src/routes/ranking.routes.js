import { Router } from 'express';
import * as rankingController from '../controllers/ranking.controller.js';

const router = Router();

router.get('/greatest-purchases', rankingController.getGreatestPurchases);
router.get('/biggest-bargains', rankingController.getBiggestBargains);
router.get('/biggest-disasters', rankingController.getBiggestDisasters);
router.get('/franchise-auction-iq', rankingController.getFranchiseAuctionIq);

export default router;
