import mongoose from 'mongoose';

const incentiveTransactionSchema = new mongoose.Schema(
    {
        household: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Household',
            required: true
        },

        collector: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Collector',
            required: true
        },

        pickup: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Pickup',
            required: true
        },

        collectionRecord: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Collection',
            required: true,
            unique: true
        },

        materials: [
            {
                material: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Material',
                    required: true
                },

                actualWeight: {
                    type: mongoose.Schema.Types.Decimal128,
                    required: true,
                    min: 0.01
                },

                ratePerKg: {
                    type: mongoose.Schema.Types.Decimal128,
                    required: true,
                    min: 0.01
                },

                amount: {
                    type: mongoose.Schema.Types.Decimal128,
                    required: true,
                    min: 0.01
                }
            }
        ],

        totalAmount: {
            type: mongoose.Schema.Types.Decimal128,
            required: true,
            min: 0.01
        },

        currency: {
            type: String,
            required: true,
            enum: ['NGN'],
            default: 'NGN'
        },

        proof: {
            type: String,
            default: null
        }
    },
    { timestamps: true }
);

const IncentiveTransaction = mongoose.model(
    'IncentiveTransaction',
    incentiveTransactionSchema
);

export default IncentiveTransaction;