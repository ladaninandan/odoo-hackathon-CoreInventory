const mongoose = require('mongoose');

const lineSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required'],
  },
  orderedQty: { type: Number, required: [true, 'Ordered quantity is required'], min: 1 },
  receivedQty: { type: Number, default: 0, min: 0 },
  unitCost: { type: Number, min: 0 },
});

const receiptSchema = new mongoose.Schema(
  {
    receiptNumber: { type: String, unique: true },
    supplier: { type: String, required: [true, 'Supplier is required'], trim: true },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: [true, 'Warehouse is required'],
    },
    status: {
      type: String,
      enum: ['draft', 'waiting', 'ready', 'done', 'canceled'],
      default: 'draft',
    },
    scheduledDate: { type: Date },
    validatedAt: { type: Date },
    validatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lines: [lineSchema],
    notes: { type: String, trim: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

receiptSchema.index({ receiptNumber: 1 });
receiptSchema.index({ status: 1 });

module.exports = mongoose.model('Receipt', receiptSchema);
