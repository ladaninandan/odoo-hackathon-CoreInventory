const StockLedger = require('../models/StockLedger');
const Product = require('../models/Product');
const Receipt = require('../models/Receipt');
const Delivery = require('../models/Delivery');
const { sendSuccess } = require('../utils/apiResponse');

// GET /api/v1/reports/dashboard
exports.getDashboardData = async (req, res, next) => {
  try {
    const [totalProducts, totalReceipts, totalDeliveries] = await Promise.all([
      Product.countDocuments({ isActive: true }),
      Receipt.countDocuments(),
      Delivery.countDocuments(),
    ]);

    // Total stock value
    const stockAgg = await StockLedger.aggregate([
      { $group: { _id: '$product', totalQty: { $sum: '$qtyChange' } } },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $project: { totalQty: 1, value: { $multiply: ['$totalQty', { $ifNull: ['$product.costPrice', 0] }] } } },
    ]);

    const totalStockValue = stockAgg.reduce((sum, s) => sum + (s.value || 0), 0);

    // Low stock count
    const lowStockItems = [];
    const products = await Product.find({ isActive: true });
    for (const p of products) {
      const result = await StockLedger.aggregate([
        { $match: { product: p._id } },
        { $group: { _id: null, total: { $sum: '$qtyChange' } } },
      ]);
      if ((result[0]?.total ?? 0) <= p.minStockLevel) lowStockItems.push(p);
    }

    // Stock trends (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const trendData = await StockLedger.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, inbound: { $sum: { $cond: [{ $gt: ['$qtyChange', 0] }, '$qtyChange', 0] } }, outbound: { $sum: { $cond: [{ $lt: ['$qtyChange', 0] }, { $abs: '$qtyChange' }, 0] } } } },
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', inbound: 1, outbound: 1, _id: 0 } },
    ]);

    // Movement type breakdown
    const movementBreakdown = await StockLedger.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 }, totalQty: { $sum: { $abs: '$qtyChange' } } } },
      { $project: { type: '$_id', count: 1, totalQty: 1, _id: 0 } },
    ]);

    // Stock by warehouse
    const stockByWarehouse = await StockLedger.aggregate([
      { $group: { _id: '$warehouse', total: { $sum: '$qtyChange' } } },
      { $lookup: { from: 'warehouses', localField: '_id', foreignField: '_id', as: 'warehouse' } },
      { $unwind: '$warehouse' },
      { $project: { name: '$warehouse.name', total: 1, _id: 0 } },
    ]);

    // Top products by movement volume
    const topProducts = await StockLedger.aggregate([
      { $group: { _id: '$product', totalMovement: { $sum: { $abs: '$qtyChange' } } } },
      { $sort: { totalMovement: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $project: { name: '$product.name', totalMovement: 1, _id: 0 } },
    ]);

    return sendSuccess(res, 200, 'Dashboard data', {
      kpi: {
        totalProducts,
        totalStockValue: Math.round(totalStockValue * 100) / 100,
        lowStockCount: lowStockItems.length,
        totalReceipts,
        totalDeliveries,
        recentMovements: await StockLedger.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
      },
      charts: {
        trendData,
        movementBreakdown,
        stockByWarehouse,
        topProducts,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/reports/stock-summary — JSON
exports.getStockSummaryReport = async (req, res, next) => {
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
          productName: '$product.name',
          productSku: '$product.sku',
          warehouseName: '$warehouse.name',
          currentStock: 1,
          value: { $multiply: ['$currentStock', { $ifNull: ['$product.costPrice', 0] }] },
        },
      },
      { $sort: { productName: 1 } },
    ]);

    return sendSuccess(res, 200, 'Stock summary report', { summary });
  } catch (error) {
    next(error);
  }
};
