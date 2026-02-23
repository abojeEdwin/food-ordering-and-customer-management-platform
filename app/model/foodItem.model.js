
const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  imageUrl: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  specialInstruction: {
    type: String,
    trim: true,
  },
  quantity: {
    type: Number,
    default: 1,
    min: 0,
  },
  categoryName: {
    type: String,
    ref: 'Category',
    required: true,
  },
}, { timestamps: true });

foodItemSchema.index({ name: 1, categoryId: 1 });

const FoodItem = mongoose.model('FoodItem', foodItemSchema);

module.exports = FoodItem;
