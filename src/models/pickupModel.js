import mongoose from 'mongoose';

const pickupSchema = new mongoose.Schema(
    {
        household: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Household',
            required: true
        },

        materials: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Material',
                required: true
            }
        ],

        location: {
            street: {
                type: String,
                required: true,
                trim: true
            },

            area: {
                type: String,
                required: true,
                trim: true
            },

            city: {
                type: String,
                required: true,
                trim: true
            },

            lga: {
                type: String,
                required: true,
                trim: true
            },

            state: {
                type: String,
                required: true,
                trim: true
            }
        },

        note: {
            type: String,
            trim: true
        },

        image: {
            type: String,
            default: null
        },

        date: {
            type: Date,
            required: true
        },

        time: {
            type: String,
            required: true,
            trim: true
        },

        status: {
            type: String,
            enum: [
                'PENDING',
                'CLAIMED',
                'COLLECTED',
                'CONFIRMATION_PENDING',
                'COMPLETED',
                'CANCELLED'
            ],
            default: 'PENDING'
        },

        cancellationReason: {
            type: String,
            trim: true,
            default: null
        },

        collector: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Collector',
            default: null
        }
    },
    {
        timestamps: true
    }
);

const Pickup = mongoose.model('Pickup', pickupSchema);

export default Pickup;