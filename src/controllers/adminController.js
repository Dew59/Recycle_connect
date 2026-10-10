import asyncHandler from '../utils/asyncHandler.js';
import { approveCollectorService, getPendingCollectorsService, getCollectorIdentificationDocumentService, rejectCollectorService, registerRecyclerService, getAllCollectorsService, getAllHouseholdsService, getAllPickupsService, getAllIncentiveTransactionsService, getIncentiveTransactionByIdService } from '../services/adminService.js';

export const getPendingCollectors = asyncHandler(async (req, res) => {
    const collectors = await getPendingCollectorsService();

    res.status(200).json({
        success: true,
        message: 'Pending collector requests retrieved successfully',
        data: collectors
    });
});

export const getCollectorIdentificationDocument = asyncHandler(
    async (req, res) => {
        const { collectorId } = req.params;

        const document =
            await getCollectorIdentificationDocumentService(
                collectorId
            );

        res.status(200).json({
            success: true,
            message: 'Collector identification document URL generated successfully',
            data: document
        });
    }
);

export const approveCollector = asyncHandler(async (req, res) => {
    const { collectorId } = req.params;

    const collector = await approveCollectorService(
        collectorId,
        req.user.id
    );

    res.status(200).json({
        success: true,
        message: 'Collector approved successfully',
        data: {
            id: collector._id,
            collectorId: collector.collectorId,
            fullName: collector.fullName,
            email: collector.email,
            approvalStatus: collector.approvalStatus,
            approvedAt: collector.approvedAt,
            approvedBy: collector.approvedBy,
            isActive: collector.isActive
        }
    });
});

export const rejectCollector = asyncHandler(async (req, res) => {
    const { collectorId } = req.params;
    const { rejectionReason } = req.validatedData.body;

    const collector = await rejectCollectorService(
        collectorId,
        rejectionReason
    );

    res.status(200).json({
        success: true,
        message: 'Collector rejected successfully',
        data: {
            id: collector._id,
            fullName: collector.fullName,
            email: collector.email,
            approvalStatus: collector.approvalStatus,
            rejectionReason: collector.rejectionReason,
            isActive: collector.isActive
        }
    });
});

export const registerRecycler = asyncHandler(async (req, res) => {
    const {
        businessName,
        email,
        phone,
        businessAddress,
        state,
        lga,
        cityTown,
        area
    } = req.validatedData.body;

    const profilePhoto = req.file;

    const recycler = await registerRecyclerService({
        businessName,
        email,
        phone,
        businessAddress,
        profilePhoto,
        state,
        lga,
        cityTown,
        area
    });

    res.status(201).json({
        success: true,
        message: 'Recycler registered successfully',
        data: {
            id: recycler._id,
            businessName: recycler.businessName,
            email: recycler.email,
            phone: recycler.phone,
            businessAddress: recycler.businessAddress,
            profilePhoto: recycler.profilePhoto,
            route: recycler.route,
            isActive: recycler.isActive,
            createdAt: recycler.createdAt,
            updatedAt: recycler.updatedAt
        }
    });
});

export const getAllCollectors = asyncHandler(async (req, res) => {
    const { cursor } = req.validatedData.query;

    const result = await getAllCollectorsService({ cursor });

    res.status(200).json({
        success: true,
        message: 'Collectors retrieved successfully',
        data: result.collectors,
        pagination: {
            nextCursor: result.nextCursor,
            limit: 10
        }
    });
});

export const getAllHouseholds = asyncHandler(async (req, res) => {
    const { cursor } = req.validatedData.query;

    const result = await getAllHouseholdsService({ cursor });

    res.status(200).json({
        success: true,
        message: 'Households retrieved successfully',
        data: result.households,
        pagination: {
            nextCursor: result.nextCursor,
            limit: 10
        }
    });
});

export const getAllPickups = asyncHandler(async (req, res) => {
    const { cursor } = req.validatedData.query;

    const result = await getAllPickupsService({ cursor });

    res.status(200).json({
        success: true,
        message: 'Pickups retrieved successfully',
        data: result.pickups,
        pagination: {
            nextCursor: result.nextCursor,
            limit: 10
        }
    });
});


export const getAllIncentiveTransactions = asyncHandler(
    async (req, res) => {
        const { cursor } = req.validatedData.query;

        const result = await getAllIncentiveTransactionsService({
            cursor
        });

        res.status(200).json({
            success: true,
            message: 'Incentive transactions retrieved successfully',
            data: result.transactions,
            pagination: {
                nextCursor: result.nextCursor,
                limit: 10
            }
        });
    }
);


export const getIncentiveTransactionById = asyncHandler(
    async (req, res) => {
        const { transactionId } = req.validatedData.params;

        const transaction =
            await getIncentiveTransactionByIdService(transactionId);

        res.status(200).json({
            success: true,
            message: 'Incentive transaction retrieved successfully',
            data: transaction
        });
    }
);
