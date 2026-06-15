import express from 'express';
import { getAllEntities, getEntityById } from '../controllers/entityController.js';

const router = express.Router();

router.get('/', getAllEntities);
router.get('/:id', getEntityById);

export default router;
