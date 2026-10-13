import Household from '../models/householdModel.js';
import Pickup from '../models/pickupModel.js';
import IncentiveTransaction from '../models/incentiveTransactionModel.js';
import AppError from '../utils/AppError.js';
import { getRatingSummaryService } from './ratingService.js';

export const getHouseholdDashboardService = async (householdId) => {
    const household = await Household.findById(householdId)
        .select('fullName profilePhoto isActive');

    if (!household) {
        throw new AppError('Household not found', 404);
    }

    const now = Date.now();

    const householdObjectId = household._id;

    const householdFilter = {
        household: householdObjectId
    };

    const [
        totalPickups,
        pickupStatusCounts,
        recentPickups,
        nextPickup,
        incentiveSummary,
        ratingSummary
    ] = await Promise.all([
        // Total number of pickups created by this Household.
        Pickup.countDocuments(householdFilter),

        // Count pickups by their current status.
        Pickup.aggregate([
            {
                $match: householdFilter
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]),

        // Five most recently created pickups.
        Pickup.find(householdFilter)
            .select('materials location date time timezone scheduledAt status createdAt')
            .populate({
                path: 'materials',
                select: 'name'
            })
            .sort({ createdAt: -1 })
            .limit(5)
            .lean(),

        // Earliest upcoming pickup, excluding terminal statuses.
        Pickup.find({
            ...householdFilter,
            status: {
                $nin: ['COMPLETED', 'CANCELLED']
            },
            scheduledAt: {
                $gt: new Date(now)
            }
        })
            .select(
                'materials location date time timezone scheduledAt status'
            )
            .populate({
                path: 'materials',
                select: 'name'
            })
            .sort({ scheduledAt: 1 })
            .limit(1)
            .lean()
            .then((pickups) => pickups[0] ?? null),


        // Only count incentive transactions for completed pickups.
        IncentiveTransaction.aggregate([
            {
                $match: {
                    household: household._id
                }
            },
            {
                $lookup: {
                    from: 'pickups',
                    localField: 'pickup',
                    foreignField: '_id',
                    as: 'pickupDetails'
                }
            },
            {
                $unwind: '$pickupDetails'
            },
            {
                $match: {
                    'pickupDetails.status': 'COMPLETED'
                }
            },
            {
                $group: {
                    _id: null,
                    totalIncentives: {
                        $sum: '$totalAmount'
                    },
                    transactionCount: {
                        $sum: 1
                    }
                }
            }
        ]),

        // Average and total ratings received by this Household.
        getRatingSummaryService({
            userId: householdId,
            userRole: 'household'
        })
    ]);

    const pickupCounts = {
        PENDING: 0,
        CLAIMED: 0,
        COLLECTED: 0,
        CONFIRMATION_PENDING: 0,
        COMPLETED: 0,
        CANCELLED: 0
    };

    for (const item of pickupStatusCounts) {
        if (Object.hasOwn(pickupCounts, item._id)) {
            pickupCounts[item._id] = item.count;
        }
    }

    const incentiveData = incentiveSummary[0];

    return {
        profile: {
            fullName: household.fullName,
            profilePhoto: household.profilePhoto,
            isActive: household.isActive,
            role: 'household'
        },

        pickups: {
            total: totalPickups,
            byStatus: pickupCounts,
            nextPickup,
            recent: recentPickups
        },

        incentives: {
            totalReceived: Number(
                incentiveData?.totalIncentives?.toString() ?? 0
            ),
            transactionCount: incentiveData?.transactionCount ?? 0,
            currency: 'NGN'
        },

        ratings: {
            averageRating: ratingSummary.averageRating,
            totalRatings: ratingSummary.totalRatings
        }
    };
};
