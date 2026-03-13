
const Category = require('../model/category.model');
const FoodItem = require('../model/foodItem.model');
const Order = require('../model/order.model');
const AppError = require("../utils/appError");
const { buildKey, getJson, setJson, delByPattern } = require('./cache.service');
const { appendOrderEvent, publishOrderStatus, enqueueOrderNotification } = require('./orderEvents.service');


const createCategory = async (categoryBody) => {
  const existingCategory = await Category.findOne({ name: categoryBody.name });
  if (existingCategory) {
    throw new AppError('Category already exists', 400);
  }
  return Category.create(categoryBody);
};

const addFoodItem = async (foodItemBody) => {
  const category = await Category.findOne({ name: foodItemBody.categoryName });
  if (!category) {
    throw new AppError('Category not found', 404);
  }
  const existingFoodItem = await FoodItem.findOne({ name: foodItemBody.name, categoryName: foodItemBody.categoryName });
  if (existingFoodItem) {
    throw new AppError('Food item already exists', 400);
  }
  const created = await FoodItem.create(foodItemBody);
  await delByPattern(buildKey('food', '*'));
  return created;
};


const updateFoodItem = async (foodItemId, updateBody) => {
  const foodItem = await FoodItem.findByIdAndUpdate(foodItemId, updateBody, { new: true });
  if (!foodItem) {
    throw new AppError('Food item not found. Try adding the food item ',404);
  }
  await delByPattern(buildKey('food', '*'));
  return foodItem;
};

const markFoodItemUnavailable = async (foodItemId) => {
  const foodItem = await FoodItem.findByIdAndUpdate(foodItemId, { isAvailable: false }, { new: true });
  if (!foodItem) {
    throw new AppError('Food item not found',404);
  }
  await delByPattern(buildKey('food', '*'));
  return foodItem;
};

const processOrder = async (orderId, newStatus) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  const currentStatus = order.status;
  const allowedTransitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['preparing', 'cancelled'],
    preparing: ['out_for_delivery'],
    out_for_delivery: ['delivered'],
    delivered: [],
    cancelled: [],
  };

  if (!allowedTransitions[currentStatus] || !allowedTransitions[currentStatus].includes(newStatus)) {
    throw new AppError(`Invalid status transition from ${currentStatus} to ${newStatus}`, 400);
  }

  order.status = newStatus;
  if (newStatus === 'delivered') {
    order.paymentStatus = 'paid';
  }

  await order.save();
  await appendOrderEvent('status_changed', order, { source: 'admin' });
  await publishOrderStatus('status_changed', order, { source: 'admin' });
  await enqueueOrderNotification(order);
  return order;
};


const getProductsByCategory = async (categoryId) => {
  const cacheKey = buildKey('food', 'category', categoryId);
  const cached = await getJson(cacheKey);
  if (cached) return cached;

  const foodItems = await FoodItem.find({ categoryId });
  if (!foodItems) {
    throw new AppError('Food items not found',404);
  }
  await setJson(cacheKey, foodItems);
  return foodItems;
};


const findProductByName = async (name) => {
  if (!name) {
    throw new AppError('Name is required',400);
  }
  const cacheKey = buildKey('food', 'search', `name=${name}`);
  const cached = await getJson(cacheKey);
  if (cached) return cached;

  const foodItems = await FoodItem.find({ name: { $regex: name, $options: 'i' } });
  if (!foodItems) {
    throw new AppError('Food items not found',404);
  }
  await setJson(cacheKey, foodItems);
  return foodItems;
};


const removeProduct = async (foodItemId) => {
  const foodItem = await FoodItem.findByIdAndDelete(foodItemId);
  if (!foodItem) {
    throw new AppError('Food item not found',404);
  }
  await delByPattern(buildKey('food', '*'));
};


const getAllOrders = async () => {
  return Order.find().populate('customerId').populate('items.foodItemId');
};

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
