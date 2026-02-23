
const Category = require('../model/category.model');
const FoodItem = require('../model/foodItem.model');
const Order = require('../model/order.model');
const AppError = require("../utils/appError");


const createCategory = async (categoryBody) => {
  const existingCategory = await Category.findOne({ name: categoryBody.name });
  if (existingCategory) {
    throw new AppError('Category already exists', 400);
  }
  return Category.create(categoryBody);
};

const addFoodItem = async (foodItemBody) => {
  const category = await Category.findById(foodItemBody.categoryId);
  if (!category) {
    throw new AppError('Category not found', 404);
  }
  const existingFoodItem = await FoodItem.findOne({ name: foodItemBody.name, categoryId: foodItemBody.categoryId });
  if (existingFoodItem) {
    throw new AppError('Food item already exists', 400);
  }
  return FoodItem.create(foodItemBody);
};


const updateFoodItem = async (foodItemId, updateBody) => {
  const foodItem = await FoodItem.findByIdAndUpdate(foodItemId, updateBody, { new: true });
  if (!foodItem) {
    throw new AppError('Food item not found. Try adding the food item ',404);
  }
  return foodItem;
};

const markFoodItemUnavailable = async (foodItemId) => {
  const foodItem = await FoodItem.findByIdAndUpdate(foodItemId, { isAvailable: false }, { new: true });
  if (!foodItem) {
    throw new AppError('Food item not found',404);
  }
  return foodItem;
};


const manageOrder = async (orderId, status) => {
  const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
  if (!order) {
    throw new Error('Order not found');
  }
  return order;
};


const getProductsByCategory = async (categoryId) => {
  const foodItems = await FoodItem.find({ categoryId });
  if (!foodItems) {
    throw new AppError('Food items not found',404);
  }
  return foodItems;
};


const findProductByName = async (name) => {
  if (!name) {
    throw new AppError('Name is required',400);
  }
  const foodItems = await FoodItem.find({ name: { $regex: name, $options: 'i' } });
  if (!foodItems) {
    throw new AppError('Food items not found',404);
  }
  return foodItems;
};


const removeProduct = async (foodItemId) => {
  const foodItem = await FoodItem.findByIdAndDelete(foodItemId);
  if (!foodItem) {
    throw new AppError('Food item not found',404);
  }
};


const getAllOrders = async () => {
  return Order.find().populate('customerId').populate('items.foodItemId');
};

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
