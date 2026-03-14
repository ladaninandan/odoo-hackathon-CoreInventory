const Product = require('../models/Product');
const StockLedger = require('../models/StockLedger');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// GET /api/v1/products
exports.getProducts = async (req, res, next) => {
  try {
    const { search, category, status, warehouse, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (search) {
      filter.$text = { $search: search };
    }
    if (category && category !== 'all') {
      filter.category = category;
    }
    if (status === 'active') filter.isActive = true;
    else if (status === 'inactive') filter.isActive = false;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [items, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name')
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      Product.countDocuments(filter),
    ]);

    return sendSuccess(res, 200, 'Products retrieved', {
      items,
      pagination: { page: parseInt(page, 10), total, limit: parseInt(limit, 10), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/products/:id
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name')
      .populate('createdBy', 'name');

    if (!product) return sendError(res, 404, 'Product not found');
    return sendSuccess(res, 200, 'Product retrieved', { product });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/products
exports.createProduct = async (req, res, next) => {
  try {
    const product = await Product.create({ ...req.body, createdBy: req.user.id });
    const populated = await product.populate('category', 'name');
    return sendSuccess(res, 201, 'Product created', { product: populated });
  } catch (error) {
    next(error);
  }
};

// PUT /api/v1/products/:id
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('category', 'name');

    if (!product) return sendError(res, 404, 'Product not found');
    return sendSuccess(res, 200, 'Product updated', { product });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/products/:id (soft delete)
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!product) return sendError(res, 404, 'Product not found');
    return sendSuccess(res, 200, 'Product deactivated', { product });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/products/:id/stock
exports.getProductStock = async (req, res, next) => {
  try {
    const stock = await StockLedger.aggregate([
      { $match: { product: require('mongoose').Types.ObjectId.createFromHexString(req.params.id) } },
      { $group: { _id: '$warehouse', currentStock: { $sum: '$qtyChange' } } },
      { $lookup: { from: 'warehouses', localField: '_id', foreignField: '_id', as: 'warehouse' } },
      { $unwind: '$warehouse' },
      { $project: { warehouseId: '$_id', warehouseName: '$warehouse.name', warehouseCode: '$warehouse.code', currentStock: 1, _id: 0 } },
    ]);

    return sendSuccess(res, 200, 'Stock per warehouse', { stock });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/products/low-stock
exports.getLowStockProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isActive: true }).populate('category', 'name');
    const lowStock = [];

    for (const p of products) {
      const result = await StockLedger.aggregate([
        { $match: { product: p._id } },
        { $group: { _id: null, total: { $sum: '$qtyChange' } } },
      ]);
      const currentStock = result[0]?.total ?? 0;
      if (currentStock <= p.minStockLevel) {
        lowStock.push({ ...p.toObject(), currentStock });
      }
    }

    return sendSuccess(res, 200, 'Low stock products', { items: lowStock });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/products/scan/:barcode
exports.getProductByBarcode = async (req, res, next) => {
  try {
    const product = await Product.findOne({ barcode: req.params.barcode, isActive: true })
      .populate('category', 'name');

    if (!product) return sendError(res, 404, 'No product found for this barcode');
    return sendSuccess(res, 200, 'Product found', { product });
  } catch (error) {
    next(error);
  }
};
