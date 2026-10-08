import Collection from '../models/collectionModel.js';
import IncentiveRate from '../models/incentiveRateModel.js';
import IncentiveTransaction from '../models/incentiveTransactionModel.js';
import AppError from '../utils/AppError.js';

export const createIncentiveTransactionService = async ({
    collectionId,
    collectorId
}) => {
    // 1. Find the collection
    const collection = await Collection.findById(collectionId);

    if (!collection) {
        throw new AppError('Collection not found', 404);
    }

    // 2. Verify the authenticated collector owns the collection
    if (collection.collector.toString() !== collectorId) {
        throw new AppError(
            'You are not authorized to create an incentive transaction for this collection',
            403
        );
    }

    // 3. Verify the collection belongs to a pickup
    if (!collection.pickup) {
        throw new AppError(
            'This collection is not linked to a pickup',
            409
        );
    }

    // 4. Verify the pickup exists
    const pickup = await collection.populate({
        path: 'pickup',
        select: 'household collector status'
    });

    const populatedPickup = pickup.pickup;

    if (!populatedPickup) {
        throw new AppError(
            'The pickup linked to this collection does not exist',
            404
        );
    }

    // 5. Collection must belong to the same pickup
    if (
        populatedPickup.household.toString() !==
        collection.household.toString()
    ) {
        throw new AppError(
            'Collection household does not match the pickup household',
            409
        );
    }

    if (
        populatedPickup.collector &&
        populatedPickup.collector.toString() !== collection.collector.toString()
    ) {
        throw new AppError(
            'Collection collector does not match the pickup collector',
            409
        );
    }

    // 6. Pickup must be COLLECTED
    if (populatedPickup.status !== 'COLLECTED') {
        throw new AppError(
            'Incentive transaction can only be created for a collected pickup',
            409
        );
    }

    // 7. Make sure only one incentive transaction exists
    const existingTransaction = await IncentiveTransaction.findOne({
        collectionRecord: collectionId
    });

    if (existingTransaction) {
        throw new AppError(
            'An incentive transaction already exists for this collection',
            409
        );
    }

    // 8. Collection must contain materials
    if (!collection.materials || collection.materials.length === 0) {
        throw new AppError(
            'This collection has no recorded materials',
            409
        );
    }

    const materialIds = collection.materials.map(item =>
        item.material.toString()
    );

    // 9. Prevent duplicate materials inside the collection
    const uniqueMaterialIds = new Set(materialIds);

    if (uniqueMaterialIds.size !== materialIds.length) {
        throw new AppError(
            'A material cannot appear more than once in a collection',
            409
        );
    }

    const transactionMaterials = [];
    let totalAmount = 0;

    // 10. Process every collected material
    for (const collectionMaterial of collection.materials) {
        const materialId = collectionMaterial.material.toString();

        // 11. Find the current incentive rate
        const incentiveRate = await IncentiveRate.findOne({
            material: collectionMaterial.material,
            isCurrent: true
        });

        if (!incentiveRate) {
            throw new AppError(
                `No current incentive rate exists for material ${materialId}`,
                409
            );
        }

        // 12. Convert Decimal128 values to numbers for calculation
        const actualWeight = Number(
            collectionMaterial.actualWeight.toString()
        );

        const ratePerKg = Number(
            incentiveRate.ratePerKg.toString()
        );

        // 13. Calculate material incentive
        const amount = actualWeight * ratePerKg;

        if (!Number.isFinite(amount) || amount <= 0) {
            throw new AppError(
                'Unable to calculate a valid incentive amount',
                409
            );
        }

        // 14. Add to transaction line items
        transactionMaterials.push({
            material: collectionMaterial.material,
            actualWeight: collectionMaterial.actualWeight,
            ratePerKg: incentiveRate.ratePerKg,
            amount: amount.toFixed(2)
        });

        // 15. Add to total
        totalAmount += amount;
    }

    // 16. Create the incentive transaction
    const transaction = await IncentiveTransaction.create({
        household: collection.household,
        collector: collection.collector,
        pickup: populatedPickup._id,
        collectionRecord: collection._id,
        materials: transactionMaterials,
        totalAmount: totalAmount.toFixed(2),
        currency: 'NGN',
        proof: null
    });

    // 17. Populate response
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