import { Router } from 'express';
import * as advancedController from '../controllers/advanced.controller.js';

const router = Router();

router.get('/summary', advancedController.getPlatformSummary);
router.get('/team-development', advancedController.getTeamDevelopmentIndex);
router.get('/team-development/:franchiseId', advancedController.getTeamDevelopmentBreakdown);
router.get('/retentions', advancedController.getRetentionAnalytics);
router.get('/franchise-intelligence', advancedController.getFranchiseIntelligenceScore);
router.get('/franchise-trends', advancedController.getFranchiseTrends);

router.get('/player-value', advancedController.getPlayerValueRankings);
router.get('/player-value/:playerId', advancedController.getPlayerValueBreakdown);

router.get('/fastest-milestone', advancedController.getFastestMilestone);
router.get('/fastest-milestone-curve', advancedController.getFastestMilestoneCurve);

router.get('/head-to-head', advancedController.getHeadToHead);
router.get('/venue-mastery/:playerId', advancedController.getVenueMastery);
router.get('/crazy-stats/:playerId', advancedController.getCrazyStats);

router.get('/similar-players/:playerId', advancedController.getSimilarPlayers);
router.get('/legacy-score/:playerId', advancedController.getLegacyScore);
router.get('/historical-rankings/:playerId', advancedController.getHistoricalRankings);
router.get('/career-milestones/:playerId', advancedController.getCareerMilestones);
router.get('/impact-differential/:playerId', advancedController.getImpactDifferential);
router.get('/historical-rivalries/:playerId', advancedController.getHistoricalRivalries);
router.get('/career-records/:playerId', advancedController.getCareerRecordsBook);
router.get('/player-dna/:playerId', advancedController.getPlayerDNA);
router.get('/career-trajectory/:playerId', advancedController.getCareerTrajectory);

export default router;
