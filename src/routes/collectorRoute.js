import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import authorize from '../middlewares/authorizeMiddleware.js';
import { getActiveRecyclers, getPendingPickups, getAvailablePickups, getCollectorProfile,updateCollectorProfile, changeCollectorPassword, getCollectorRatingHistory, getCollectorPickups, getCollectorDashboard } from '../controllers/collectorController.js';
import validate from '../middlewares/validate.js';
import { getPendingPickupsSchema } from '../validator/pickupValidator.js';
import { uploadProfilePhoto } from '../middlewares/uploadMiddleware.js';
import { updateCollectorProfileSchema, changeCollectorPasswordSchema } from '../validator/collectorValidator.js';

const router = express.Router();

router.get(
    '/dashboard',
    authMiddleware,
    authorize('collector'),
    getCollectorDashboard
);

router.get(
    '/recyclers',
    authMiddleware,
    authorize('admin', 'collector'),
    getActiveRecyclers
);

router.get(
    '/pickups',
    authMiddleware,
    authorize('collector'),
    validate({
        query: getPendingPickupsSchema
    }),
    getPendingPickups
);

router.get(
    '/pickups/available',
    authMiddleware,
    authorize('collector'),
    validate({
        query: getPendingPickupsSchema
    }),
    getAvailablePickups
);

router.get(
    '/profile',
    authMiddleware,
    authorize('collector'),
    getCollectorProfile
);

router.patch(
    '/profile',
    authMiddleware,
    authorize('collector'),
    uploadProfilePhoto,
    validate({ body: updateCollectorProfileSchema }),
    updateCollectorProfile
);


router.patch(
    '/change-password',
    authMiddleware,
    authorize('collector'),
    validate({ body: changeCollectorPasswordSchema }),
    changeCollectorPassword
);

router.get(
    '/ratings',
    authMiddleware,
    authorize('collector'),
    getCollectorRatingHistory
);

router.get(
    '/pickups/claimed',
    authMiddleware,
    authorize('collector'),
    validate({
        query: getPendingPickupsSchema
    }),
    getCollectorPickups
);

export default router;