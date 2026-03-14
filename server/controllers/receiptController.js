const mongoose = require('mongoose');
const Receipt = require('../models/Receipt');
const { writeEntry } = require('../services/stockService');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// GET /api/v1/receipts
exports.getReceipts = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [items, total] = await Promise.all([
      Receipt.find(filter)
        .populate('warehouse', 'name code')
        .populate('createdBy', 'name')
        .populate('items.product', 'name sku')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      Receipt.countDocuments(filter),
    ]);

    return sendSuccess(res, 200, 'Receipts retrieved', {
      items,
      pagination: { page: parseInt(page, 10), total, limit: parseInt(limit, 10), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/receipts
exports.createReceipt = async (req, res, next) => {
  try {
    const receipt = await Receipt.create({ ...req.body, createdBy: req.user.id });
    const populated = await receipt.populate([
      { path: 'warehouse', select: 'name code' },
      { path: 'items.product', select: 'name sku' },
    ]);
    return sendSuccess(res, 201, 'Receipt created', { receipt: populated });
  } catch (error) {
    next(error);
  }
};

// PUT /api/v1/receipts/:id/validate
exports.validateReceipt = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const receipt = await Receipt.findById(req.params.id).session(session);
    if (!receipt) { await session.abortTransaction(); return sendError(res, 404, 'Receipt not found'); }
    if (receipt.status === 'validated') { await session.abortTransaction(); return sendError(res, 400, 'Already validated'); }

    for (const item of receipt.items) {
      await writeEntry({
        product: item.product,
        warehouse: receipt.warehouse,
        qtyChange: item.qty,
        type: 'receipt',
        refModel: 'Receipt',
        refId: receipt._id,
        performedBy: req.user.id,
        note: `Receipt #${receipt.receiptNumber}`,
      }, session);
    }

    receipt.status = 'validated';
    receipt.validatedBy = req.user.id;
    receipt.validatedAt = new Date();
    await receipt.save({ session });

    await session.commitTransaction();
    return sendSuccess(res, 200, 'Receipt validated — stock updated');
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};
