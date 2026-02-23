
const { Category, FoodItem, Order } = require('../model');
const AppError = require('../utils/appError');

const createCategory = async (categoryData) => {
  const existingCategory = await Category.findOne({ name: categoryData.name });
  if (existingCategory) {
    throw new AppError('Category already exists', 400);
  }
  const category = await Category.create(categoryData);
  return category;
};

const addFoodItem = async (foodItemData) => {
  const category = await Category.findOne(foodItemData.categoryName);
  if (!category) {
    throw new AppError('Category not found', 404);
  }
  const foodItem = await FoodItem.create(foodItemData);
  return foodItem;
};

const updateFoodItem = async (id, updateData) => {
  const foodItem = await FoodItem.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
  if (!foodItem) {
    throw new AppError('Food item not found', 404);
  }
  return foodItem;
};

const markFoodItemUnavailable = async (id) => {
  const foodItem = await FoodItem.findByIdAndUpdate(
    id,
    { isAvailable: false },
    { new: true }
  );
  if (!foodItem) {
    throw new AppError('Food item not found', 404);
  }
  return foodItem;
};

const manageOrder = async (orderId, status) => {
  const order = await Order.findByIdAndUpdate(
    orderId,
    { status },
    { new: true, runValidators: true }
  );
  if (!order) {
    throw new AppError('Order not found', 404);
  }
  return order;
};

const getProductsByCategory = async (categoryId) => {
  const products = await FoodItem.find({ categoryId });
  if(!products)throw new AppError('Product not found by categoryId. Please and try again', 404)
  return products;
};

const findProductByName = async (name) => {
  const products = await FoodItem.find({
    name: { $regex: name, $options: 'i' },
  });
  if(!products){
    throw new AppError('Product not found', 404);
  }
  return products;
};

const removeProduct = async (id) => {
  const foodItem = await FoodItem.findByIdAndDelete(id);
  if (!foodItem) {
    throw new AppError('Food item not found', 404);
  }
  return { message: 'Food item removed successfully' };
};

const getAllOrders = async () => {
  const orders = await Order.find().populate('items.foodItemId').populate('customerId');
  return orders;
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
