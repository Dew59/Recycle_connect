import cloudinary from '../config/cloudinaryConfig.js';

export const generateAuthenticatedUrl = ({
    publicId,
    resourceType,
    format,
    expiresIn = 3600
}) => {
    const expiresAt = Math.floor(Date.now() / 1000) + expiresIn;

    return cloudinary.utils.private_download_url(
        publicId,
        format,
        {
            resource_type: resourceType,
            type: 'authenticated',
            expires_at: expiresAt,
            attachment: false
        }
    );
};