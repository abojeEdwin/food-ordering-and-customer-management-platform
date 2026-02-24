const customerService = require('../services/customer.service');
const catchAsync = require('../utils/catchAsync');

const browseFood = catchAsync(async (req, res) => {
  const foodItems = await customerService.browseFood(req.query);
  res.status(200).json({ status: 'success', data: foodItems });
});

const addToCart = catchAsync(async (req, res) => {
  const { foodItemId, quantity } = req.body;
  const cart = await customerService.addToCart(req.user.id, foodItemId, quantity);
  res.status(200).json({ status: 'success', data: cart });
});

const viewCart = catchAsync(async (req, res) => {
  const cart = await customerService.viewCart(req.user.id);
  res.status(200).json({ status: 'success', data: cart });
});

const removeFromCart = catchAsync(async (req, res) => {
  const { foodItemId } = req.params;
  const cart = await customerService.removeFromCart(req.user.id, foodItemId);
  res.status(200).json({ status: 'success', data: cart });
});

const clearCart = catchAsync(async (req, res) => {
  const cart = await customerService.clearCart(req.user.id);
  res.status(200).json({ status: 'success', data: cart });
});

const placeOrder = catchAsync(async (req, res) => {
  const { paymentMethod, billingAddress } = req.body;
  const order = await customerService.placeOrder(req.user.id, { paymentMethod, billingAddress });
  res.status(201).json({ status: 'success', data: order });
});

module.exports = {
  browseFood,
  addToCart,
  viewCart,
  removeFromCart,
  clearCart,
  placeOrder
};
