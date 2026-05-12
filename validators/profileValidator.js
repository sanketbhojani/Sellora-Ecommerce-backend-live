// validators/profileValidator.js
import Joi from "joi";

export const updateProfileSchema = Joi.object({
    name: Joi.string().trim().min(2).max(50).optional()
        .messages({
            "string.min": "Name must be at least 2 characters",
            "string.max": "Name cannot exceed 50 characters",
        }),

    shopName: Joi.string().trim().min(2).max(100).optional()
        .messages({
            "string.min": "Shop name must be at least 2 characters",
            "string.max": "Shop name cannot exceed 100 characters",
        }),

    shopDescription: Joi.string().trim().max(500).optional().allow("")
        .messages({
            "string.max": "Shop description cannot exceed 500 characters",
        }),

    avatar: Joi.any().optional(),   // ✅ file handled by multer
});