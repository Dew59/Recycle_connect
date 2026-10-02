import mongoose from 'mongoose';

const incentiveRateSchema = new mongoose.Schema(
    {
        material: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Material',
            required: true
        },

        ratePerKg: {
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

        isCurrent: {
            type: Boolean,
            required: true,
            default: true
        }
    },
    {
        timestamps: true
    }
);

const IncentiveRate = mongoose.model(
    'IncentiveRate',
    incentiveRateSchema
);

export default IncentiveRate;