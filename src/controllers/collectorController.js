import asyncHandler from '../utils/asyncHandler.js';
import { getActiveRecyclersService, getCollectorProfileService, updateCollectorProfileService, changeCollectorPasswordService } from '../services/collectorService.js';
import { getPendingPickupsService, getAvailablePickupsForCollectorService } from '../services/pickupService.js';
import AppError from '../utils/AppError.js';
import { getCollectorRatingHistoryService } from '../services/ratingService.js';

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


export const getCollectorProfile = asyncHandler(async (req, res) => {
    const collector = await getCollectorProfileService(req.user.id);

    res.status(200).json({
        success: true,
        message: 'Collector profile retrieved successfully',
        data: collector
    });
});

export const updateCollectorProfile = asyncHandler(async (req, res) => {
    const body = req.validatedData?.body ?? {};

    const hasProfileFields = Object.keys(body).length > 0;
    const profilePhoto = req.file;

    if (!hasProfileFields && !profilePhoto) {
        throw new AppError(
            'Provide at least one profile field or a profile photo',
            400
        );
    }

    const collector = await updateCollectorProfileService(
        req.user.id,
        {
            ...body,
            profilePhoto
        }
    );

    res.status(200).json({
        success: true,
        message: 'Collector profile updated successfully',
        data: collector
    });
});


export const changeCollectorPassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.validatedData.body;

    const result = await changeCollectorPasswordService(
        req.user.id,
        { currentPassword, newPassword }
    );

    res.status(200).json({
        success: true,
        message: result.message
    });
});

export const getCollectorRatingHistory = asyncHandler(async (req, res) => {
    const ratings = await getCollectorRatingHistoryService(req.user.id);

    res.status(200).json({
        success: true,
        message: 'Collector rating history retrieved successfully',
        data: ratings
    });
});
