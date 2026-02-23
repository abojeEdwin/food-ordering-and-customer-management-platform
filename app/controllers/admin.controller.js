
const adminService = require('../services/admin.service');
const catchAsync = require('../utils/catchAsync');

const createCategory = catchAsync(async (req, res) => {
  const category = await adminService.createCategory(req.body);
  res.status(201).json({ status: 'success', data: category });
});

const addFoodItem = catchAsync(async (req, res) => {
  const foodItem = await adminService.addFoodItem(req.body);
  res.status(201).json({ status: 'success', data: foodItem });
});

const updateFoodItem = catchAsync(async (req, res) => {
  const foodItem = await adminService.updateFoodItem(req.params.id, req.body);
  res.status(200).json({ status: 'success', data: foodItem });
});

const markFoodItemUnavailable = catchAsync(async (req, res) => {
  const foodItem = await adminService.markFoodItemUnavailable(req.params.id);
  res.status(200).json({ status: 'success', data: foodItem });
});

const manageOrder = catchAsync(async (req, res) => {
  const order = await adminService.manageOrder(req.params.orderId, req.body.status);
  res.status(200).json({ status: 'success', data: order });
});

const getProductsByCategory = catchAsync(async (req, res) => {
  const products = await adminService.getProductsByCategory(req.params.categoryId);
  res.status(200).json({ status: 'success', data: products });
});

const findProductByName = catchAsync(async (req, res) => {
  const products = await adminService.findProductByName(req.query.name);
  res.status(200).json({ status: 'success', data: products });
});

const removeProduct = catchAsync(async (req, res) => {
  const result = await adminService.removeProduct(req.params.id);
  res.status(200).json({ status: 'success', data: result });
});

const getAllOrders = catchAsync(async (req, res) => {
  const orders = await adminService.getAllOrders();
  res.status(200).json({ status: 'success', data: orders });
});

module.exports = {
  createCategory,
  addFoodItem,
  updateFoodItem,
  markFoodItemUnavailable,
  manageOrder,
  getProductsByCategory,
  findProductByName,
  removeProduct,
  getAllOrders,
};
