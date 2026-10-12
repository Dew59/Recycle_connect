import Recycler from '../models/recyclerModel.js';
import Collector from '../models/collectorsModel.js';
import AppError from '../utils/AppError.js';
import cloudinary from '../config/cloudinaryConfig.js';
import uploadToCloudinary from '../utils/cloudinaryUpload.js';

export const getActiveRecyclersService = async () => {
    const recyclers = await Recycler.find({
        isActive: true
    })
        .select(
            'businessName email phone businessAddress profilePhoto route'
        )
        .sort({ businessName: 1 });

    return recyclers;
};


export const getCollectorProfileService = async (collectorId) => {
    const collector = await Collector.findById(collectorId)
        .select(
            'fullName email phone profilePhoto address route collectorId approvalStatus rejectionReason approvedAt isActive createdAt updatedAt'
        );

    if (!collector) {
        throw new AppError('Collector not found', 404);
    }

    return collector;
};

export const updateCollectorProfileService = async (
    collectorId,
    { phone, address, route, profilePhoto }
) => {
    const collector = await Collector.findById(collectorId);

    if (!collector) {
        throw new AppError('Collector not found', 404);
    }

    // Update only the fields supplied in the request.
    if (phone !== undefined) {
        collector.phone = phone;
    }

    if (address !== undefined) {
        collector.address = address;
    }

    if (route !== undefined) {
        if (route.state !== undefined) {
            collector.route.state = route.state;
        }

        if (route.lga !== undefined) {
            collector.route.lga = route.lga;
        }

        if (route.area !== undefined) {
            collector.route.area = route.area;
        }
    }

    const previousPhotoPublicId = collector.profilePhotoPublicId;
    let uploadedPhoto = null;

    try {
        // Upload a new photo only when one was provided.
        if (profilePhoto) {
            uploadedPhoto = await uploadToCloudinary(
                profilePhoto.buffer,
                {
                    folder: 'recycle-connect/profile-photos/collectors',
                    resourceType: 'image'
                }
            );

            collector.profilePhoto = uploadedPhoto.secure_url;
            collector.profilePhotoPublicId = uploadedPhoto.public_id;
        }

        await collector.save();
    } catch (error) {
        // Remove the new image if saving the profile fails.
        if (uploadedPhoto?.public_id) {
            try {
                await cloudinary.uploader.destroy(
                    uploadedPhoto.public_id,
                    { resource_type: 'image' }
                );
            } catch (cleanupError) {
                console.error(
                    'Failed to clean up newly uploaded photo:',
                    cleanupError.message
                );
            }
        }

        if (error instanceof AppError) {
            throw error;
        }

        throw new AppError('Failed to update Collector profile', 500);
    }

    // Delete the previous image only after the profile is saved.
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
                'Failed to delete previous Collector profile photo:',
                error.message
            );
        }
    }

    const updatedCollector = collector.toObject();
    delete updatedCollector.passwordHash;

    return updatedCollector;
};


export const changeCollectorPasswordService = async (
    collectorId,
    { currentPassword, newPassword }
) => {
    // Explicitly include passwordHash because the schema uses select: false.
    const collector = await Collector.findById(collectorId)
        .select('+passwordHash');

    if (!collector) {
        throw new AppError('Collector not found', 404);
    }

    // Verify the current password before allowing a change.
    const isPasswordCorrect = await collector.comparePassword(
        currentPassword
    );

    if (!isPasswordCorrect) {
        throw new AppError('Current password is incorrect', 400);
    }

    // Prevent changing the password to the same password.
    const isSamePassword = await collector.comparePassword(newPassword);

    if (isSamePassword) {
        throw new AppError(
            'New password must be different from the current password',
            400
        );
    }

    // The existing pre-save hook will hash this new password.
    collector.passwordHash = newPassword;

    await collector.save();

    return {
        message: 'Password changed successfully'
    };
};