import Pickup from '../models/pickupModel.js';
import Collection from '../models/collectionModel.js';
import Material from '../models/materialModel.js';
import AppError from '../utils/AppError.js';

export const createCollectionService = async ({
    pickupId,
    collectorId,
    materials
}) => {
    // 1. Find the pickup
    const pickup = await Pickup.findById(pickupId);

    if (!pickup) {
        throw new AppError('Pickup not found', 404);
    }

    // 2. Ensure the pickup belongs to the requesting collector
    if (!pickup.collector) {
        throw new AppError(
            'This pickup has not been claimed by a collector',
            409
        );
    }

    if (pickup.collector.toString() !== collectorId) {
        throw new AppError(
            'You are not authorized to record this collection',
            403
        );
    }

    // 3. Collection can only be created for a CLAIMED pickup
    if (pickup.status !== 'CLAIMED') {
        throw new AppError(
            'Collection can only be recorded for a claimed pickup',
            409
        );
    }

    // 4. Ensure a collection does not already exist
    const existingCollection = await Collection.findOne({
        pickup: pickupId
    });

    if (existingCollection) {
        throw new AppError(
            'A collection record already exists for this pickup',
            409
        );
    }

    // 5. Get the original pickup material IDs
    const pickupMaterialIds = pickup.materials.map(
        materialId => materialId.toString()
    );

    // 6. Get submitted material IDs
    const submittedMaterialIds = materials.map(
        item => item.material
    );

    // 7. Prevent duplicate material entries
    const uniqueMaterialIds = new Set(submittedMaterialIds);

    if (uniqueMaterialIds.size !== submittedMaterialIds.length) {
        throw new AppError(
            'A material cannot be included more than once',
            400
        );
    }

    // 8. Ensure every submitted material belongs to the pickup
    const invalidMaterials = submittedMaterialIds.filter(
        materialId => !pickupMaterialIds.includes(materialId)
    );

    if (invalidMaterials.length > 0) {
        throw new AppError(
            'All submitted materials must belong to the original pickup',
            400
        );
    }

    // 9. Ensure every pickup material is included
    const missingMaterials = pickupMaterialIds.filter(
        materialId => !submittedMaterialIds.includes(materialId)
    );

    if (missingMaterials.length > 0) {
        throw new AppError(
            'All materials from the original pickup must be included in the collection',
            400
        );
    }

    // 10. Verify that all submitted material documents exist
    const existingMaterials = await Material.find({
        _id: {
            $in: submittedMaterialIds
        }
    }).select('_id');

    const existingMaterialIds = existingMaterials.map(
        material => material._id.toString()
    );

    const missingMaterialDocuments = submittedMaterialIds.filter(
        materialId => !existingMaterialIds.includes(materialId)
    );

    if (missingMaterialDocuments.length > 0) {
        throw new AppError(
            'One or more submitted materials do not exist',
            400
        );
    }

    // 11. Create the collection
    const collection = await Collection.create({
        pickup: pickupId,
        household: pickup.household,
        collector: collectorId,
        materials
    });

    // 12. Update pickup status
    pickup.status = 'COLLECTED';

    await pickup.save();

    // 13. Populate response data
    await collection.populate([
        {
            path: 'pickup',
            select: 'location date time status'
        },
        {
            path: 'household',
            select: 'fullName phone'
        },
        {
            path: 'collector',
            select: 'fullName phone email collectorId'
        },
        {
            path: 'materials.material',
            select: 'name description'
        }
    ]);

    return collection;
};