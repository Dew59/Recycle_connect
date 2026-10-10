import Pickup from '../models/pickupModel.js';
import Material from '../models/materialModel.js';
import Collector from '../models/collectorsModel.js';
import AppError from '../utils/AppError.js';
import uploadToCloudinary from '../utils/cloudinaryUpload.js';
import { sendPickupCancellationEmail } from './emailService.js';
import IncentiveTransaction from '../models/incentiveTransactionModel.js';

export const createPickupService = async ({
    householdId,
    materials,
    location,
    note,
    date,
    time,
    pickupPhoto
}) => {
    const materialCount = await Material.countDocuments({
        _id: { $in: materials }
    });

    if (materialCount !== materials.length) {
        throw new AppError(
            'One or more selected materials were not found',
            404
        );
    }

    let image = null;

    if (pickupPhoto) {
        try {
            const result = await uploadToCloudinary(
                pickupPhoto.buffer,
                {
                    folder: 'recycle-connect/pickups',
                    resourceType: 'image',
                    type: 'upload'
                }
            );

            image = result.secure_url;
        } catch (error) {
            throw new AppError(
                'Failed to upload pickup image',
                500
            );
        }
    }

    const pickup = await Pickup.create({
        household: householdId,
        materials,
        location,
        note,
        image,
        date,
        time,
        status: 'PENDING'
    });

    await pickup.populate({
        path: 'household',
        select: 'fullName phone'
    });

    await pickup.populate({
        path: 'materials',
        select: 'name description'
    });

    return pickup;
};

export const getHouseholdPickupsService = async ({
    householdId,
    cursor
}) => {
    const limit = 10;

    const query = {
        household: householdId
    };

    if (cursor) {
        query._id = {
            $lt: cursor
        };
    }

    const pickups = await Pickup.find(query)
        .populate({
            path: 'materials',
            select: 'name description'
        })
        .select(
            'materials location note image date time status collector createdAt updatedAt'
        )
        .sort({ _id: -1 })
        .limit(limit + 1);

    const hasNextPage = pickups.length > limit;

    if (hasNextPage) {
        pickups.pop();
    }

    const nextCursor = hasNextPage
        ? pickups[pickups.length - 1]._id
        : null;

    return {
        pickups,
        nextCursor
    };
};

export const getPendingPickupsService = async ({
    cursor
}) => {
    const limit = 10;

    const query = {
        status: 'PENDING',
        collector: null
    };

    if (cursor) {
        query._id = {
            $lt: cursor
        };
    }

    const pickups = await Pickup.find(query)
        .populate({
            path: 'materials',
            select: 'name description'
        })
        .populate({
            path: 'household',
            select: 'fullName phone'
        })
        .select(
            'household materials location note image date time status createdAt updatedAt'
        )
        .sort({ _id: -1 })
        .limit(limit + 1);

    const hasNextPage = pickups.length > limit;

    if (hasNextPage) {
        pickups.pop();
    }

    const nextCursor = hasNextPage
        ? pickups[pickups.length - 1]._id
        : null;

    return {
        pickups,
        nextCursor
    };
};

export const getAvailablePickupsForCollectorService = async ({
    collectorId,
    cursor
}) => {
    const limit = 10;

    const collector = await Collector.findById(collectorId)
        .select('route');

    if (!collector) {
        throw new AppError('Collector not found', 404);
    }

    const query = {
        status: 'PENDING',
        collector: null,
        'location.state': collector.route.state
    };

    if (cursor) {
        query._id = {
            $lt: cursor
        };
    }

    const pickups = await Pickup.find(query)
        .populate({
            path: 'materials',
            select: 'name description'
        })
        .populate({
            path: 'household',
            select: 'fullName phone'
        })
        .select(
            'household materials location note image date time status createdAt updatedAt'
        )
        .sort({ _id: -1 })
        .limit(limit + 1);

    const hasNextPage = pickups.length > limit;

    if (hasNextPage) {
        pickups.pop();
    }

    const nextCursor = hasNextPage
        ? pickups[pickups.length - 1]._id
        : null;

    return {
        pickups,
        nextCursor
    };
};

export const getPickupDetailsService = async ({
    pickupId,
    userId,
    userRole
}) => {
    const pickup = await Pickup.findById(pickupId)
        .populate({
            path: 'household',
            select: 'fullName phone email'
        })
        .populate({
            path: 'materials',
            select: 'name description'
        })
        .populate({
            path: 'collector',
            select: 'fullName phone email collectorId'
        });

    if (!pickup) {
        throw new AppError('Pickup not found', 404);
    }

    // Admin can view every pickup at any status.
    if (userRole === 'admin') {
        return pickup;
    }

    // Household can only view their own pickup.

    // Household can only view their own pickup.
    if (userRole === 'household') {
        if (pickup.household._id.toString() !== userId) {
            throw new AppError(
                'You are not authorized to view this pickup',
                403
            );
        }

        const transaction = await IncentiveTransaction.findOne({
            pickup: pickup._id
        }).select('proof totalAmount currency');

        const pickupData = pickup.toObject();

        pickupData.incentiveTransaction = transaction
            ? {
                proof: transaction.proof,
                totalAmount: transaction.totalAmount,
                currency: transaction.currency
            }
            : null;

        return pickupData;
    }


    // Collector can view pending pickups before claiming.
    if (userRole === 'collector') {
        const collector = await Collector.findById(userId)
            .select('approvalStatus');

        if (
            !collector ||
            collector.approvalStatus !== 'APPROVED'
        ) {
            throw new AppError(
                'Only approved collectors can view pickup details',
                403
            );
        }

        if (pickup.status === 'PENDING') {
            return pickup;
        }

        // After claiming, only the Collector who claimed it
        // can continue viewing the pickup.
        if (
            !pickup.collector ||
            pickup.collector._id.toString() !== userId
        ) {
            throw new AppError(
                'You are not authorized to view this pickup',
                403
            );
        }

        return pickup;
    }

    throw new AppError(
        'You are not authorized to view this pickup',
        403
    );
};

