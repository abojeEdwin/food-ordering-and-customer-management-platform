const Cart = require('../model/cart.model');
const FoodItem = require('../model/foodItem.model');
const Order = require('../model/order.model');
const AppError = require("../utils/appError");

const browseFood = async (query) => {
  const filter = { isAvailable: true };
  if (query.search) {
    filter.name = { $regex: query.search, $options: 'i' };
  }
  if (query.category) {
    filter.categoryName = query.category;
  }
  
  const foodItems = await FoodItem.find(filter);
  return foodItems;
};

const addToCart = async (customerId, foodItemId, quantity) => {
  if (!quantity || quantity < 1) {
    throw new AppError('Quantity must be at least 1', 400);
  }

  const foodItem = await FoodItem.findById(foodItemId);
  if (!foodItem) {
    throw new AppError('Food item not found', 404);
  }
  if (!foodItem.isAvailable) {
    throw new AppError('Food item is not available', 400);
  }

  let cart = await Cart.findOne({ customerId });
  if (!cart) {
    cart = await Cart.create({
      customerId,
      foodItems: [{ foodItemId, quantity }]
    });
  } else {
    const itemIndex = cart.foodItems.findIndex(item => item.foodItemId.toString() === foodItemId);
    if (itemIndex > -1) {
      cart.foodItems[itemIndex].quantity += quantity;
    } else {
      cart.foodItems.push({ foodItemId, quantity });
    }
    await cart.save();
  }
  return cart;
};

const viewCart = async (customerId) => {
  const cart = await Cart.findOne({ customerId }).populate('foodItems.foodItemId');
  if (!cart) {
    return { foodItems: [] };
  }
  return cart;
};

const removeFromCart = async (customerId, foodItemId) => {
  let cart = await Cart.findOne({ customerId });
  if (!cart) {
    throw new AppError('Cart not found', 404);
  }

  cart.foodItems = cart.foodItems.filter(item => item.foodItemId.toString() !== foodItemId);
  await cart.save();
  return cart;
};

const clearCart = async (customerId) => {
  let cart = await Cart.findOne({ customerId });
  if (!cart) {
    throw new AppError('Cart not found', 404);
  }
  cart.foodItems = [];
  await cart.save();
  return cart;
};

const placeOrder = async (customerId, { paymentMethod, billingAddress }) => {
  const cart = await Cart.findOne({ customerId }).populate('foodItems.foodItemId');
  if (!cart || cart.foodItems.length === 0) {
    throw new AppError('Cart is empty', 400);
  }

  let totalPrice = 0;
  const orderItems = [];
  const unavailableItems = [];

  for (const item of cart.foodItems) {
    const foodItem = item.foodItemId;
    
    if (!foodItem) {
        continue;
    }

    // Check if the item is still available
    if (!foodItem.isAvailable) {
      unavailableItems.push(foodItem.name);
      continue; 
    }

    totalPrice += foodItem.price * item.quantity;
    orderItems.push({
      foodItemId: foodItem._id,
      quantity: item.quantity,
      price: foodItem.price
    });
  }

  if (unavailableItems.length > 0) {
    throw new AppError(`The following items are no longer available: ${unavailableItems.join(', ')}. Please remove them from your cart.`, 400);
  }

  if (orderItems.length === 0) {
    throw new AppError('No valid items in cart to order', 400);
  }

  const order = await Order.create({
    customerId,
    items: orderItems,
    totalPrice,
    paymentMethod,
    billingAddress,
    status: 'pending',
    paymentStatus: 'pending'
  });

  cart.foodItems = [];
  await cart.save();

  return order;
};

const cancelOrder = async (customerId, orderId) => {
  const order = await Order.findOne({ _id: orderId, customerId });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (order.status !== 'pending') {
    throw new AppError('Order cannot be cancelled at this stage', 400);
  }

  order.status = 'cancelled';
  await order.save();
  return order;
};

const simulatePayment = async (customerId, orderId) => {
  const order = await Order.findOne({ _id: orderId, customerId });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (order.status === 'cancelled') {
      throw new AppError('Cannot pay for a cancelled order', 400);
  }
  
  if (order.paymentStatus === 'paid') {
    throw new AppError('Order is already paid', 400);
  }

  // Simulate payment processing (90% success rate)
  const isSuccess = Math.random() < 0.9; 

  if (isSuccess) {
    order.paymentStatus = 'paid';
    order.status = 'confirmed';
    await order.save();
    return { success: true, message: 'Payment successful', order };
  } else {
    order.paymentStatus = 'failed';
    await order.save();
    throw new AppError('Payment failed. Please try again.', 400);
  }
};

module.exports = {
  browseFood,
  addToCart,
  viewCart,
  removeFromCart,
  clearCart,
  placeOrder,
  cancelOrder,
  simulatePayment
};
