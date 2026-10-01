import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import authorize from '../middlewares/authorizeMiddleware.js';
import { getActiveRecyclers } from '../controllers/collectorController.js';

const router = express.Router();

router.get(
    '/recyclers',
    authMiddleware,
    authorize('admin', 'collector'),
    getActiveRecyclers
);

export default router;