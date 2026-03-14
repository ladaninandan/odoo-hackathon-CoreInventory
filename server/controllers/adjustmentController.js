const mongoose = require('mongoose');
const Adjustment = require('../models/Adjustment');
const { writeEntry } = require('../services/stockService');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// GET /api/v1/adjustments
exports.getAdjustments = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const [items, total] = await Promise.all([
      Adjustment.find()
        .populate('product', 'name sku')
        .populate('warehouse', 'name code')
        .populate('adjustedBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      Adjustment.countDocuments(),
    ]);

    return sendSuccess(res, 200, 'Adjustments retrieved', {
      items,
      pagination: { page: parseInt(page, 10), total, limit: parseInt(limit, 10), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/adjustments — create and immediately apply
exports.createAdjustment = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { product, warehouse, qtyChange, reason } = req.body;

    const adjustment = await Adjustment.create(
      [{ product, warehouse, qtyChange, reason, adjustedBy: req.user.id }],
      { session }
    );

    await writeEntry({
      product,
      warehouse,
      qtyChange,
      type: 'adjustment',
      refModel: 'Adjustment',
      refId: adjustment[0]._id,
      performedBy: req.user.id,
      note: `Adjustment: ${reason}`,
    }, session);

    await session.commitTransaction();

    const populated = await Adjustment.findById(adjustment[0]._id)
      .populate('product', 'name sku')
      .populate('warehouse', 'name code')
      .populate('adjustedBy', 'name');

    return sendSuccess(res, 201, 'Adjustment created and applied', { adjustment: populated });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};
