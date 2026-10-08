import asyncHandler from '../utils/asyncHandler.js';
import { createCollectionService } from '../services/collectionService.js';

export const createCollection = asyncHandler(async (req, res) => {
    const { pickupId } = req.validatedData.params;
    const { materials } = req.validatedData.body;

    const collection = await createCollectionService({
        pickupId,
        collectorId: req.user.id,
        materials
    });

    res.status(201).json({
        success: true,
        message: 'Collection recorded successfully',
        data: collection
    });
});