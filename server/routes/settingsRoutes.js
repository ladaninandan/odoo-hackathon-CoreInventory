const express = require('express');
const router = express.Router();
const {
  getCategories,
  createCategory,
  updateCategory,
  getWarehouses,
  createWarehouse,
  updateWarehouse,
  getUsers,
  updateUser,
} = require('../controllers/settingsController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.use(authenticate, authorize('manager'));

// Categories
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);

// Warehouses
router.get('/warehouses', getWarehouses);
router.post('/warehouses', createWarehouse);
router.put('/warehouses/:id', updateWarehouse);

// Users
router.get('/users', getUsers);
router.put('/users/:id', updateUser);

module.exports = router;
