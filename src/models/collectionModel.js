import mongoose from 'mongoose';

const collectionSchema = new mongoose.Schema(
    {
        pickup: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Pickup',
            required: true,
            unique: true
        },

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
                }
            }
        ]
    },
    { timestamps: true }
);

const Collection = mongoose.model('Collection', collectionSchema);

export default Collection;