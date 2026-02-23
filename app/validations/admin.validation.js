
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const createCategorySchema = Joi.object({
  name: Joi.string().required().trim(),
  description: Joi.string().trim().allow(''),
});

const addFoodItemSchema = Joi.object({
  name: Joi.string().required().trim(),
  imageUrl: Joi.string().uri().trim().allow(''),
  description: Joi.string().trim().allow(''),
  price: Joi.number().min(0).required(),
  isAvailable: Joi.boolean().default(true),
  specialInstruction: Joi.string().trim().allow(''),
  quantity: Joi.number().integer().min(0).default(1),
  categoryId: Joi.objectId().required(),
});

const updateFoodItemSchema = Joi.object({
  name: Joi.string().trim(),
  imageUrl: Joi.string().uri().trim().allow(''),
  description: Joi.string().trim().allow(''),
  price: Joi.number().min(0),
  isAvailable: Joi.boolean(),
  specialInstruction: Joi.string().trim().allow(''),
  quantity: Joi.number().integer().min(0),
  categoryId: Joi.objectId(),
}).min(1);

const manageOrderSchema = Joi.object({
  status: Joi.string().valid('pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled').required(),
});

const getProductsByCategorySchema = Joi.object({
  categoryId: Joi.objectId().required(),
});

const findProductByNameSchema = Joi.object({
  name: Joi.string().required().trim(),
});

const removeProductSchema = Joi.object({
  id: Joi.objectId().required(),
});

module.exports = {
  createCategorySchema,
  addFoodItemSchema,
  updateFoodItemSchema,
  manageOrderSchema,
  getProductsByCategorySchema,
  findProductByNameSchema,
  removeProductSchema,
};
