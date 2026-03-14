const express = require('express');
const router = express.Router();
const { getDeliveries, createDelivery, validateDelivery } = require('../controllers/deliveryController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.use(authenticate);

router.get('/', getDeliveries);
router.post('/', createDelivery);
router.put('/:id/validate', authorize('manager'), validateDelivery);

module.exports = router;
