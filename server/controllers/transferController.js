const mongoose = require('mongoose');
const Transfer = require('../models/Transfer');
const { writeEntry, getCurrentStock } = require('../services/stockService');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// GET /api/v1/transfers
exports.getTransfers = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [items, total] = await Promise.all([
      Transfer.find(filter)
        .populate('fromWarehouse', 'name code')
        .populate('toWarehouse', 'name code')
        .populate('createdBy', 'name')
        .populate('items.product', 'name sku')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      Transfer.countDocuments(filter),
    ]);

    return sendSuccess(res, 200, 'Transfers retrieved', {
      items,
      pagination: { page: parseInt(page, 10), total, limit: parseInt(limit, 10), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/transfers
exports.createTransfer = async (req, res, next) => {
  try {
    const transfer = await Transfer.create({ ...req.body, createdBy: req.user.id });
    const populated = await transfer.populate([
      { path: 'fromWarehouse', select: 'name code' },
      { path: 'toWarehouse', select: 'name code' },
      { path: 'items.product', select: 'name sku' },
    ]);
    return sendSuccess(res, 201, 'Transfer created', { transfer: populated });
  } catch (error) {
    next(error);
  }
};

// PUT /api/v1/transfers/:id/validate
exports.validateTransfer = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const transfer = await Transfer.findById(req.params.id).session(session);
    if (!transfer) { await session.abortTransaction(); return sendError(res, 404, 'Transfer not found'); }
    if (transfer.status === 'validated') { await session.abortTransaction(); return sendError(res, 400, 'Already validated'); }

    for (const item of transfer.items) {
      const stock = await getCurrentStock(item.product, transfer.fromWarehouse);
      if (stock < item.qty) {
        await session.abortTransaction();
        return sendError(res, 400, `Insufficient stock in source warehouse for product ${item.product}`);
      }

      // Deduct from source
      await writeEntry({
        product: item.product,
        warehouse: transfer.fromWarehouse,
        qtyChange: -item.qty,
        type: 'transfer_out',
        refModel: 'Transfer',
        refId: transfer._id,
        performedBy: req.user.id,
        note: `Transfer out #${transfer.transferNumber}`,
      }, session);

      // Add to destination
      await writeEntry({
        product: item.product,
        warehouse: transfer.toWarehouse,
        qtyChange: item.qty,
        type: 'transfer_in',
        refModel: 'Transfer',
        refId: transfer._id,
        performedBy: req.user.id,
        note: `Transfer in #${transfer.transferNumber}`,
      }, session);
    }

    transfer.status = 'validated';
    transfer.validatedBy = req.user.id;
    transfer.validatedAt = new Date();
    await transfer.save({ session });

    await session.commitTransaction();
    return sendSuccess(res, 200, 'Transfer validated — stock moved');
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};
