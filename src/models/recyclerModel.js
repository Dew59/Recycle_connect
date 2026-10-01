import mongoose from 'mongoose';

const routeSchema = new mongoose.Schema(
    {
        state: {
            type: String,
            required: true,
            trim: true
        },

        lga: {
            type: String,
            required: true,
            trim: true
        },

        cityTown: {
            type: String,
            required: true,
            trim: true
        },

        area: {
            type: String,
            required: true,
            trim: true
        }
    },
    {
        _id: false
    }
);

const recyclerSchema = new mongoose.Schema(
    {
        businessName: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        phone: {
            type: String,
            required: true,
            trim: true
        },

        businessAddress: {
            type: String,
            required: true,
            trim: true
        },

        profilePhoto: {
            type: String,
            default: null
        },

        route: {
            type: routeSchema,
            required: true
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

const Recycler = mongoose.model('Recycler', recyclerSchema);

export default Recycler;