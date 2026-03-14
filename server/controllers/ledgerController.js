const StockLedger = require('../models/StockLedger');
const { sendSuccess } = require('../utils/apiResponse');

// GET /api/v1/ledger — query ledger entries
exports.getLedgerEntries = async (req, res, next) => {
  try {
    const { product, warehouse, type, startDate, endDate, page = 1, limit = 30 } = req.query;
    const filter = {};

    if (product) filter.product = product;
    if (warehouse) filter.warehouse = warehouse;
    if (type && type !== 'all') filter.movementType = type;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [items, total] = await Promise.all([
      StockLedger.find(filter)
        .populate('product', 'name sku')
        .populate('warehouse', 'name code')
        .populate('performedBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      StockLedger.countDocuments(filter),
    ]);

    return sendSuccess(res, 200, 'Ledger entries retrieved', {
      items,
      pagination: { page: parseInt(page, 10), total, limit: parseInt(limit, 10), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/ledger/summary — aggregated stock per product per warehouse
exports.getStockSummary = async (req, res, next) => {
  try {
    const summary = await StockLedger.aggregate([
      { $group: { _id: { product: '$product', warehouse: '$warehouse' }, currentStock: { $sum: '$qtyChange' } } },
      { $lookup: { from: 'products', localField: '_id.product', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $lookup: { from: 'warehouses', localField: '_id.warehouse', foreignField: '_id', as: 'warehouse' } },
      { $unwind: '$warehouse' },
      {
        $project: {
          _id: 0,
          productId: '$_id.product',
          productName: '$product.name',
          productSku: '$product.sku',
          warehouseId: '$_id.warehouse',
          warehouseName: '$warehouse.name',
          warehouseCode: '$warehouse.code',
          currentStock: 1,
        },
      },
      { $sort: { productName: 1, warehouseName: 1 } },
    ]);

    return sendSuccess(res, 200, 'Stock summary', { summary });
  } catch (error) {
    next(error);
  }
};
