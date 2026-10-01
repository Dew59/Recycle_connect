import uploadToCloudinary from '../utils/cloudinaryUpload.js';
import AppError from '../utils/AppError.js';

export const uploadIdentificationDocumentService = async (
    file,
    folder
) => {
    if (!file) {
        throw new AppError(
            'Identification document is required',
            400
        );
    }

    try {
        const result = await uploadToCloudinary(
            file.buffer,
            {
                folder,
                resourceType: 'image',
                type: 'authenticated'
            }
        );

        return {
            publicId: result.public_id,
            resourceType: result.resource_type,
            format: file.mimetype === 'application/pdf'
                ? 'pdf'
                : 'jpg'
        };
    } catch (error) {
        throw new AppError(
            'Failed to upload identification document',
            500
        );
    }
};