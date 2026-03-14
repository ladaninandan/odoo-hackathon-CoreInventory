const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema(
  {
    deliveryNumber: { type: String, unique: true },
    customer: { type: String, required: [true, 'Customer is required'], trim: true },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: [true, 'Warehouse is required'],
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
    notes: { type: String, trim: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

deliverySchema.index({ deliveryNumber: 1 });
deliverySchema.index({ status: 1 });

module.exports = mongoose.model('Delivery', deliverySchema);
