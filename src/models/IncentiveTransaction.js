const mongoose = require('mongoose');
const { Schema } = mongoose;

const TRANSACTION_STATUSES = ['PENDING', 'CONFIRMED', 'DISPUTED', 'REVERSED'];

/**
 * Snapshot of a material's contribution to this transaction.
 * Rate and material name are copied at collection time so that later
 * changes to IncentiveRate/Material never alter historical transactions.
 */
const materialLineSchema = new Schema(
  {
    material: {
      type: Schema.Types.ObjectId,
      ref: 'Material',
      required: true,
    },
    materialNameSnapshot: {
      type: String,
      required: true,
    },
    actualWeight: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      default: 'KG',
    },
    rateUsed: {
      type: Number,
      required: true,
      min: 0,
    },
    incentiveRateRef: {
      type: Schema.Types.ObjectId,
      ref: 'IncentiveRate',
    },
    lineAmount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const proofSchema = new Schema(
  {
    photoUrls: {
      type: [String],
      default: [],
    },
    signatureUrl: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const incentiveTransactionSchema = new Schema(
  {
    pickup: {
      type: Schema.Types.ObjectId,
      ref: 'Pickup',
      required: true,
      unique: true,
      index: true,
    },
    household: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    collector: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    materials: {
      type: [materialLineSchema],
      required: true,
      validate: (v) => Array.isArray(v) && v.length > 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: 'USD',
      uppercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: TRANSACTION_STATUSES,
      default: 'PENDING',
      index: true,
    },
    proof: {
      type: proofSchema,
      default: () => ({}),
    },
    collectedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    confirmedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('IncentiveTransaction', incentiveTransactionSchema);
module.exports.TRANSACTION_STATUSES = TRANSACTION_STATUSES;