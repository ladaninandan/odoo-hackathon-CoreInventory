const mongoose = require('mongoose');

const adjustmentSchema = new mongoose.Schema(
  {
    adjustmentNumber: { type: String, unique: true },
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
    qtyChange: { type: Number, required: [true, 'Quantity change is required'] },
    reason: {
      type: String,
      required: [true, 'Adjustment reason is required'],
      trim: true,
    },
    adjustedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Auto-generate adjustmentNumber if not provided
adjustmentSchema.pre('validate', async function (next) {
  if (!this.adjustmentNumber) {
    const count = await mongoose.model('Adjustment').countDocuments();
    this.adjustmentNumber = `ADJ-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Adjustment', adjustmentSchema);

