import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { approveCollectorService, getPendingCollectorsService, getCollectorIdentificationDocumentService, rejectCollectorService, registerRecyclerService, getAllCollectorsService, getAllHouseholdsService, getAllPickupsService, getAllIncentiveTransactionsService, getIncentiveTransactionByIdService, getAdminProfileService, updateAdminProfileService, changeAdminPasswordService, getAllAdminsService, getAdminByIdService } from '../services/adminService.js';
import { getPickupRatingsForAdminService } from '../services/ratingService.js';
import { getAdminDashboardService } from '../services/adminDashboardService.js';

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


export const getAdminProfile = asyncHandler(async (req, res) => {
    const admin = await getAdminProfileService(req.user.id);

    res.status(200).json({
        success: true,
        message: 'Admin profile retrieved successfully',
        data: admin
    });
});

export const updateAdminProfile = asyncHandler(async (req, res) => {
    const body = req.validatedData?.body ?? {};
    const profilePhoto = req.file;

    if (Object.keys(body).length === 0 && !profilePhoto) {
        throw new AppError(
            'Provide at least one profile field or a profile photo',
            400
        );
    }

    const admin = await updateAdminProfileService(
        req.user.id,
        {
            ...body,
            profilePhoto
        }
    );

    res.status(200).json({
        success: true,
        message: 'Admin profile updated successfully',
        data: admin
    });
});

export const changeAdminPassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.validatedData.body;

    const result = await changeAdminPasswordService(
        req.user.id,
        { currentPassword, newPassword }
    );

    res.status(200).json({
        success: true,
        message: result.message
    });
});

export const getPickupRatingsForAdmin = asyncHandler(async (req, res) => {
    const { pickupId } = req.validatedData.params;

    const ratings = await getPickupRatingsForAdminService(pickupId);

    res.status(200).json({
        success: true,
        message: 'Pickup ratings retrieved successfully',
        data: ratings
    });
});

export const getAdminDashboard = asyncHandler(async (req, res) => {
    const dashboard = await getAdminDashboardService();

    res.status(200).json({
        success: true,
        message: 'Admin dashboard retrieved successfully',
        data: dashboard
    });
});

export const getAllAdmins = asyncHandler(async (req, res) => {
    const { cursor } = req.validatedData.query;

    const result = await getAllAdminsService({ cursor });

    res.status(200).json({
        success: true,
        message: 'Admins retrieved successfully',
        data: result.admins,
        pagination: {
            nextCursor: result.nextCursor,
            limit: 10
        }
    });
});

export const getAdminById = asyncHandler(async (req, res) => {
    const { adminId } = req.validatedData.params;

    const admin = await getAdminByIdService(adminId);

    res.status(200).json({
        success: true,
        message: 'Admin retrieved successfully',
        data: admin
    });
});