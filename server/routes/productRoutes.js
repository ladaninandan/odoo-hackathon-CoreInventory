const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductStock,
  getLowStockProducts,
  getProductByBarcode,
} = require('../controllers/productController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.use(authenticate);

router.get('/low-stock', getLowStockProducts);
router.get('/scan/:barcode', getProductByBarcode);
router.get('/', getProducts);
router.get('/:id', getProductById);
router.get('/:id/stock', getProductStock);
router.post('/', authorize('manager'), createProduct);
router.put('/:id', authorize('manager'), updateProduct);
router.delete('/:id', authorize('manager'), deleteProduct);

module.exports = router;
