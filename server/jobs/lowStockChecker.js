const cron = require('node-cron');
const Product = require('../models/Product');
const User = require('../models/User');
const StockLedger = require('../models/StockLedger');
const { sendLowStockAlert } = require('../services/emailService');
const { logger } = require('../middleware/errorHandler');

const getTotalStock = async (productId) => {
  const result = await StockLedger.aggregate([
    { $match: { product: productId } },
    { $group: { _id: null, total: { $sum: '$qtyChange' } } },
  ]);
  return result[0]?.total ?? 0;
};

// Run every day at 8:00 AM
cron.schedule('0 8 * * *', async () => {
  try {
    logger.info('[LowStockJob] Starting daily low stock check...');
    const products = await Product.find({ isActive: true }).populate('category');
    const flagged = [];

    for (const p of products) {
      const stock = await getTotalStock(p._id);
      if (stock <= p.minStockLevel) {
        flagged.push({ ...p.toObject(), currentStock: stock });
      }
    }

    if (!flagged.length) {
      logger.info('[LowStockJob] No low stock items found.');
      return;
    }

    const managers = await User.find({ role: 'manager', isActive: true });
    for (const manager of managers) {
      await sendLowStockAlert(manager.email, manager.name, flagged);
    }

    logger.info(`[LowStockJob] Alert sent for ${flagged.length} items to ${managers.length} managers`);
  } catch (error) {
    logger.error(`[LowStockJob] Error: ${error.message}`);
  }
});
