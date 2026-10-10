import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import authorize from '../middlewares/authorizeMiddleware.js';
import validate from '../middlewares/validate.js';
import { uploadPickupPhoto } from '../middlewares/uploadMiddleware.js';
import { createPickup, getHouseholdPickups, getPickupDetails, claimPickup, deletePickup, cancelClaimedPickup, confirmPickup } from '../controllers/pickupController.js';
import { createPickupSchema, getHouseholdPickupsSchema, getPickupDetailsSchema, claimPickupSchema, deletePickupSchema, cancelPickupSchema } from '../validator/pickupValidator.js';

const router = express.Router();

router.post(
    '/',
    authMiddleware,
    authorize('household'),
    uploadPickupPhoto,
    validate({
        body: createPickupSchema
    }),
    createPickup
);

router.get(
    '/',
    authMiddleware,
    authorize('household'),
    validate({
        query: getHouseholdPickupsSchema
    }),
    getHouseholdPickups
);

router.get(
    '/:pickupId',
    authMiddleware,
    authorize('household', 'collector', 'admin'),
    validate({
        params: getPickupDetailsSchema
    }),
    getPickupDetails
);

router.post(
    '/:pickupId/claim',
    authMiddleware,
    authorize('collector'),
    validate({
        params: claimPickupSchema
    }),
    claimPickup
);

router.delete(
    '/:pickupId',
    authMiddleware,
    authorize('household'),
    validate({
        params: deletePickupSchema
    }),
    deletePickup
);

router.patch(
    '/:pickupId/cancel',
    authMiddleware,
    authorize('household'),
    validate({
        params: getPickupDetailsSchema,
        body: cancelPickupSchema
    }),
    cancelClaimedPickup
);

router.post(
    '/:pickupId/confirm',
    authMiddleware,
    authorize('household'),
    validate({
        params: getPickupDetailsSchema
    }),
    confirmPickup
);

export default router;