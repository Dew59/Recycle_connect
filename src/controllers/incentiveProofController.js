import asyncHandler from '../utils/asyncHandler.js';
import {
    uploadIncentiveProofService
} from '../services/incentiveProofService.js';

export const uploadIncentiveProof = asyncHandler(
    async (req, res) => {

        const { collectionId } = req.validatedData.params;

        const transaction =
            await uploadIncentiveProofService({
                collectionId,
                collectorId: req.user.id,
                file: req.file
            });

        res.status(200).json({
            success: true,
            message: 'Incentive proof uploaded successfully',
            data: transaction
        });
    }
);