import Household from '../models/householdModel.js';
import AppError from '../utils/AppError.js';
import cloudinary from '../config/cloudinaryConfig.js';
import uploadToCloudinary from '../utils/cloudinaryUpload.js';

export const getHouseholdProfileService = async (householdId) => {
    const household = await Household.findById(householdId)
        .select(
            'fullName email phone profilePhoto isActive createdAt updatedAt'
        );

    if (!household) {
        throw new AppError('Household not found', 404);
    }

    return household;
};

export const updateHouseholdProfileService = async (
    householdId,
    { fullName, phone, profilePhoto }
) => {
    const household = await Household.findById(householdId);

    if (!household) {
        throw new AppError('Household not found', 404);
    }

    if (fullName !== undefined) {
        household.fullName = fullName;
    }

    if (phone !== undefined) {
        household.phone = phone;
    }

    const previousPhotoPublicId = household.profilePhotoPublicId;
    let uploadedPhoto = null;

    try {
        if (profilePhoto) {
            uploadedPhoto = await uploadToCloudinary(
                profilePhoto.buffer,
                {
                    folder: 'recycle-connect/profile-photos/households',
                    resourceType: 'image'
                }
            );

            household.profilePhoto = uploadedPhoto.secure_url;
            household.profilePhotoPublicId = uploadedPhoto.public_id;
        }

        await household.save();
    } catch (error) {
        if (uploadedPhoto?.public_id) {
            try {
                await cloudinary.uploader.destroy(
                    uploadedPhoto.public_id,
                    { resource_type: 'image' }
                );
            } catch (cleanupError) {
                console.error(
                    'Failed to clean up newly uploaded Household photo:',
                    cleanupError.message
                );
            }
        }

        if (error instanceof AppError) {
            throw error;
        }

        throw new AppError('Failed to update Household profile', 500);
    }

    if (
        uploadedPhoto &&
        previousPhotoPublicId &&
        previousPhotoPublicId !== uploadedPhoto.public_id
    ) {
        try {
            await cloudinary.uploader.destroy(
                previousPhotoPublicId,
                { resource_type: 'image' }
            );
        } catch (error) {
            console.error(
                'Failed to delete previous Household profile photo:',
                error.message
            );
        }
    }

    const updatedHousehold = household.toObject();
    delete updatedHousehold.passwordHash;

    return updatedHousehold;
};

export const changeHouseholdPasswordService = async (
    householdId,
    { currentPassword, newPassword }
) => {
    // passwordHash is hidden by default in the Household model.
    const household = await Household.findById(householdId)
        .select('+passwordHash');

    if (!household) {
        throw new AppError('Household not found', 404);
    }

    const isPasswordCorrect = await household.comparePassword(
        currentPassword
    );

    if (!isPasswordCorrect) {
        throw new AppError('Current password is incorrect', 400);
    }

    const isSamePassword = await household.comparePassword(newPassword);

    if (isSamePassword) {
        throw new AppError(
            'New password must be different from the current password',
            400
        );
    }

    // Let the existing Mongoose pre-save hook hash the new password.
    household.passwordHash = newPassword;

    await household.save();

    return {
        message: 'Password changed successfully'
    };
};
