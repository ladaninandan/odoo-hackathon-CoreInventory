const mongoose = require('mongoose');
const Delivery = require('../models/Delivery');
const { writeEntry, getCurrentStock } = require('../services/stockService');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// GET /api/v1/deliveries
exports.getDeliveries = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [items, total] = await Promise.all([
      Delivery.find(filter)
        .populate('warehouse', 'name code')
        .populate('createdBy', 'name')
        .populate('items.product', 'name sku')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      Delivery.countDocuments(filter),
    ]);

    return sendSuccess(res, 200, 'Deliveries retrieved', {
      items,
      pagination: { page: parseInt(page, 10), total, limit: parseInt(limit, 10), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/deliveries
exports.createDelivery = async (req, res, next) => {
  try {
    const delivery = await Delivery.create({ ...req.body, createdBy: req.user.id });
    const populated = await delivery.populate([
      { path: 'warehouse', select: 'name code' },
      { path: 'items.product', select: 'name sku' },
    ]);
    return sendSuccess(res, 201, 'Delivery created', { delivery: populated });
  } catch (error) {
    next(error);
  }
};

// PUT /api/v1/deliveries/:id/validate
exports.validateDelivery = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const delivery = await Delivery.findById(req.params.id).session(session);
    if (!delivery) { await session.abortTransaction(); return sendError(res, 404, 'Delivery not found'); }
    if (delivery.status === 'validated') { await session.abortTransaction(); return sendError(res, 400, 'Already validated'); }

    for (const item of delivery.items) {
      const stock = await getCurrentStock(item.product, delivery.warehouse);
      if (stock < item.qty) {
        await session.abortTransaction();
        return sendError(res, 400, `Insufficient stock for product ${item.product}. Available: ${stock}`);
      }

      await writeEntry({
        product: item.product,
        warehouse: delivery.warehouse,
        qtyChange: -item.qty,
        type: 'delivery',
        refModel: 'Delivery',
        refId: delivery._id,
        performedBy: req.user.id,
        note: `Delivery #${delivery.deliveryNumber}`,
      }, session);
    }

    delivery.status = 'validated';
    delivery.validatedBy = req.user.id;
    delivery.validatedAt = new Date();
    await delivery.save({ session });

    await session.commitTransaction();
    return sendSuccess(res, 200, 'Delivery validated — stock deducted');
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};
