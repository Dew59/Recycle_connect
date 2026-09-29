import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const pickupZoneSchema = new mongoose.Schema(
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
        fullName: {
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

        passwordHash: {
            type: String,
            required: true,
            select: false
        },

        profilePhoto: {
            type: String,
            default: null
        },

        businessName: {
            type: String,
            required: true,
            trim: true
        },

        businessAddress: {
            type: String,
            required: true,
            trim: true
        },

        recyclerType: {
            type: String,
            required: true,
            trim: true
        },

        identificationDocument: {
            type: String,
            required: true,
            trim: true
        },

        pickupZone: {
            type: pickupZoneSchema,
            required: true
        },

        recyclerId: {
            type: String,
            unique: true,
            sparse: true
        },

        approvalStatus: {
            type: String,
            enum: ['PENDING', 'APPROVED', 'REJECTED'],
            default: 'PENDING'
        },

        approvedAt: {
            type: Date,
            default: null
        },

        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin',
            default: null
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

// Hash password before saving
recyclerSchema.pre('save', async function () {
    if (!this.isModified('passwordHash')) {
        return;
    }

    this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
});

// Compare plain password with stored hash
recyclerSchema.methods.comparePassword = async function (plainPassword) {
    return bcrypt.compare(plainPassword, this.passwordHash);
};

const Recycler = mongoose.model('Recycler', recyclerSchema);

export default Recycler;