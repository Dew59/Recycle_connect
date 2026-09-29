
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const householdSchema = new mongoose.Schema(
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
householdSchema.pre('save', async function () {
    if (!this.isModified('passwordHash')) {
        return;
    }

    this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
});

// Compare plain password with stored hash
householdSchema.methods.comparePassword = async function (plainPassword) {
    return bcrypt.compare(plainPassword, this.passwordHash);
};

const Household = mongoose.model('Household', householdSchema);

export default Household;
