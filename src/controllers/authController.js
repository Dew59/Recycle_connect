
import { registerHouseholdService, registerCollectorService, registerAdminService, loginHouseholdService, loginCollectorService, loginAdminService } from '../services/authService.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js'

export const registerHousehold = asyncHandler(async (req, res) => {
    const profilePhoto = req.file;

    const household = await registerHouseholdService({
        ...req.validatedData.body,
        profilePhoto
    });

    res.status(201).json({
        success: true,
        message: 'Household registered successfully',
        data: {
            id: household._id,
            fullName: household.fullName,
            email: household.email,
            phone: household.phone,
            profilePhoto: household.profilePhoto,
            isActive: household.isActive,
            createdAt: household.createdAt,
            updatedAt: household.updatedAt
        }
    });
});

export const registerCollector = asyncHandler(async (req, res) => {
    const files = req.files || {};

    const profilePhoto = files.profilePhoto?.[0];
    const identificationDocument =
        files.identificationDocument?.[0];

    if (!identificationDocument) {
        throw new AppError(
            'Identification document is required',
            400
        );
    }

    const collector = await registerCollectorService({
        ...req.validatedData.body,
        profilePhoto,
        identificationDocument
    });

    res.status(201).json({
        success: true,
        message: 'Collector registration submitted successfully',
        data: {
            id: collector._id,
            fullName: collector.fullName,
            email: collector.email,
            phone: collector.phone,
            profilePhoto: collector.profilePhoto,
            identificationDocument: collector.identificationDocument,
            route: collector.route,
            approvalStatus: collector.approvalStatus,
            isActive: collector.isActive,
            createdAt: collector.createdAt,
            updatedAt: collector.updatedAt
        }
    });
});

export const registerAdmin = asyncHandler(async (req, res) => {
    const profilePhoto = req.file;

    const admin = await registerAdminService({
        ...req.validatedData.body,
        profilePhoto
    });

    res.status(201).json({
        success: true,
        message: 'Admin registered successfully',
        data: {
            id: admin._id,
            fullName: admin.fullName,
            email: admin.email,
            phone: admin.phone,
            profilePhoto: admin.profilePhoto,
            isActive: admin.isActive,
            createdAt: admin.createdAt,
            updatedAt: admin.updatedAt
        }
    });
});

export const loginHousehold = asyncHandler(async (req, res) => {
    const { household, token } = await loginHouseholdService(
        req.validatedData.body
    );

    res.status(200).json({
        success: true,
        message: 'Household login successful',
        data: {
            token,
            household: {
                id: household._id,
                fullName: household.fullName,
                email: household.email,
                phone: household.phone,
                profilePhoto: household.profilePhoto,
                isActive: household.isActive
            }
        }
    });
});

export const loginCollector = asyncHandler(async (req, res) => {
    const { collector, token } = await loginCollectorService(
        req.validatedData.body
    );

    res.status(200).json({
        success: true,
        message: 'Collector login successful',
        data: {
            token,
            collector: {
                id: collector._id,
                collectorId: collector.collectorId,
                fullName: collector.fullName,
                email: collector.email,
                phone: collector.phone,
                profilePhoto: collector.profilePhoto,
                address: collector.address,
                route: collector.route,
                approvalStatus: collector.approvalStatus,
                isActive: collector.isActive
            }
        }
    });
});

export const loginAdmin = asyncHandler(async (req, res) => {
    const { admin, token } = await loginAdminService(
        req.validatedData.body
    );

    res.status(200).json({
        success: true,
        message: 'Admin login successful',
        data: {
            token,
            admin: {
                id: admin._id,
                fullName: admin.fullName,
                email: admin.email,
                phone: admin.phone,
                profilePhoto: admin.profilePhoto,
                isActive: admin.isActive
            }
        }
    });
});