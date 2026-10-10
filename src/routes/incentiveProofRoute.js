import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import authorize from '../middlewares/authorizeMiddleware.js';
import validate from '../middlewares/validate.js';
import { uploadIncentiveProof } from '../controllers/incentiveProofController.js';
import { uploadIncentiveProofParamsSchema } from '../validator/incentiveProofValidator.js';
import { uploadIncentiveProof as uploadIncentiveProofFile } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.post(
    '/:collectionId/proof',
    authMiddleware,
    authorize('collector'),
    uploadIncentiveProofFile,
    validate({
        params: uploadIncentiveProofParamsSchema
    }),
    uploadIncentiveProof
);

export default router;