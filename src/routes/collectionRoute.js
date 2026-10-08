import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import authorize from '../middlewares/authorizeMiddleware.js';
import validate from '../middlewares/validate.js';
import { createCollectionParamsSchema, createCollectionSchema } from '../validator/collectionValidator.js';
import { createCollection } from '../controllers/collectionController.js';

const router = express.Router();

router.post(
    '/:pickupId',
    authMiddleware,
    authorize('collector'),
    validate({
        params: createCollectionParamsSchema,
        body: createCollectionSchema
    }),
    createCollection
);

export default router;