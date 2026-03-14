const express = require('express');
const router = express.Router();
const { getDashboardData, getStockSummaryReport } = require('../controllers/reportController');
const authenticate = require('../middleware/authenticate');

router.use(authenticate);

router.get('/dashboard', getDashboardData);
router.get('/stock-summary', getStockSummaryReport);

module.exports = router;
