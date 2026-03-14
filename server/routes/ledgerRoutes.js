const express = require('express');
const router = express.Router();
const { getLedgerEntries, getStockSummary } = require('../controllers/ledgerController');
const authenticate = require('../middleware/authenticate');

router.use(authenticate);

router.get('/', getLedgerEntries);
router.get('/summary', getStockSummary);

module.exports = router;
