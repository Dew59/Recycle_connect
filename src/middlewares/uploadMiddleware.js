import multer from 'multer';
import AppError from '../utils/AppError.js';

const storage = multer.memoryStorage();

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const createFileFilter = (allowedMimeTypes) => {
    return (req, file, cb) => {
        if (!allowedMimeTypes.includes(file.mimetype)) {
            return cb(
                new AppError(
                    'Invalid file type. Only JPG, JPEG, and PDF files are allowed',
                    400
                )
            );
        }

        cb(null, true);
    };
};

const createUpload = (allowedMimeTypes) => {
    return multer({
        storage,
        limits: {
            fileSize: MAX_FILE_SIZE
        },
        fileFilter: createFileFilter(allowedMimeTypes)
    });
};

const imageMimeTypes = [
    'image/jpeg'
];

const documentMimeTypes = [
    'image/jpeg',
    'application/pdf'
];

export const uploadProfilePhoto = createUpload(
    imageMimeTypes
).single('profilePhoto');

export const uploadIdentificationDocument = createUpload(
    documentMimeTypes
).single('identificationDocument');

export const uploadPickupPhoto = createUpload(
    imageMimeTypes
).single('pickupPhoto');

export const uploadIncentiveProof = createUpload(
    documentMimeTypes
).single('incentiveProof');

const collectorRegistrationFileFilter = (req, file, cb) => {
    if (file.fieldname === 'profilePhoto') {
        if (!imageMimeTypes.includes(file.mimetype)) {
            return cb(
                new AppError(
                    'Invalid profile photo. Only JPG and JPEG files are allowed',
                    400
                )
            );
        }

        return cb(null, true);
    }

    if (file.fieldname === 'identificationDocument') {
        if (!documentMimeTypes.includes(file.mimetype)) {
            return cb(
                new AppError(
                    'Invalid identification document. Only JPG, JPEG, and PDF files are allowed',
                    400
                )
            );
        }

        return cb(null, true);
    }

    return cb(
        new AppError(
            'Unexpected file field',
            400
        )
    );
};

const collectorRegistrationUpload = multer({
    storage,
    limits: {
        fileSize: MAX_FILE_SIZE
    },
    fileFilter: collectorRegistrationFileFilter
});

export const uploadCollectorRegistration =
    collectorRegistrationUpload.fields([
        {
            name: 'profilePhoto',
            maxCount: 1
        },
        {
            name: 'identificationDocument',
            maxCount: 1
        }
    ]);