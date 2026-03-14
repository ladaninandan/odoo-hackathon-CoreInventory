const StockLedger = require('../models/StockLedger');

const getCurrentStock = async (productId, warehouseId) => {
  const result = await StockLedger.aggregate([
    {
      $match: {
        product: productId,
        warehouse: warehouseId,
      },
    },
    { $group: { _id: null, total: { $sum: '$qtyChange' } } },
  ]);
  return result[0]?.total ?? 0;
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
