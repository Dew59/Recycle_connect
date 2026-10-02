import Material from '../models/materialModel.js';
import AppError from '../utils/AppError.js';

export const getAllMaterialsService = async () => {
    const materials = await Material.find()
        .select('name description')
        .sort({ name: 1 });

    return materials;
};

export const getMaterialByIdService = async (materialId) => {
    const material = await Material.findById(materialId)
        .select('name description');

    if (!material) {
        throw new AppError('Material not found', 404);
    }

    return material;
};

export const createMaterialService = async ({
    name,
    description
}) => {
    const existingMaterial = await Material.findOne({
        name: name.trim().toLowerCase()
    });

    if (existingMaterial) {
        throw new AppError(
            'A material with this name already exists',
            409
        );
    }

    const material = await Material.create({
        name,
        description
    });

    return material;
};