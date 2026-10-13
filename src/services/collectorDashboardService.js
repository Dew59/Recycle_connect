import Collector from '../models/collectorsModel.js';
import Pickup from '../models/pickupModel.js';
import Collection from '../models/collectionModel.js';
import AppError from '../utils/AppError.js';
import { getRatingSummaryService } from './ratingService.js';

export const getCollectorDashboardService = async (collectorId) => {
    // 1. Retrieve the Collector's current profile and access status.
    const collector = await Collector.findById(collectorId)
        .select(
            'fullName profilePhoto collectorId approvalStatus isActive route'
        )
        .lean();

    if (!collector) {
        throw new AppError('Collector not found', 404);
    }

    if (
        collector.approvalStatus !== 'APPROVED' ||
        !collector.isActive
    ) {
        throw new AppError(
            'Only approved and active collectors can access the dashboard',
            403
        );
    }

    const collectorFilter = {
        collector: collector._id
    };

    // 2. Run independent dashboard queries in parallel.
    const [
        myPickupTotal,
        myPickupStatusCounts,
        recentMyPickups,
        availablePickupTotal,
        recentAvailablePickups,
        collectionSummary,
        ratingSummary
    ] = await Promise.all([
        // Total pickups claimed by this Collector, including cancelled ones.
        Pickup.countDocuments(collectorFilter),

        // Count this Collector's pickups by their current status.
        Pickup.aggregate([
            {
                $match: collectorFilter
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]),

        // Five most recently created pickups belonging to this Collector.
        Pickup.find(collectorFilter)
            .select(
                'household materials location date time timezone scheduledAt status createdAt updatedAt'
            )
            .populate({
                path: 'household',
                select: 'fullName phone'
            })
            .populate({
                path: 'materials',
                select: 'name description'
            })
            .sort({ createdAt: -1 })
            .limit(5)
            .lean(),

        // Count all currently available pickups in this Collector's state.
        Pickup.countDocuments({
            status: 'PENDING',
            collector: null,
            'location.state': collector.route.state
        }),

        // Five most recently created available pickups.
        Pickup.find({
            status: 'PENDING',
            collector: null,
            'location.state': collector.route.state
        })
            .select(
                'household materials location date time timezone scheduledAt status createdAt'
            )
            .populate({
                path: 'household',
                select: 'fullName phone'
            })
            .populate({
                path: 'materials',
                select: 'name description'
            })
            .sort({ createdAt: -1 })
            .limit(5)
            .lean(),

        // Count completed collections and sum actual material weights.
        Collection.aggregate([
            {
                $match: {
                    collector: collector._id
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
                $unwind: '$materials'
            },
            {
                $group: {
                    _id: null,
                    completedCollections: {
                        $addToSet: '$pickup'
                    },
                    totalActualWeight: {
                        $sum: {
                            $toDouble: '$materials.actualWeight'
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    completedCollectionCount: {
                        $size: '$completedCollections'
                    },
                    totalActualWeight: 1
                }
            }
        ]),

        // Average and total ratings received by this Collector.
        getRatingSummaryService({
            userId: collectorId,
            userRole: 'collector'
        })
    ]);

    // 3. Provide consistent zero values for every known pickup status.
    const pickupCounts = {
        CLAIMED: 0,
        COLLECTED: 0,
        CONFIRMATION_PENDING: 0,
        COMPLETED: 0,
        CANCELLED: 0
    };

    for (const item of myPickupStatusCounts) {
        if (Object.hasOwn(pickupCounts, item._id)) {
            pickupCounts[item._id] = item.count;
        }
    }

    const collectionData = collectionSummary[0];

    // 4. Return the dashboard data.
    return {
        profile: {
            fullName: collector.fullName,
            profilePhoto: collector.profilePhoto,
            collectorId: collector.collectorId,
            approvalStatus: collector.approvalStatus,
            isActive: collector.isActive,
            route: collector.route,
            role: 'collector'
        },

        pickups: {
            mine: {
                total: myPickupTotal,
                byStatus: pickupCounts,
                recent: recentMyPickups
            },

            available: {
                total: availablePickupTotal,
                recent: recentAvailablePickups
            }
        },

        collections: {
            completedCount:
                collectionData?.completedCollectionCount ?? 0,
            totalActualWeight: Number(
                collectionData?.totalActualWeight ?? 0
            )
        },

        ratings: {
            averageRating: ratingSummary.averageRating,
            totalRatings: ratingSummary.totalRatings
        }
    };
};
