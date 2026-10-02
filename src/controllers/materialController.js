import asyncHandler from '../utils/asyncHandler.js';
import { getAllMaterialsService, getMaterialByIdService, createMaterialService } from '../services/materialService.js';

export const getAllMaterials = asyncHandler(async (req, res) => {
    const materials = await getAllMaterialsService();

    res.status(200).json({
        success: true,
        message: 'Materials retrieved successfully',
        data: materials
    });
});

export const getMaterialById = asyncHandler(async (req, res) => {
    const { materialId } = req.params;

    const material = await getMaterialByIdService(materialId);

    res.status(200).json({
        success: true,
        message: 'Material retrieved successfully',
        data: material
    });
});

export const createMaterial = asyncHandler(async (req, res) => {
    const material = await createMaterialService(
        req.validatedData.body
    );

    res.status(201).json({
        success: true,
        message: 'Material created successfully',
        data: material
    });
});