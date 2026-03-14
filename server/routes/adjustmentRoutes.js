const express = require('express');
const router = express.Router();
const { getAdjustments, createAdjustment } = require('../controllers/adjustmentController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.use(authenticate, authorize('manager'));

router.get('/', getAdjustments);
router.post('/', createAdjustment);

module.exports = router;
