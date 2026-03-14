const mongoose = require('mongoose');

const adjustmentSchema = new mongoose.Schema(
  {
    adjustmentNumber: { type: String, unique: true },
    reason: {
      type: String,
      required: [true, 'Adjustment reason is required'],
      trim: true,
    },
    lines: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: [true, 'Product is required'],
        },
        warehouse: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Warehouse',
          required: [true, 'Warehouse is required'],
        },
        systemQty: { type: Number, required: true },
        countedQty: { type: Number, required: true },
        delta: { type: Number, required: true },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

adjustmentSchema.index({ adjustmentNumber: 1 });

module.exports = mongoose.model('Adjustment', adjustmentSchema);
