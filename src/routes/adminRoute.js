import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import authorize from '../middlewares/authorizeMiddleware.js';
import { approveCollector, getPendingCollectors, getCollectorIdentificationDocument, rejectCollector, registerRecycler } from '../controllers/adminController.js';
import { rejectCollectorSchema, adminRegisterRecyclerSchema } from '../validator/adminValidator.js';
import validate from '../middlewares/validate.js';
import { uploadProfilePhoto } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.get(
    '/collectors/pending',
    authMiddleware,
    authorize('admin'),
    getPendingCollectors
);

router.get(
    '/collectors/:collectorId/identification-document',
    authMiddleware,
    authorize('admin'),
    getCollectorIdentificationDocument
);

router.patch(
    '/collectors/:collectorId/approve',
    authMiddleware,
    authorize('admin'),
    approveCollector
);

router.patch(
    '/collectors/:collectorId/reject',
    authMiddleware,
    authorize('admin'),
    validate({ body: rejectCollectorSchema }),
    rejectCollector
);

router.post(
    '/register/recyclers',
    authMiddleware,
    authorize('admin'),
    uploadProfilePhoto,
    validate({ body: adminRegisterRecyclerSchema }),
    registerRecycler
);

export default router;