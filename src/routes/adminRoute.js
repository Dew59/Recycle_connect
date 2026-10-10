import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import authorize from '../middlewares/authorizeMiddleware.js';
import { approveCollector, getPendingCollectors, getCollectorIdentificationDocument, rejectCollector, registerRecycler, getAllCollectors, getAllHouseholds, getAllPickups, getAllIncentiveTransactions,getIncentiveTransactionById } from '../controllers/adminController.js';
import { rejectCollectorSchema, adminRegisterRecyclerSchema, getAllCollectorsQuerySchema, getAllIncentiveTransactionsQuerySchema, getIncentiveTransactionByIdParamsSchema } from '../validator/adminValidator.js';
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

router.get(
    '/collectors',
    authMiddleware,
    authorize('admin'),
    validate({ query: getAllCollectorsQuerySchema }),
    getAllCollectors
);

router.get(
    '/households',
    authMiddleware,
    authorize('admin'),
    validate({ query: getAllCollectorsQuerySchema }),
    getAllHouseholds
);

router.get(
    '/pickups',
    authMiddleware,
    authorize('admin'),
    validate({ query: getAllCollectorsQuerySchema }),
    getAllPickups
);

router.get(
    '/incentive-transactions',
    authMiddleware,
    authorize('admin'),
    validate({ query: getAllIncentiveTransactionsQuerySchema }),
    getAllIncentiveTransactions
);


router.get(
    '/incentive-transactions/:transactionId',
    authMiddleware,
    authorize('admin'),
    validate({ params: getIncentiveTransactionByIdParamsSchema }),
    getIncentiveTransactionById
);


export default router;