
import express from 'express';
import validate from '../middlewares/validate.js';
import { householdRegisterSchema, collectorRegisterSchema, recyclerRegisterSchema, adminRegisterSchema, householdLoginSchema, collectorLoginSchema, recyclerLoginSchema, adminLoginSchema } from '../validator/authValidator.js';
import { registerHousehold, registerCollector, registerRecycler, registerAdmin, loginHousehold, loginCollector, loginRecycler, loginAdmin } from '../controllers/authController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import authorize from '../middlewares/authorizeMiddleware.js';
import { uploadCollectorRegistration } from '../middlewares/uploadMiddleware.js';
import { uploadProfilePhoto } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.post(
    '/household/register',
    uploadProfilePhoto,
    validate({
        body: householdRegisterSchema
    }),
    registerHousehold
);

router.post(
    '/collector/register',
    uploadCollectorRegistration,
    validate({ body: collectorRegisterSchema }),
    registerCollector
);

router.post(
    '/recycler/register',
    validate({ body: recyclerRegisterSchema }),
    registerRecycler
);

router.post(
    '/admin/register',
    authMiddleware,
    authorize('admin'),
    uploadProfilePhoto,
    validate({ body: adminRegisterSchema }),
    registerAdmin
);

router.post(
    '/household/login',
    validate({
        body: householdLoginSchema
    }),
    loginHousehold
);

router.post(
    '/collector/login',
    validate({
        body: collectorLoginSchema
    }),
    loginCollector
);

router.post(
    '/recycler/login',
    validate({ body: recyclerLoginSchema }),
    loginRecycler
);

router.post(
    '/admin/login',
    validate({
        body: adminLoginSchema
    }),
    loginAdmin
);

export default router;