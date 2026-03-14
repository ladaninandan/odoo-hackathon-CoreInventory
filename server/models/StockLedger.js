const mongoose = require('mongoose');

const stockLedgerSchema = new mongoose.Schema({
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
  movementType: {
    type: String,
    enum: ['receipt', 'delivery', 'transfer_in', 'transfer_out', 'adjustment'],
    required: [true, 'Movement type is required'],
  },
  documentRef: { type: String, required: [true, 'Document reference is required'] },
  documentModel: {
    type: String,
    enum: ['Receipt', 'Delivery', 'Transfer', 'Adjustment'],
    required: [true, 'Document model is required'],
  },
  qtyBefore: { type: Number, required: true },
  qtyChange: { type: Number, required: true },
  qtyAfter: { type: Number, required: true },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: { type: Date, default: Date.now, immutable: true },
});

stockLedgerSchema.index({ product: 1, warehouse: 1, createdAt: -1 });
stockLedgerSchema.index({ documentRef: 1 });

module.exports = mongoose.model('StockLedger', stockLedgerSchema);
