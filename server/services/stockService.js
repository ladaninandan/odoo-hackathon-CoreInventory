const mongoose = require('mongoose');
const StockLedger = require('../models/StockLedger');

const toObjectId = (id) => {
  if (!id) return null;
  if (id instanceof mongoose.Types.ObjectId) return id;
  if (typeof id === 'object' && id._id) return id._id;
  return new mongoose.Types.ObjectId(id);
};

const getCurrentStock = async (productId, warehouseId) => {
  const product = toObjectId(productId);
  const warehouse = toObjectId(warehouseId);
  if (!product || !warehouse) return 0;
  const result = await StockLedger.aggregate([
    {
      $match: {
        product,
        warehouse,
      },
    },
    { $group: { _id: null, total: { $sum: '$qtyChange' } } },
  ]);
  const total = result[0]?.total;
  return typeof total === 'number' ? total : 0;
};

// Controllers call: writeEntry({ product, warehouse, qtyChange, type, refModel, refId, performedBy, note }, session)
const writeEntry = async (data, session) => {
  const { product, warehouse, qtyChange, type, refModel, refId, performedBy } = data;

  const qtyBefore = await getCurrentStock(product, warehouse);
  const qtyAfter = qtyBefore + qtyChange;

  await StockLedger.create(
    [
      {
        product,
        warehouse,
        movementType: type,
        documentRef: String(refId),
        documentModel: refModel,
        qtyBefore,
        qtyChange,
        qtyAfter,
        performedBy,
      },
    ],
    { session }
  );

  return qtyAfter;
};

module.exports = { getCurrentStock, writeEntry };
