import express from 'express';
import { getFlashpoints, getFlashpointAnalytics, getFlashpointById, searchFlashpoints, getFlashpointCollections, getFlashpointGraph } from '../controllers/flashpointController.js';

const router = express.Router();

router.get('/', getFlashpoints);
router.get('/analytics', getFlashpointAnalytics);
router.get('/collections', getFlashpointCollections);
router.get('/search', searchFlashpoints);
router.get('/:id/graph', getFlashpointGraph);
router.get('/:id', getFlashpointById);

export default router;
