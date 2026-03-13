
const express = require('express');
const adminController = require('../controllers/admin.controller');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

router.post('/categories', upload.single('image'), adminController.createCategory);
router.post('/food-items', upload.single('image'), adminController.addFoodItem);
router.patch('/food-items/:foodItemId', adminController.updateFoodItem);
router.patch('/food-items/:foodItemId/unavailable', adminController.markFoodItemUnavailable);
router.patch('/orders/:orderId', adminController.processOrder);
router.get('/categories/:categoryId/products', adminController.getProductsByCategory);
router.get('/products', adminController.findProductByName);
router.delete('/food-items/:foodItemId', adminController.removeProduct);
router.get('/orders', adminController.getAllOrders);

module.exports = router;
