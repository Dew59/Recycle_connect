import asyncHandler from '../utils/asyncHandler.js';
import { createIncentiveTransactionService } from '../services/incentiveTransactionService.js';

export const createIncentiveTransaction = asyncHandler(
    async (req, res) => {
        const { collectionId } = req.validatedData.params;

        const transaction =
            await createIncentiveTransactionService({
                collectionId,
                collectorId: req.user.id
            });

        res.status(201).json({
            success: true,
            message: 'Incentive transaction created successfully',
            data: transaction
        });
    }
);