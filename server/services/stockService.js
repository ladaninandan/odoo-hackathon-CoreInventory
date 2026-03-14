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

const writeEntry = async (
  session,
  { product, warehouse, movementType, documentRef, documentModel, qtyChange, performedBy }
) => {
  const qtyBefore = await getCurrentStock(product, warehouse);
  const qtyAfter = qtyBefore + qtyChange;

  await StockLedger.create(
    [
      {
        product,
        warehouse,
        movementType,
        documentRef,
        documentModel,
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
