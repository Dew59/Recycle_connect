import cloudinary from '../config/cloudinaryConfig.js';
import { Readable } from 'stream';

const uploadToCloudinary = (
    buffer,
    {
        folder,
        resourceType = 'auto',
        type = 'upload'
    }
) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: resourceType,
                type
            },
            (error, result) => {
                if (error) {
                    return reject(error);
                }

                resolve(result);
            }
        );

        Readable.from(buffer).pipe(uploadStream);
    });
};

export default uploadToCloudinary;