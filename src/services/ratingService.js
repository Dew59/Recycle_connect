import mongoose from 'mongoose';
import Rating from '../models/ratingModel.js';
import Pickup from '../models/pickupModel.js';
import AppError from '../utils/AppError.js';

export const createRatingService = async ({
    pickupId,
    userId,
    userRole,
    stars,
    comment
}) => {
    // 1. Validate the pickup ID.
    if (!mongoose.Types.ObjectId.isValid(pickupId)) {
        throw new AppError('Invalid pickup ID', 400);
    }

    // 2. Find the pickup.
    const pickup = await Pickup.findById(pickupId);

    if (!pickup) {
        throw new AppError('Pickup not found', 404);
    }

    // 3. Ratings are allowed only after completion or cancellation.
    if (!['COMPLETED', 'CANCELLED'].includes(pickup.status)) {
        throw new AppError(
            'Ratings are only allowed for completed or cancelled pickups',
            409
        );
    }

    // 4. Determine the rater and recipient from the authenticated role.
    let raterModel;
    let rateeModel;
    let rateeId;

    if (userRole === 'household') {
        if (pickup.household.toString() !== userId) {
            throw new AppError(
                'You are not authorized to rate this pickup',
                403
            );
        }

        if (!pickup.collector) {
            throw new AppError(
                'This pickup has no assigned collector to rate',
                409
            );
        }

        raterModel = 'Household';
        rateeModel = 'Collector';
        rateeId = pickup.collector.toString();
    } else if (userRole === 'collector') {
        if (
            !pickup.collector ||
            pickup.collector.toString() !== userId
        ) {
            throw new AppError(
                'You are not authorized to rate this pickup',
                403
            );
        }

        raterModel = 'Collector';
        rateeModel = 'Household';
        rateeId = pickup.household.toString();
    } else {
        throw new AppError(
            'Only households and collectors can submit ratings',
            403
        );
    }

    // 5. Prevent duplicate ratings by the same participant.
    const existingRating = await Rating.findOne({
        pickup: pickupId,
        rater: userId
    });

    if (existingRating) {
        throw new AppError(
            'You have already rated this pickup. Ratings cannot be edited',
            409
        );
    }

    // 6. Create the rating.
    try {
        const rating = await Rating.create({
            pickup: pickupId,
            rater: userId,
            raterModel,
            ratee: rateeId,
            rateeModel,
            stars,
            comment
        });

        return rating;
    } catch (error) {
        // Handle concurrent requests that attempt duplicate submissions.
        if (error.code === 11000) {
            throw new AppError(
                'You have already rated this pickup. Ratings cannot be edited',
                409
            );
        }

        throw error;
    }
};


export const getHouseholdRatingHistoryService = async (householdId) => {
    const ratings = await Rating.find({
        rater: householdId,
        raterModel: 'Household'
    })
        .select('pickup raterModel rateeModel ratee stars comment createdAt')
        .sort({ createdAt: -1 });

    return ratings;
};

export const getCollectorRatingHistoryService = async (collectorId) => {
    const ratings = await Rating.find({
        rater: collectorId,
        raterModel: 'Collector'
    })
        .select('pickup raterModel rateeModel ratee stars comment createdAt')
        .sort({ createdAt: -1 });

    return ratings;
};

export const getPickupRatingsForAdminService = async (pickupId) => {
    if (!mongoose.Types.ObjectId.isValid(pickupId)) {
        throw new AppError('Invalid pickup ID', 400);
    }

    const pickup = await Pickup.findById(pickupId);

    if (!pickup) {
        throw new AppError('Pickup not found', 404);
    }

    const ratings = await Rating.find({
        pickup: pickup._id
    })
        .select('pickup rater raterModel ratee rateeModel stars comment createdAt')
        .sort({ createdAt: 1 });

    return ratings;
};

export const getRatingSummaryService = async ({
    userId,
    userRole
}) => {
    const rateeModel =
        userRole === 'household'
            ? 'Household'
            : userRole === 'collector'
                ? 'Collector'
                : null;

    if (!rateeModel) {
        throw new AppError(
            'Only households and collectors can retrieve rating summaries',
            403
        );
    }

    const summary = await Rating.aggregate([
        {
            $match: {
                ratee: new mongoose.Types.ObjectId(userId),
                rateeModel
            }
        },
        {
            $group: {
                _id: null,
                totalRatings: { $sum: 1 },
                averageRating: { $avg: '$stars' }
            }
        },
        {
            $project: {
                _id: 0,
                totalRatings: 1,
                averageRating: {
                    $round: ['$averageRating', 1]
                }
            }
        }
    ]);

    return summary[0] || {
        totalRatings: 0,
        averageRating: 0
    };
};
