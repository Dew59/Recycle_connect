import mongoose from 'mongoose';

const { Schema } = mongoose;

const ratingSchema = new Schema(
    {
        pickup: {
            type: Schema.Types.ObjectId,
            ref: 'Pickup',
            required: true,
            index: true
        },

        rater: {
            type: Schema.Types.ObjectId,
            required: true,
            refPath: 'raterModel'
        },

        raterModel: {
            type: String,
            required: true,
            enum: ['Household', 'Collector']
        },

        ratee: {
            type: Schema.Types.ObjectId,
            required: true,
            refPath: 'rateeModel'
        },

        rateeModel: {
            type: String,
            required: true,
            enum: ['Household', 'Collector']
        },

        stars: {
            type: Number,
            required: true,
            min: [1, 'Rating must be at least 1 star'],
            max: [5, 'Rating cannot exceed 5 stars'],
            validate: {
                validator: Number.isInteger,
                message: 'Rating must be a whole number from 1 to 5'
            }
        },

        comment: {
            type: String,
            trim: true,
            maxlength: [1000, 'Comment cannot exceed 1000 characters'],
            default: null
        }
    },
    {
        timestamps: true
    }
);

// A participant can submit only one rating for a pickup.
ratingSchema.index(
    { pickup: 1, rater: 1 },
    { unique: true }
);

const Rating = mongoose.model('Rating', ratingSchema);

export default Rating;