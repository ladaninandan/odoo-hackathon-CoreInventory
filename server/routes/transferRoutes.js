const express = require('express');
const router = express.Router();
const { getTransfers, createTransfer, validateTransfer } = require('../controllers/transferController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.use(authenticate);

router.get('/', getTransfers);
router.post('/', createTransfer);
router.put('/:id/validate', authorize('manager'), validateTransfer);

module.exports = router;
