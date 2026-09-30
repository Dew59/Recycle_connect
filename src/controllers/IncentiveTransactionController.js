import mongoose from 'mongoose';
import IncentiveTransactionSchema from '../models/IncentiveTransaction.js';

export const getIncentiveTransactions = async (req, res) => {
    try{
        const transactions = await IncentiveTransactionSchema.find()
        .populate('pickup')
        .populate('household', 'name email')
        .populate('collector', 'name email')
        .populate('materials.material', 'name');

        res.status(200).json({
            success: true,
            count: transactions.length,
            data: transactions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve incentive transactions',
            error: error.message
        });
    }
        };

    export const getIncentiveTransactionById = async (req, res) => {
        try{
            const{id} = req.params;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid transaction ID'
                });
            }

            const transaction = await IncentiveTransaction.findById(id)
            .populate('pickup')
            .populate('household', 'name email')
            .populate('collector', 'name email')
            .populate('materials.material', 'name');

            if (!transaction) {
                return res.status(404).json({
                    success: false,
                    message: 'Incentive transaction not found'
                });
            }

            res.status(200).json({
                success: true,
                data: transaction
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve incentive transaction',
                error: error.message
            });
        }
    };

    export const updateIncentiveProof = async (req, res) => {
        try {
            const { id } = req.params;

            if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid incentive transaction ID',
            });
            }

            const transaction = await IncentiveTransaction.findById(id);

            if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Incentive transaction not found',
            });
            }

            const { photoUrls, signatureUrl, notes } = req.body;

            transaction.proof = {
            photoUrls: photoUrls ?? transaction.proof?.photoUrls ?? [],
            signatureUrl: signatureUrl ?? transaction.proof?.signatureUrl,
            notes: notes ?? transaction.proof?.notes,
            };

            await transaction.save();

            res.status(200).json({
            success: true,
            message: 'Incentive proof updated successfully',
            data: transaction,
            });
        } catch (error) {
            res.status(500).json({
            success: false,
            message: 'Failed to update incentive proof',
            error: error.message,
            });
        }
    };