export const claimPickupService = async ({
    pickupId,
    collectorId
}) => {
    const pickup = await Pickup.findOneAndUpdate(
        {
            _id: pickupId,
            status: 'PENDING',
            collector: null
        },
        {
            $set: {
                collector: collectorId,
                status: 'CLAIMED'
            }
        },
        {
            new: true
        }
    );

    if (!pickup) {
        const existingPickup = await Pickup.findById(pickupId);

        if (!existingPickup) {
            throw new AppError('Pickup not found', 404);
        }

        if (existingPickup.collector) {
            throw new AppError(
                'This pickup has already been claimed',
                409
            );
        }

        if (existingPickup.status !== 'PENDING') {
            throw new AppError(
                'This pickup is no longer available for claiming',
                409
            );
        }

        throw new AppError(
            'Unable to claim this pickup',
            409
        );
    }

    await pickup.populate({
        path: 'household',
        select: 'fullName phone'
    });

    await pickup.populate({
        path: 'materials',
        select: 'name description'
    });

    await pickup.populate({
        path: 'collector',
        select: 'fullName phone email collectorId'
    });

    return pickup;
};

export const deletePickupService = async ({
    pickupId,
    householdId
}) => {
    const pickup = await Pickup.findById(pickupId);

    if (!pickup) {
        throw new AppError('Pickup not found', 404);
    }

    if (pickup.household.toString() !== householdId) {
        throw new AppError(
            'You are not authorized to delete this pickup',
            403
        );
    }

    if (pickup.status !== 'PENDING') {
        throw new AppError(
            'Only pending pickups can be deleted',
            409
        );
    }

    await Pickup.deleteOne({
        _id: pickupId
    });
};

export const cancelClaimedPickupService = async ({
    pickupId,
    householdId,
    cancellationReason
}) => {
    const pickup = await Pickup.findById(pickupId)
        .populate({
            path: 'collector',
            select: 'fullName email'
        })
        .populate({
            path: 'household',
            select: 'fullName'
        })
        .populate({
            path: 'materials',
            select: 'name'
        });

    if (!pickup) {
        throw new AppError('Pickup not found', 404);
    }

    if (pickup.household._id.toString() !== householdId) {
        throw new AppError(
            'You are not authorized to cancel this pickup',
            403
        );
    }

    if (['PENDING', 'COMPLETED', 'CANCELLED'].includes(pickup.status)) {
        throw new AppError(
            'This pickup cannot be cancelled in its current status',
            409
        );
    }

    if (!pickup.collector) {
        throw new AppError(
            'This pickup does not have a claiming collector',
            409
        );
    }

    pickup.status = 'CANCELLED';
    pickup.cancellationReason = cancellationReason;

    await pickup.save();

    try {
        await sendPickupCancellationEmail({
            collectorName: pickup.collector.fullName,
            collectorEmail: pickup.collector.email,
            householdName: pickup.household.fullName,
            pickupDate: pickup.date.toLocaleDateString('en-NG'),
            pickupTime: pickup.time,
            pickupLocation: [
                pickup.location.street,
                pickup.location.area,
                pickup.location.city,
                pickup.location.lga,
                pickup.location.state
            ]
                .filter(Boolean)
                .join(', '),
            materials: pickup.materials
                .map(material => material.name)
                .join(', '),
            cancellationReason
        });
    } catch (error) {
        console.error(
            'Failed to send pickup cancellation email:',
            error
        );
    }

    return pickup;
};


export const confirmPickupService = async ({
    pickupId,
    householdId
}) => {
    // 1. Find the pickup
    const pickup = await Pickup.findById(pickupId);

    if (!pickup) {
        throw new AppError('Pickup not found', 404);
    }

    // 2. Verify household ownership
    if (pickup.household.toString() !== householdId) {
        throw new AppError(
            'You are not authorized to confirm this pickup',
            403
        );
    }

    // 3. Ensure the pickup is awaiting confirmation
    if (pickup.status !== 'CONFIRMATION_PENDING') {
        throw new AppError(
            'Only pickups awaiting household confirmation can be confirmed',
            409
        );
    }

    // 4. Ensure the incentive transaction has saved proof
    const transaction = await IncentiveTransaction.findOne({
        pickup: pickup._id
    }).select('proof');

    if (!transaction || !transaction.proof) {
        throw new AppError(
            'Incentive proof must be uploaded before confirming this pickup',
            409
        );
    }

    // 5. Complete the pickup atomically
    const confirmedPickup = await Pickup.findOneAndUpdate(
        {
            _id: pickupId,
            household: householdId,
            status: 'CONFIRMATION_PENDING'
        },
        {
            $set: {
                status: 'COMPLETED',
                confirmationMessage:
                    'My recyclable materials were collected and I received the calculated incentive.',
                confirmedAt: new Date()
            }
        },
        {
            new: true,
            runValidators: true
        }
    );

    if (!confirmedPickup) {
        throw new AppError(
            'This pickup could not be confirmed. Its status may have changed.',
            409
        );
    }

    await confirmedPickup.populate([
        {
            path: 'household',
            select: 'fullName phone email'
        },
        {
            path: 'materials',
            select: 'name description'
        },
        {
            path: 'collector',
            select: 'fullName phone email collectorId'
        }
    ]);

    return confirmedPickup;
};
