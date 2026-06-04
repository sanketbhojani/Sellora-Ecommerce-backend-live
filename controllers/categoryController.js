import mongoose from "mongoose";
import { Category } from "../models/Category.js";
import { Subcategory } from "../models/Subcategory.js";
import { v2 as cloudinary } from "cloudinary";
import { getCache, setCache, deleteCache, deleteCachePattern } from "../config/redis.js";

// ─── Cloudinary Helpers ───────────────────────────────────────

const getPublicIdFromUrl = (url) => {
    try {
        const parts = url.split("/upload/");
        const afterUpload = parts[1];
        const withoutVersion = afterUpload.replace(/^v\d+\//, "");
        return withoutVersion.replace(/\.[^/.]+$/, "");
    } catch {
        return null;
    }
};

const deleteImageFromCloudinary = async (imageUrl) => {
    if (!imageUrl) return;
    const publicId = getPublicIdFromUrl(imageUrl);
    if (publicId) await cloudinary.uploader.destroy(publicId);
};

// ─── ADD CATEGORY ─────────────────────────────────────────────

const addCategory = async (req, res) => {
    try {
        const { name } = req.body;

        // ✅ Validate name
        if (!name) {
            // ✅ Delete uploaded image if validation fails
            if (req.file) await deleteImageFromCloudinary(req.file.path);
            return res.status(400).json({
                success: false,
                message: "Category name is required",
            });
        }

        // ✅ Check duplicate
        const existing = await Category.findOne({
            name: { $regex: `^${name}$`, $options: "i" },
        });
        if (existing) {
            // ✅ Delete uploaded image if category already exists
            if (req.file) await deleteImageFromCloudinary(req.file.path);
            return res.status(400).json({
                success: false,
                message: "Category already exists",
            });
        }

        const image = req.file ? req.file.path : "";

        const category = new Category({ name, image });
        await category.save();

        // ✅ Invalidate category list cache and product caches
        await deleteCache('categories:all');
        await deleteCachePattern('products:*');

        return res.status(201).json({
            success: true,
            data: category,
            message: "Category created successfully",
        });

    } catch (error) {
        // ✅ Delete uploaded image if save fails
        if (req.file) await deleteImageFromCloudinary(req.file.path);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ─── GET ALL CATEGORIES ───────────────────────────────────────

const getAllCategories = async (req, res) => {
    try {
        const cacheKey = 'categories:all';
        const cachedCategories = await getCache(cacheKey);

        if (cachedCategories) {
            return res.status(200).json({
                success: true,
                data: cachedCategories,
                message: "Categories fetched successfully (cached)",
            });
        }

        const categories = await Category.find({ isActive: true }).sort({ name: 1 });

        const responseData = {
            total: categories.length,
            categories,
        };

        // Cache for 2 hours (7200 seconds)
        await setCache(cacheKey, responseData, 7200);

        return res.status(200).json({
            success: true,
            data: responseData,
            message: "Categories fetched successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ─── GET CATEGORY BY ID ───────────────────────────────────────

const getCategoryById = async (req, res) => {
    try {
        // ✅ Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID",
            });
        }

        const category = await Category.findById(req.params.id);

        if (!category || !category.isActive) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: category,
            message: "Category fetched successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ─── UPDATE CATEGORY ──────────────────────────────────────────

const updateCategory = async (req, res) => {
    try {
        // ✅ Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            if (req.file) await deleteImageFromCloudinary(req.file.path);
            return res.status(400).json({
                success: false,
                message: "Invalid category ID",
            });
        }

        const category = await Category.findById(req.params.id);
        if (!category) {
            // ✅ Delete new uploaded image if category not found
            if (req.file) await deleteImageFromCloudinary(req.file.path);
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        // ✅ New image uploaded — delete old one from Cloudinary first
        if (req.file) {
            if (category.image) {
                await deleteImageFromCloudinary(category.image);
            }
            req.body.image = req.file.path;
        }

        const updated = await Category.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }  // ✅ fixed: returnNewDocument → new: true
        );

        // ✅ Invalidate category list cache and product caches
        await deleteCache('categories:all');
        await deleteCachePattern('products:*');

        return res.status(200).json({
            success: true,
            data: updated,
            message: "Category updated successfully",
        });

    } catch (error) {
        // ✅ Delete new uploaded image if update fails
        if (req.file) await deleteImageFromCloudinary(req.file.path);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ─── DELETE CATEGORY ──────────────────────────────────────────

const deleteCategory = async (req, res) => {
    try {
        // ✅ Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID",
            });
        }

        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        // ✅ Delete category image from Cloudinary
        if (category.image) {
            await deleteImageFromCloudinary(category.image);
        }

        // ✅ Find all subcategories and delete their images from Cloudinary
        const subcategories = await Subcategory.find({ category: req.params.id });

        await Promise.all(
            subcategories.map(async (sub) => {
                if (sub.image) {
                    await deleteImageFromCloudinary(sub.image);
                }
            })
        );

        // ✅ Hard delete all subcategories from MongoDB
        await Subcategory.deleteMany({ category: req.params.id });

        // ✅ Hard delete category from MongoDB
        await Category.findByIdAndDelete(req.params.id);

        // ✅ Invalidate category list cache and product caches
        await deleteCache('categories:all');
        await deleteCachePattern('products:*');

        return res.status(200).json({
            success: true,
            message: "Category and its subcategories deleted successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export {
    addCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
};