
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const collectorSchema = new mongoose.Schema(
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

        address: {
            type: String,
            required: true,
            trim: true
        },

        route: {
            area: {
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

        identificationDocument: {
            publicId: {
                type: String,
                required: true,
                trim: true
            },
            resourceType: {
                type: String,
                required: true,
                trim: true
            },
            format: {
                type: String,
                required: true,
                trim: true
            }
        },

        collectorId: {
            type: String,
            unique: true,
            sparse: true
        },

        approvalStatus: {
            type: String,
            enum: ['PENDING', 'APPROVED', 'REJECTED'],
            default: 'PENDING'
        },

        rejectionReason: {
            type: String,
            default: null,
            trim: true
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
collectorSchema.pre('save', async function () {
    if (!this.isModified('passwordHash')) {
        return;
    }

    this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
});

// Compare plain password with stored hash
collectorSchema.methods.comparePassword = async function (plainPassword) {
    return bcrypt.compare(plainPassword, this.passwordHash);
};

const Collector = mongoose.model('Collector', collectorSchema);

export default Collector;
