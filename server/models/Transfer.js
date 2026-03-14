const mongoose = require('mongoose');
const Counter = require('./Counter');

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
    validatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
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

// Seed counter from existing transfers (run once when counter is missing)
async function ensureTransferCounter() {
  const exists = await Counter.findById('transfer');
  if (!exists) {
    const maxDoc = await mongoose.model('Transfer').findOne().sort({ transferNumber: -1 }).select('transferNumber').lean();
    const num = maxDoc && maxDoc.transferNumber ? parseInt(String(maxDoc.transferNumber).replace(/^TRF-/, ''), 10) || 0 : 0;
    await Counter.create({ _id: 'transfer', seq: num });
  }
}

// Auto-generate transferNumber atomically (avoids duplicate on concurrent creates)
transferSchema.pre('validate', async function (next) {
  if (!this.transferNumber) {
    await ensureTransferCounter();
    const seq = await Counter.getNext('transfer');
    this.transferNumber = `TRF-${String(seq).padStart(5, '0')}`;
  }
  next();
});

transferSchema.index({ status: 1 });

module.exports = mongoose.model('Transfer', transferSchema);
