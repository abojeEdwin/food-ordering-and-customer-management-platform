
const express = require('express');
const customerController = require('../controllers/customer.controller');
const {globalLimiter} = require("../middleware/rateLimit.middleware");
//const { protect, restrictTo } = require('../middleware/auth.middleware');

const router = express.Router();

//router.use(protect, restrictTo('customer'));

router.get('/food', customerController.browseFood);

router.post('/cart',customerController.addToCart);
router.get('/cart',customerController.viewCart);
router.delete('/cart/items/:foodItemId',customerController.removeFromCart);
router.delete('/cart', customerController.clearCart);

router.post('/orders',customerController.placeOrder);
router.patch('/orders/:orderId/cancel',customerController.cancelOrder);
router.post('/orders/:orderId/pay',customerController.simulatePayment);

module.exports = router;
