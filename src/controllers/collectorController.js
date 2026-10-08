import asyncHandler from '../utils/asyncHandler.js';
import { getActiveRecyclersService } from '../services/collectorService.js';
import { getPendingPickupsService, getAvailablePickupsForCollectorService } from '../services/pickupService.js';

export const getActiveRecyclers = asyncHandler(async (req, res) => {
    const recyclers = await getActiveRecyclersService();

    res.status(200).json({
        success: true,
        message: 'Active recyclers retrieved successfully',
        data: recyclers
    });
});

export const getPendingPickups = asyncHandler(async (req, res) => {
    const { cursor } = req.validatedData.query;

    const result = await getPendingPickupsService({
        cursor
    });

    res.status(200).json({
        success: true,
        message: 'Pending pickups retrieved successfully',
        data: result
    });
});

export const getAvailablePickups = asyncHandler(async (req, res) => {
    const { cursor } = req.validatedData.query;

    const result = await getAvailablePickupsForCollectorService({
        collectorId: req.user.id,
        cursor
    });

    res.status(200).json({
        success: true,
        message: 'Available pickups retrieved successfully',
        data: result
    });
});