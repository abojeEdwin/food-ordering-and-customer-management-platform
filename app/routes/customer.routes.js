
const express = require('express');
const customerController = require('../controllers/customer.controller');
const {globalLimiter} = require("../middleware/rateLimit.middleware");
//const { protect, restrictTo } = require('../middleware/auth.middleware');

const router = express.Router();

//router.use(protect, restrictTo('customer'));

router.get('/food', customerController.browseFood);

router.post('/cart',globalLimiter ,customerController.addToCart);
router.get('/cart',globalLimiter ,customerController.viewCart);
router.delete('/cart/items/:foodItemId', globalLimiter,customerController.removeFromCart);
router.delete('/cart', globalLimiter,customerController.clearCart);

router.post('/orders',globalLimiter ,customerController.placeOrder);
router.patch('/orders/:orderId/cancel',globalLimiter ,customerController.cancelOrder);
router.post('/orders/:orderId/pay',globalLimiter ,customerController.simulatePayment);

module.exports = router;
