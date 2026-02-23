
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [{
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
    price: {
      type: Number,
      required: true,
    },
  }],
  totalPrice: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'bank','transfer'],
  },
  billingAddress: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
