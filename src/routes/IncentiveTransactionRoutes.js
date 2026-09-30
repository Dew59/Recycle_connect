import express from 'express';

import{
    getIncentiveTransactions,
    getIncentiveTransactionById,
    updateIncentiveProof,
} from '../controllers/IncentiveTransactionController.js';

const router = express.Router();

router.get('/', getIncentiveTransactions);
router.get('/:id', getIncentiveTransactionById);
router.put('/:id/proof', updateIncentiveProof);

export default router;