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
    const trendAgg = await StockLedger.aggregate([
      { 
        $match: { 
          createdAt: { 
            $gte: new Date(new Date().setDate(new Date().getDate() - 7)) 
          } 
        } 
      },
      { 
        $group: { 
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Asia/Kolkata' } }, 
          inbound: { $sum: { $cond: [{ $gt: ['$qtyChange', 0] }, '$qtyChange', 0] } }, 
          outbound: { $sum: { $cond: [{ $lt: ['$qtyChange', 0] }, { $abs: '$qtyChange' }, 0] } } 
        } 
      },
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', inbound: 1, outbound: 1, _id: 0 } },
    ]);
    
    const trendByDate = Object.fromEntries(trendAgg.map((r) => [r.date, r]));
    const trendData = [];
    
    for (let i = 6; i >= 0; i--) {
      // Create a localized date string in YYYY-MM-DD
      const d = new Date();
      d.setDate(d.getDate() - i);
      const tzOffset = d.getTimezoneOffset() * 60000;
      const localISOTime = (new Date(d.getTime() - tzOffset)).toISOString().slice(0, 10);
      
      trendData.push(trendByDate[localISOTime] || { date: localISOTime, inbound: 0, outbound: 0 });
    }

    // Movement type breakdown
    const movementBreakdown = await StockLedger.aggregate([
      { $group: { _id: '$movementType', count: { $sum: 1 }, totalQty: { $sum: { $abs: '$qtyChange' } } } },
      { $project: { type: '$_id', count: 1, totalQty: 1, _id: 0 } },
    ]);

    // Stock by warehouse
    const stockByWarehouse = await StockLedger.aggregate([
      { $group: { _id: '$warehouse', total: { $sum: '$qtyChange' } } },
      // Convert string ID to ObjectId for lookup if needed (sometimes refs are stored as string)
      { $addFields: { warehouseObjId: { $toObjectId: '$_id' } } },
      { $lookup: { from: 'warehouses', localField: 'warehouseObjId', foreignField: '_id', as: 'warehouse' } },
      { $unwind: { path: '$warehouse', preserveNullAndEmptyArrays: true } },
      { $project: { name: { $ifNull: ['$warehouse.name', 'Unknown Warehouse'] }, total: 1, _id: 0 } },
    ]);

    // Top products by movement volume
    const topProducts = await StockLedger.aggregate([
      { $group: { _id: '$product', totalMovement: { $sum: { $abs: '$qtyChange' } } } },
      { $sort: { totalMovement: -1 } },
      { $limit: 10 },
      { $addFields: { productObjId: { $toObjectId: '$_id' } } },
      { $lookup: { from: 'products', localField: 'productObjId', foreignField: '_id', as: 'product' } },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      { $project: { name: { $ifNull: ['$product.name', 'Unknown Product'] }, totalMovement: 1, _id: 0 } },
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
