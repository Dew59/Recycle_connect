import asyncHandler from '../utils/asyncHandler.js';
import { createPickupService, getHouseholdPickupsService, getPickupDetailsService, claimPickupService, deletePickupService, cancelClaimedPickupService, confirmPickupService } from '../services/pickupService.js';

export const createPickup = asyncHandler(async (req, res) => {
    const pickup = await createPickupService({
        householdId: req.user.id,
        ...req.validatedData.body,
        pickupPhoto: req.file
    });

    res.status(201).json({
        success: true,
        message: 'Pickup request created successfully',
        data: pickup
    });
});

export const getHouseholdPickups = asyncHandler(async (req, res) => {
    const { cursor } = req.validatedData.query;

    const result = await getHouseholdPickupsService({
        householdId: req.user.id,
        cursor
    });

    res.status(200).json({
        success: true,
        message: 'Household pickups retrieved successfully',
        data: result
    });
});

export const getPickupDetails = asyncHandler(async (req, res) => {
    const { pickupId } = req.validatedData.params;

    const pickup = await getPickupDetailsService({
        pickupId,
        userId: req.user.id,
        userRole: req.user.role
    });

    res.status(200).json({
        success: true,
        message: 'Pickup details retrieved successfully',
        data: pickup
    });
});

export const claimPickup = asyncHandler(async (req, res) => {
    const { pickupId } = req.validatedData.params;

    const pickup = await claimPickupService({
        pickupId,
        collectorId: req.user.id
    });

    res.status(200).json({
        success: true,
        message: 'Pickup claimed successfully',
        data: pickup
    });
});

export const deletePickup = asyncHandler(async (req, res) => {
    const { pickupId } = req.validatedData.params;

    await deletePickupService({
        pickupId,
        householdId: req.user.id
    });

    res.status(200).json({
        success: true,
        message: 'Pickup request deleted successfully'
    });
});

export const cancelClaimedPickup = asyncHandler(async (req, res) => {
    const { pickupId } = req.validatedData.params;
    const { cancellationReason } = req.validatedData.body;

    const pickup = await cancelClaimedPickupService({
        pickupId,
        householdId: req.user.id,
        cancellationReason
    });

    res.status(200).json({
        success: true,
        message: 'Pickup cancelled successfully',
        data: pickup
    });
});


export const confirmPickup = asyncHandler(async (req, res) => {
    const { pickupId } = req.validatedData.params;

    const pickup = await confirmPickupService({
        pickupId,
        householdId: req.user.id
    });

    res.status(200).json({
        success: true,
        message: 'Pickup confirmed successfully',
        data: pickup
    });
});
