import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import authorize from '../middlewares/authorizeMiddleware.js';
import validate from '../middlewares/validate.js'
import { getAllMaterials, getMaterialById, createMaterial } from '../controllers/materialController.js';
import { createMaterialSchema } from '../validator/materialValidator.js';

const router = express.Router();

router.get(
    '/',
    authMiddleware,
    authorize('household', 'collector', 'admin'),
    getAllMaterials
);

router.get(
    '/:materialId',
    authMiddleware,
    authorize('household', 'collector', 'admin'),
    getMaterialById
);

router.post(
    '/',
    authMiddleware,
    authorize('admin'),
    validate({
        body: createMaterialSchema
    }),
    createMaterial
);

export default router;