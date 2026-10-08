import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import authorize from '../middlewares/authorizeMiddleware.js';
import validate from '../middlewares/validate.js';
import { createIncentiveTransactionParamsSchema } from '../validator/incentiveTransactionValidator.js';
import { createIncentiveTransaction } from '../controllers/incentiveTransactionController.js';

const router = express.Router();

router.post(
    '/:collectionId/incentive',
    authMiddleware,
    authorize('collector'),
    validate({
        params: createIncentiveTransactionParamsSchema
    }),
    createIncentiveTransaction
);

export default router;