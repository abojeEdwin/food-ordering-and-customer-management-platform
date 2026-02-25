
const express = require('express');
const adminController = require('../controllers/admin.controller');

const router = express.Router();

router.post('/categories', adminController.createCategory);
router.post('/food-items', adminController.addFoodItem);
router.patch('/food-items/:foodItemId', adminController.updateFoodItem);
router.patch('/food-items/:foodItemId/unavailable', adminController.markFoodItemUnavailable);
router.patch('/orders/:orderId', adminController.processOrder);
router.get('/categories/:categoryId/products', adminController.getProductsByCategory);
router.get('/products', adminController.findProductByName);
router.delete('/food-items/:foodItemId', adminController.removeProduct);
router.get('/orders', adminController.getAllOrders);

module.exports = router;
