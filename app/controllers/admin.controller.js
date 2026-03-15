
const adminService = require('../services/admin.service');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { uploadImage, deleteObject } = require('../services/s3.service');
const Category = require('../model/category.model');
const FoodItem = require('../model/foodItem.model');

const createCategory = catchAsync(async (req, res) => {
  if (!req.body.name) {
    throw new AppError('Category name is required', 400);
  }

  const existingCategory = await Category.findOne({ name: req.body.name });
  if (existingCategory) {
    throw new AppError('Category already exists', 400);
  }

  let uploadedKey;
  try {
    if (req.file) {
      const { url, key } = await uploadImage(req.file, 'categories');
      req.body.imageUrl = url;
      uploadedKey = key;
    }

    if (!req.body.imageUrl) {
      throw new AppError('Category image is required', 400);
    }

    const category = await adminService.createCategory(req.body);
    res.status(201).json({ status: 'success', data: category });
  } catch (err) {
    if (uploadedKey) {
      try {
        await deleteObject(uploadedKey);
      } catch (cleanupError) {
        console.log('S3 cleanup failed:', cleanupError.message);
      }
    }
    throw err;
  }
});

const addFoodItem = catchAsync(async (req, res) => {
  if (!req.body.name || !req.body.categoryName) {
    throw new AppError('Food item name and categoryName are required', 400);
  }

  const category = await Category.findOne({ name: req.body.categoryName });
  if (!category) {
    throw new AppError('Category not found', 404);
  }

  const existingFoodItem = await FoodItem.findOne({
    name: req.body.name,
    categoryName: req.body.categoryName,
  });
  if (existingFoodItem) {
    throw new AppError('Food item already exists', 400);
  }

  let uploadedKey;
  try {
    if (req.file) {
      const { url, key } = await uploadImage(req.file, 'food-items');
      req.body.imageUrl = url;
      uploadedKey = key;
    }

    const foodItem = await adminService.addFoodItem(req.body);
    res.status(201).json({ status: 'success', data: foodItem });
  } catch (err) {
    if (uploadedKey) {
      try {
        await deleteObject(uploadedKey);
      } catch (cleanupError) {
        console.log('S3 cleanup failed:', cleanupError.message);
      }
    }
    throw err;
  }
});

const updateFoodItem = catchAsync(async (req, res) => {
  const foodItem = await adminService.updateFoodItem(req.params.foodItemId, req.body);
  res.status(201).json({ status: 'success', data: foodItem });
});

const markFoodItemUnavailable = catchAsync(async (req, res) => {
  const foodItem = await adminService.markFoodItemUnavailable(req.params.foodItemId);
  res.status(201).json({ status: 'success', data: foodItem });
});

const processOrder = catchAsync(async (req, res) => {
  const order = await adminService.processOrder(req.params.orderId, req.body.status);
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
  await adminService.removeProduct(req.params.foodItemId);
  res.status(200).json({ status: 'success', message: 'Product removed successfully' });
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
  processOrder,
  getProductsByCategory,
  findProductByName,
  removeProduct,
  getAllOrders,
};
