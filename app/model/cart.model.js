
const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  foodItems: [{
    foodItemId: {
      type: mongoose.Schema.ObjectId,
      ref: 'FoodItem',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  }],
  orderId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Order',
    default: null,
  },
}, { timestamps: true });

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
