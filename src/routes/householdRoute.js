import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import authorize from '../middlewares/authorizeMiddleware.js';
import { getHouseholdProfile, updateHouseholdProfile, changeHouseholdPassword, getHouseholdRatingHistory } from '../controllers/householdController.js';
import validate from '../middlewares/validate.js';
import { uploadProfilePhoto } from '../middlewares/uploadMiddleware.js';
import { updateHouseholdProfileSchema, changeHouseholdPasswordSchema } from '../validator/householdValidator.js';

const router = express.Router();

router.get(
    '/profile',
    authMiddleware,
    authorize('household'),
    getHouseholdProfile
);

router.patch(
    '/profile',
    authMiddleware,
    authorize('household'),
    uploadProfilePhoto,
    validate({ body: updateHouseholdProfileSchema }),
    updateHouseholdProfile
);

router.patch(
    '/change-password',
    authMiddleware,
    authorize('household'),
    validate({ body: changeHouseholdPasswordSchema }),
    changeHouseholdPassword
);

router.get(
    '/ratings',
    authMiddleware,
    authorize('household'),
    getHouseholdRatingHistory
);


export default router;
