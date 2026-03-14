const mongoose = require('mongoose');

const lineSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required'],
  },
  qty: { type: Number, required: [true, 'Quantity is required'], min: 1 },
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

// Auto-generate receiptNumber if not provided
receiptSchema.pre('validate', async function (next) {
  if (!this.receiptNumber) {
    const count = await mongoose.model('Receipt').countDocuments();
    this.receiptNumber = `REC-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

receiptSchema.index({ status: 1 });

module.exports = mongoose.model('Receipt', receiptSchema);
