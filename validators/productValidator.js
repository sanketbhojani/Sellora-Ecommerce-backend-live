import Joi from "joi";

// ✅ Reusable ObjectId pattern
const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const createProductSchema = Joi.object({
    name: Joi.string()
        .trim()
        .min(3)
        .max(100)
        .required()
        .messages({
            "string.min": "Product name must be at least 3 characters",
            "string.max": "Product name cannot exceed 100 characters",
            "any.required": "Product name is required",
            "string.empty": "Product name cannot be empty",
        }),

    description: Joi.string()
        .trim()
        .min(10)
        .max(2000)
        .required()
        .messages({
            "string.min": "Description must be at least 10 characters",
            "string.max": "Description cannot exceed 2000 characters",
            "any.required": "Description is required",
            "string.empty": "Description cannot be empty",
        }),

    price: Joi.number()
        .min(0)
        .required()
        .messages({
            "number.base": "Price must be a number",
            "number.min": "Price cannot be negative",
            "any.required": "Price is required",
        }),

    originalPrice: Joi.number()
        .min(0)
        .optional()
        .messages({
            "number.base": "Original price must be a number",
            "number.min": "Original price cannot be negative",
        }),

    // ✅ Changed: category → categoryId (MongoDB ObjectId)
    categoryId: Joi.string()
        .pattern(objectIdPattern)
        .required()
        .messages({
            "any.required": "Category ID is required",
            "string.empty": "Category ID cannot be empty",
            "string.pattern.base": "Category ID must be a valid MongoDB ObjectId",
        }),

    // ✅ Changed: subcategory → subcategoryId (MongoDB ObjectId)
    subcategoryId: Joi.string()
        .pattern(objectIdPattern)
        .required()
        .messages({
            "any.required": "Subcategory ID is required",
            "string.empty": "Subcategory ID cannot be empty",
            "string.pattern.base": "Subcategory ID must be a valid MongoDB ObjectId",
        }),

    stock: Joi.number()
        .integer()
        .min(0)
        .required()
        .messages({
            "number.base": "Stock must be a number",
            "number.integer": "Stock must be a whole number",
            "number.min": "Stock cannot be negative",
            "any.required": "Stock is required",
        }),

    tags: Joi.string()
        .optional()
        .allow("")
        .messages({
            "string.base": "Tags must be a string",
        }),
});

const updateProductSchema = Joi.object({
    name: Joi.string()
        .trim()
        .min(3)
        .max(100)
        .optional()
        .messages({
            "string.min": "Product name must be at least 3 characters",
            "string.max": "Product name cannot exceed 100 characters",
            "string.empty": "Product name cannot be empty",
        }),

    description: Joi.string()
        .trim()
        .min(10)
        .max(2000)
        .optional()
        .messages({
            "string.min": "Description must be at least 10 characters",
            "string.max": "Description cannot exceed 2000 characters",
            "string.empty": "Description cannot be empty",
        }),

    price: Joi.number()
        .min(0)
        .optional()
        .messages({
            "number.base": "Price must be a number",
            "number.min": "Price cannot be negative",
        }),

    originalPrice: Joi.number()
        .min(0)
        .optional()
        .messages({
            "number.base": "Original price must be a number",
            "number.min": "Original price cannot be negative",
        }),

    // ✅ Changed: category → categoryId (MongoDB ObjectId)
    categoryId: Joi.string()
        .pattern(objectIdPattern)
        .optional()
        .messages({
            "string.empty": "Category ID cannot be empty",
            "string.pattern.base": "Category ID must be a valid MongoDB ObjectId",
        }),

    // ✅ Changed: subcategory → subcategoryId (MongoDB ObjectId)
    subcategoryId: Joi.string()
        .pattern(objectIdPattern)
        .optional()
        .messages({
            "string.empty": "Subcategory ID cannot be empty",
            "string.pattern.base": "Subcategory ID must be a valid MongoDB ObjectId",
        }),

    stock: Joi.number()
        .integer()
        .min(0)
        .optional()
        .messages({
            "number.base": "Stock must be a number",
            "number.integer": "Stock must be a whole number",
            "number.min": "Stock cannot be negative",
        }),

    tags: Joi.string()
        .optional()
        .allow("")
        .messages({
            "string.base": "Tags must be a string",
        }),

    isActive: Joi.boolean()
        .optional()
        .messages({
            "boolean.base": "isActive must be true or false",
        }),
});

const createProductAdminSchema = createProductSchema.keys({
    sellerId: Joi.string()
        .pattern(objectIdPattern)
        .optional()
        .messages({
            "string.pattern.base": "Seller ID must be a valid MongoDB ObjectId",
        }),
});

export { createProductSchema, updateProductSchema, createProductAdminSchema };