import IncentiveRate from '../models/incentiveRateModel.js';
import Material from '../models/materialModel.js';
import AppError from '../utils/AppError.js';

export const createIncentiveRateService = async ({
    material,
    ratePerKg,
    currency
}) => {
    const materialExists = await Material.findById(material);

    if (!materialExists) {
        throw new AppError('Material not found', 404);
    }

    const existingCurrentRate = await IncentiveRate.findOne({
        material,
        isCurrent: true
    });

    if (existingCurrentRate) {
        throw new AppError(
            'A current incentive rate already exists for this material. Use the update endpoint instead.',
            409
        );
    }

    const incentiveRate = await IncentiveRate.create({
        material,
        ratePerKg,
        currency,
        isCurrent: true
    });

    return incentiveRate;
};

export const updateIncentiveRateService = async ({
    materialId,
    ratePerKg,
    currency
}) => {
    const currentRate = await IncentiveRate.findOne({
        material: materialId,
        isCurrent: true
    });

    if (!currentRate) {
        throw new AppError(
            'No current incentive rate exists for this material',
            404
        );
    }

    currentRate.isCurrent = false;
    await currentRate.save();

    const newRate = await IncentiveRate.create({
        material: materialId,
        ratePerKg,
        currency,
        isCurrent: true
    });

    return newRate;
};

export const getCurrentIncentiveRatesService = async () => {
    const incentiveRates = await IncentiveRate.find({
        isCurrent: true
    })
        .populate({
            path: 'material',
            select: 'name description'
        })
        .select('material ratePerKg currency')
        .sort({ createdAt: -1 });

    return incentiveRates;
};