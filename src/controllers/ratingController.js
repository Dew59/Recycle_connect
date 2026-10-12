import asyncHandler from '../utils/asyncHandler.js';
import { createRatingService } from '../services/ratingService.js';

export const createRating = asyncHandler(async (req, res) => {
    const { pickupId } = req.validatedData.params;
    const { stars, comment } = req.validatedData.body;

    const rating = await createRatingService({
        pickupId,
        userId: req.user.id,
        userRole: req.user.role,
        stars,
        comment
    });

    res.status(201).json({
        success: true,
        message: 'Rating submitted successfully',
        data: rating
    });
});