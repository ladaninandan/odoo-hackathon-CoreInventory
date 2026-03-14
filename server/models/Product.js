const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Product name is required'], trim: true },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    barcode: { type: String, trim: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    uom: { type: String, required: [true, 'Unit of measure is required'], trim: true },
    description: { type: String, trim: true },
    costPrice: { type: Number, min: 0 },
    minStockLevel: {
      type: Number,
      required: [true, 'Minimum stock level is required'],
      default: 0,
      min: 0,
    },
    reorderQty: { type: Number, min: 0 },
    image: { type: String },
    isActive: { type: Boolean, default: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

productSchema.index({ barcode: 1 });
productSchema.index({ name: 'text', sku: 'text' });

module.exports = mongoose.model('Product', productSchema);
