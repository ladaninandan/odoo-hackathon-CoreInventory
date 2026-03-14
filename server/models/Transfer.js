const mongoose = require('mongoose');

const transferSchema = new mongoose.Schema(
  {
    transferNumber: { type: String, unique: true },
    fromWarehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: [true, 'Source warehouse is required'],
    },
    toWarehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: [true, 'Destination warehouse is required'],
    },
    status: {
      type: String,
      enum: ['draft', 'ready', 'done', 'canceled'],
      default: 'draft',
    },
    scheduledDate: { type: Date },
    validatedAt: { type: Date },
    lines: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: [true, 'Product is required'],
        },
        qty: { type: Number, required: [true, 'Quantity is required'], min: 1 },
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

transferSchema.index({ transferNumber: 1 });
transferSchema.index({ status: 1 });

module.exports = mongoose.model('Transfer', transferSchema);
