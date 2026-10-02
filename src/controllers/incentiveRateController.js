import asyncHandler from '../utils/asyncHandler.js';
import { createIncentiveRateService, updateIncentiveRateService, getCurrentIncentiveRatesService } from '../services/incentiveRateService.js';

export const createIncentiveRate = asyncHandler(async (req, res) => {
    const incentiveRate = await createIncentiveRateService(
        req.validatedData.body
    );

    res.status(201).json({
        success: true,
        message: 'Incentive rate created successfully',
        data: incentiveRate
    });
});

export const updateIncentiveRate = asyncHandler(async (req, res) => {
    const { materialId } = req.params;

    const incentiveRate = await updateIncentiveRateService({
        materialId,
        ...req.validatedData.body
    });

    res.status(200).json({
        success: true,
        message: 'Incentive rate updated successfully',
        data: incentiveRate
    });
});

export const getCurrentIncentiveRates = asyncHandler(async (req, res) => {
    const incentiveRates = await getCurrentIncentiveRatesService();

    res.status(200).json({
        success: true,
        message: 'Current incentive rates retrieved successfully',
        data: incentiveRates
    });
});