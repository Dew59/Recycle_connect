import asyncHandler from '../utils/asyncHandler.js';
import { getActiveRecyclersService } from '../services/collectorService.js';

export const getActiveRecyclers = asyncHandler(async (req, res) => {
    const recyclers = await getActiveRecyclersService();

    res.status(200).json({
        success: true,
        message: 'Active recyclers retrieved successfully',
        data: recyclers
    });
});