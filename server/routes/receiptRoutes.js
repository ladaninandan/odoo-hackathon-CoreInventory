const express = require('express');
const router = express.Router();
const { getReceipts, createReceipt, validateReceipt } = require('../controllers/receiptController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.use(authenticate);

router.get('/', getReceipts);
router.post('/', createReceipt);
router.put('/:id/validate', authorize('manager'), validateReceipt);

module.exports = router;
