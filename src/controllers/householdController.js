import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { getHouseholdProfileService, updateHouseholdProfileService, changeHouseholdPasswordService } from '../services/householdService.js';
import { getHouseholdRatingHistoryService } from '../services/ratingService.js';
import { getHouseholdDashboardService } from '../services/householdDashboardService.js';

export const getHouseholdProfile = asyncHandler(async (req, res) => {
    const household = await getHouseholdProfileService(req.user.id);

    res.status(200).json({
        success: true,
        message: 'Household profile retrieved successfully',
        data: household
    });
});

export const updateHouseholdProfile = asyncHandler(async (req, res) => {
    const body = req.validatedData?.body ?? {};
    const profilePhoto = req.file;

    if (Object.keys(body).length === 0 && !profilePhoto) {
        throw new AppError(
            'Provide at least one profile field or a profile photo',
            400
        );
    }

    const household = await updateHouseholdProfileService(
        req.user.id,
        {
            ...body,
            profilePhoto
        }
    );

    res.status(200).json({
        success: true,
        message: 'Household profile updated successfully',
        data: household
    });
});

export const changeHouseholdPassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.validatedData.body;

    const result = await changeHouseholdPasswordService(
        req.user.id,
        { currentPassword, newPassword }
    );

    res.status(200).json({
        success: true,
        message: result.message
    });
});

export const getHouseholdRatingHistory = asyncHandler(async (req, res) => {
    const ratings = await getHouseholdRatingHistoryService(req.user.id);

    res.status(200).json({
        success: true,
        message: 'Household rating history retrieved successfully',
        data: ratings
    });
});

export const getHouseholdDashboard = asyncHandler(async (req, res) => {
    const dashboard = await getHouseholdDashboardService(req.user.id);

    res.status(200).json({
        success: true,
        message: 'Household dashboard retrieved successfully',
        data: dashboard
    });
});