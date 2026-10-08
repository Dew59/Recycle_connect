import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import authorize from '../middlewares/authorizeMiddleware.js';
import { getActiveRecyclers, getPendingPickups, getAvailablePickups } from '../controllers/collectorController.js';
import validate from '../middlewares/validate.js';
import { getPendingPickupsSchema } from '../validator/pickupValidator.js';

const router = express.Router();

router.get(
    '/recyclers',
    authMiddleware,
    authorize('admin', 'collector'),
    getActiveRecyclers
);

router.get(
    '/pickups',
    authMiddleware,
    authorize('collector'),
    validate({
        query: getPendingPickupsSchema
    }),
    getPendingPickups
);

router.get(
    '/pickups/available',
    authMiddleware,
    authorize('collector'),
    validate({
        query: getPendingPickupsSchema
    }),
    getAvailablePickups
);

export default router;