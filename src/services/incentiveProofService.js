import IncentiveTransaction from '../models/incentiveTransactionModel.js';
import cloudinary from '../config/cloudinaryConfig.js';
import AppError from '../utils/AppError.js';
import Pickup from '../models/pickupModel.js';

export const uploadIncentiveProofService = async ({
    collectionId,
    collectorId,
    file
}) => {
    // 1. Make sure a file was uploaded
    if (!file) {
        throw new AppError(
            'Incentive proof file is required',
            400
        );
    }

    // 2. Find the incentive transaction
    const transaction = await IncentiveTransaction.findOne({
        collectionRecord: collectionId
    });

    if (!transaction) {
        throw new AppError(
            'Incentive transaction not found',
            404
        );
    }

    // 3. Only the Collector associated with the transaction
    // can upload the proof
    if (transaction.collector.toString() !== collectorId) {
        throw new AppError(
            'You are not authorized to upload proof for this incentive transaction',
            403
        );
    }

    // 4. Prevent replacing an existing proof
    if (transaction.proof) {
        throw new AppError(
            'Incentive proof has already been uploaded',
            409
        );
    }

    // 5. Upload the proof to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'recycle-connect/incentive-proofs',
                resource_type: 'auto'
            },
            (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve(result);
            }
        );

        uploadStream.end(file.buffer);
    });

    // 6. Store the Cloudinary URL
    transaction.proof = uploadResult.secure_url;

    await transaction.save();

    // 7. Move the pickup to CONFIRMATION_PENDING
    const updatedPickup = await Pickup.findOneAndUpdate(
        {
            _id: transaction.pickup,
            status: 'COLLECTED'
        },
        {
            $set: {
                status: 'CONFIRMATION_PENDING'
            }
        },
        {
            new: true,
            runValidators: true
        }
    );

    // 8. Populate the transaction response
    await transaction.populate([
        {
            path: 'household',
            select: 'fullName phone email'
        },
        {
            path: 'collector',
            select: 'fullName phone email collectorId'
        },
        {
            path: 'pickup',
            select: 'location date time status'
        },
        {
            path: 'collectionRecord',
            select: 'materials createdAt'
        },
        {
            path: 'materials.material',
            select: 'name description'
        }
    ]);

    return transaction;
};