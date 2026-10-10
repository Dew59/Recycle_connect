import Collector from '../models/collectorsModel.js';
import Household from '../models/householdModel.js';
import Pickup from '../models/pickupModel.js';
import IncentiveTransaction from '../models/incentiveTransactionModel.js';
import AppError from '../utils/AppError.js';
import { generateAuthenticatedUrl } from '../utils/cloudinaryAccess.js';
import Recycler from '../models/recyclerModel.js';
import uploadToCloudinary from '../utils/cloudinaryUpload.js';

export const getPendingCollectorsService = async () => {
    const collectors = await Collector.find({
        approvalStatus: 'PENDING'
    })
        .select(
            'fullName email phone address profilePhoto identificationDocument approvalStatus createdAt'
        )
        .sort({ createdAt: -1 });

    return collectors;
};

export const getCollectorIdentificationDocumentService = async (
    collectorId
) => {
    const collector = await Collector.findById(collectorId).select(
        'fullName identificationDocument'
    );

    if (!collector) {
        throw new AppError('Collector not found', 404);
    }

    if (!collector.identificationDocument) {
        throw new AppError(
            'Collector identification document not found',
            404
        );
    }

    const {
        publicId,
        resourceType,
        format
    } = collector.identificationDocument;

    const documentUrl = generateAuthenticatedUrl({
        publicId,
        resourceType,
        format,
        expiresIn: 3600
    });

    return {
        collectorId: collector._id,
        fullName: collector.fullName,
        documentUrl,
        expiresIn: 3600
    };
};

export const approveCollectorService = async (collectorId, adminId) => {
    const collector = await Collector.findById(collectorId);

    if (!collector) {
        throw new AppError('Collector not found', 404);
    }

    if (collector.approvalStatus === 'APPROVED') {
        throw new AppError('Collector is already approved', 400);
    }

    const namePrefix = collector.fullName
        .replace(/\s+/g, '')
        .slice(0, 3)
        .toLowerCase();

    let generatedCollectorId;
    let isUnique = false;

    while (!isUnique) {
        const randomNumbers = Math.floor(100 + Math.random() * 900);

        generatedCollectorId = `COL-${namePrefix}${randomNumbers}`;

        const existingCollector = await Collector.findOne({
            collectorId: generatedCollectorId
        });

        if (!existingCollector) {
            isUnique = true;
        }
    }

    collector.collectorId = generatedCollectorId;
    collector.approvalStatus = 'APPROVED';
    collector.rejectionReason = null;
    collector.approvedAt = new Date();
    collector.approvedBy = adminId;

    await collector.save();

    return collector;
};

export const rejectCollectorService = async (
    collectorId,
    rejectionReason
) => {
    const collector = await Collector.findById(collectorId);

    if (!collector) {
        throw new AppError('Collector not found', 404);
    }

    if (collector.approvalStatus === 'APPROVED') {
        throw new AppError(
            'Approved collector cannot be rejected',
            400
        );
    }

    collector.approvalStatus = 'REJECTED';
    collector.rejectionReason = rejectionReason;
    collector.approvedAt = null;
    collector.approvedBy = null;

    await collector.save();

    return collector;
};

export const registerRecyclerService = async ({
    businessName,
    email,
    phone,
    businessAddress,
    profilePhoto,
    state,
    lga,
    cityTown,
    area
}) => {
    const existingRecycler = await Recycler.findOne({ email });

    if (existingRecycler) {
        throw new AppError(
            'A recycler with this email already exists',
            409
        );
    }

    let profilePhotoUrl = null;

    if (profilePhoto) {
        try {
            const profilePhotoResult = await uploadToCloudinary(
                profilePhoto.buffer,
                {
                    folder: 'recycle-connect/profile-photos/recyclers',
                    resourceType: 'image'
                }
            );

            profilePhotoUrl = profilePhotoResult.secure_url;
        } catch (error) {
            throw new AppError(
                'Failed to upload recycler profile photo',
                500
            );
        }
    }

    const recycler = await Recycler.create({
        businessName,
        email,
        phone,
        businessAddress,
        profilePhoto: profilePhotoUrl,
        route: {
            state,
            lga,
            cityTown,
            area
        },
        isActive: true
    });

    return recycler;
};

export const getAllCollectorsService = async ({ cursor }) => {
    const limit = 10;

    const query = {};

    if (cursor) {
        query._id = {
            $lt: cursor
        };
    }

    const collectors = await Collector.find(query)
        .select(
            'fullName email phone collectorId approvalStatus profilePhoto createdAt'
        )
        .sort({ _id: -1 })
        .limit(limit + 1);

    const hasNextPage = collectors.length > limit;

    if (hasNextPage) {
        collectors.pop();
    }

    const nextCursor = hasNextPage
        ? collectors[collectors.length - 1]._id
        : null;

    return {
        collectors,
        nextCursor
    };
};

export const getAllHouseholdsService = async ({ cursor }) => {
    const limit = 10;

    const query = {};

    if (cursor) {
        query._id = {
            $lt: cursor
        };
    }

    const households = await Household.find(query)
        .select(
            'fullName email phone profilePhoto isActive createdAt'
        )
        .sort({ _id: -1 })
        .limit(limit + 1);

    const hasNextPage = households.length > limit;

    if (hasNextPage) {
        households.pop();
    }

    const nextCursor = hasNextPage
        ? households[households.length - 1]._id
        : null;

    return {
        households,
        nextCursor
    };
};

export const getAllPickupsService = async ({ cursor }) => {
    const limit = 10;

    const query = {};

    if (cursor) {
        query._id = {
            $lt: cursor
        };
    }

    const pickups = await Pickup.find(query)
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
        })
        .select(
            'household materials location date time status image createdAt updatedAt'
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


export const getAllIncentiveTransactionsService = async ({ cursor }) => {
    const limit = 10;
    const query = {};

    if (cursor) {
        query._id = { $lt: cursor };
    }

    const transactions = await IncentiveTransaction.find(query)
        .populate({
            path: 'household',
            select: 'fullName phone email'
        })
        .populate({
            path: 'collector',
            select: 'fullName phone email collectorId'
        })
        .populate({
            path: 'pickup',
            select: 'location date time status'
        })
        .populate({
            path: 'collectionRecord',
            select: 'materials createdAt'
        })
        .populate({
            path: 'materials.material',
            select: 'name description'
        })
        .sort({ _id: -1 })
        .limit(limit + 1);

    const hasNextPage = transactions.length > limit;

    if (hasNextPage) {
        transactions.pop();
    }

    const nextCursor = hasNextPage
        ? transactions[transactions.length - 1]._id
        : null;

    return {
        transactions,
        nextCursor
    };
};


export const getIncentiveTransactionByIdService = async (transactionId) => {
    const transaction = await IncentiveTransaction.findById(transactionId)
        .populate({
            path: 'household',
            select: 'fullName phone email'
        })
        .populate({
            path: 'collector',
            select: 'fullName phone email collectorId'
        })
        .populate({
            path: 'pickup',
            select: 'location date time status'
        })
        .populate({
            path: 'collectionRecord',
            select: 'materials createdAt'
        })
        .populate({
            path: 'materials.material',
            select: 'name description'
        });

    if (!transaction) {
        throw new AppError('Incentive transaction not found', 404);
    }

    return transaction;
};
