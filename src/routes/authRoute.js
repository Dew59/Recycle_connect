
import express from 'express';
import validate from '../middlewares/validate.js';
import { householdRegisterSchema, collectorRegisterSchema, adminRegisterSchema, householdLoginSchema, collectorLoginSchema, adminLoginSchema } from '../validator/authValidator.js';
import { registerHousehold, registerCollector, registerAdmin, loginHousehold, loginCollector, loginAdmin } from '../controllers/authController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import authorize from '../middlewares/authorizeMiddleware.js';

const router = express.Router();

router.post(
    '/household/register',
    validate({
        body: householdRegisterSchema
    }),
    registerHousehold
);

router.post(
    '/collector/register',
    validate({
        body: collectorRegisterSchema
    }),
    registerCollector
);

router.post(
    '/admin/register',
    authMiddleware,
    authorize('admin'),
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
    '/admin/login',
    validate({
        body: adminLoginSchema
    }),
    loginAdmin
);

export default router;