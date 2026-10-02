import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import authorize from '../middlewares/authorizeMiddleware.js';
import validate from '../middlewares/validate.js';
import { createIncentiveRate, updateIncentiveRate, getCurrentIncentiveRates } from '../controllers/incentiveRateController.js';
import { createIncentiveRateSchema, updateIncentiveRateSchema } from '../validator/incentiveRateValidator.js';

const router = express.Router();

router.post(
    '/',
    authMiddleware,
    authorize('admin'),
    validate({
        body: createIncentiveRateSchema
    }),
    createIncentiveRate
);

router.get(
    '/',
    authMiddleware,
    authorize('household', 'collector', 'admin'),
    getCurrentIncentiveRates
);

router.patch(
    '/:materialId',
    authMiddleware,
    authorize('admin'),
    validate({
        body: updateIncentiveRateSchema
    }),
    updateIncentiveRate
);

export default router;