import mongoose from "mongoose";
import { Category } from "../models/Category.js";
import { Subcategory } from "../models/Subcategory.js";
import { v2 as cloudinary } from "cloudinary";

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

// ✅ Single image delete helper
const deleteImageFromCloudinary = async (imageUrl) => {
    if (!imageUrl) return;
    const publicId = getPublicIdFromUrl(imageUrl);
    if (publicId) await cloudinary.uploader.destroy(publicId);
};

// ─── ADD SUBCATEGORY ──────────────────────────────────────────

const addSubcategory = async (req, res) => {
    try {
        const { name, categoryId } = req.body;  // ✅ categoryId — MongoDB ObjectId
        const image = req.file ? req.file.path : "";

        // ✅ Validate required fields
        if (!name || !categoryId) {
            if (req.file) await deleteImageFromCloudinary(req.file.path);
            return res.status(400).json({
                success: false,
                message: !name ? "Subcategory name is required" : "Category ID is required",
            });
        }

        // ✅ Validate categoryId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            if (req.file) await deleteImageFromCloudinary(req.file.path);
            return res.status(400).json({
                success: false,
                message: "Invalid category ID",
            });
        }

        // ✅ Find category by ObjectId
        const parentCategory = await Category.findById(categoryId);
        if (!parentCategory || !parentCategory.isActive) {
            if (req.file) await deleteImageFromCloudinary(req.file.path);
            return res.status(404).json({
                success: false,
                message: "Category not found or inactive",
            });
        }

        // ✅ Check duplicate under same category
        const existing = await Subcategory.findOne({
            name: { $regex: `^${name.trim()}$`, $options: "i" },
            category: parentCategory._id,
        });
        if (existing) {
            if (req.file) await deleteImageFromCloudinary(req.file.path);
            return res.status(400).json({
                success: false,
                message: "Subcategory already exists under this category",
            });
        }

        const subcategory = new Subcategory({
            name: name.trim(),
            category: parentCategory._id,
            image,
        });

        await subcategory.save();

        await subcategory.populate("category", "name slug");

        return res.status(201).json({
            success: true,
            data: subcategory,
            message: "Subcategory created successfully",
        });

    } catch (error) {
        if (req.file) await deleteImageFromCloudinary(req.file.path);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ─── GET ALL SUBCATEGORIES ────────────────────────────────────

const getAllSubcategories = async (req, res) => {
    try {
        const filter = { isActive: true };

        // ✅ Filter by category ObjectId if provided
        if (req.query.categoryId) {
            if (!mongoose.Types.ObjectId.isValid(req.query.categoryId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid category ID",
                });
            }
            filter.category = req.query.categoryId;
        }

        const subcategories = await Subcategory.find(filter)
            .populate("category", "name slug")
            .sort({ name: 1 });

        return res.status(200).json({
            success: true,
            total: subcategories.length,
            data: subcategories,
            message: "Subcategories fetched successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ─── GET SUBCATEGORY BY ID ────────────────────────────────────

const getSubcategoryById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid subcategory ID",
            });
        }

        const subcategory = await Subcategory.findById(req.params.id)
            .populate("category", "name slug");

        if (!subcategory || !subcategory.isActive) {
            return res.status(404).json({
                success: false,
                message: "Subcategory not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: subcategory,
            message: "Subcategory fetched successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ─── GET SUBCATEGORIES BY CATEGORY ID ────────────────────────

const getSubcategoriesByCategory = async (req, res) => {
    try {
        const { id } = req.params;  // ✅ category ObjectId

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID",
            });
        }

        const parentCategory = await Category.findById(id);
        if (!parentCategory || !parentCategory.isActive) {
            return res.status(404).json({
                success: false,
                message: "Category not found or inactive",
            });
        }

        const subcategories = await Subcategory.find({
            category: id,
            isActive: true,
        }).sort({ name: 1 });

        return res.status(200).json({
            success: true,
            total: subcategories.length,
            data: subcategories,
            message: "Subcategories fetched successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ─── UPDATE SUBCATEGORY ───────────────────────────────────────

const updateSubcategory = async (req, res) => {
    try {
        // ✅ Validate subcategory ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            if (req.file) await deleteImageFromCloudinary(req.file.path);
            return res.status(400).json({
                success: false,
                message: "Invalid subcategory ID",
            });
        }

        const subcategory = await Subcategory.findById(req.params.id);
        if (!subcategory) {
            if (req.file) await deleteImageFromCloudinary(req.file.path);
            return res.status(404).json({
                success: false,
                message: "Subcategory not found",
            });
        }

        const allowedUpdates = {};

        // ✅ Update name if provided
        if (req.body.name && req.body.name.trim()) {
            allowedUpdates.name = req.body.name.trim();
        }

        // ✅ Update category using categoryId (ObjectId)
        if (req.body.categoryId) {
            if (!mongoose.Types.ObjectId.isValid(req.body.categoryId)) {
                if (req.file) await deleteImageFromCloudinary(req.file.path);
                return res.status(400).json({
                    success: false,
                    message: "Invalid category ID",
                });
            }

            const parentCategory = await Category.findById(req.body.categoryId);
            if (!parentCategory || !parentCategory.isActive) {
                if (req.file) await deleteImageFromCloudinary(req.file.path);
                return res.status(404).json({
                    success: false,
                    message: "Category not found or inactive",
                });
            }

            allowedUpdates.category = parentCategory._id;
        }

        // ✅ Handle image — save old image path to delete after DB update
        let oldImage = null;
        if (req.file) {
            oldImage = subcategory.image || null;
            allowedUpdates.image = req.file.path;
        }

        // ✅ Nothing to update
        if (Object.keys(allowedUpdates).length === 0) {
            if (req.file) await deleteImageFromCloudinary(req.file.path);
            return res.status(400).json({
                success: false,
                message: "Please provide at least one field to update",
            });
        }

        // ✅ Update DB first
        const updated = await Subcategory.findByIdAndUpdate(
            req.params.id,
            { $set: allowedUpdates },
            { new: true }
        ).populate("category", "name slug");

        // ✅ Delete old image ONLY after successful DB update
        if (req.file && oldImage) {
            await deleteImageFromCloudinary(oldImage);
        }

        return res.status(200).json({
            success: true,
            data: updated,
            message: "Subcategory updated successfully",
        });

    } catch (error) {
        if (req.file) await deleteImageFromCloudinary(req.file.path);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ─── DELETE SUBCATEGORY ───────────────────────────────────────

const deleteSubcategory = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid subcategory ID",
            });
        }

        const subcategory = await Subcategory.findById(req.params.id);
        if (!subcategory) {
            return res.status(404).json({
                success: false,
                message: "Subcategory not found",
            });
        }

        // ✅ Delete image from Cloudinary
        if (subcategory.image) {
            await deleteImageFromCloudinary(subcategory.image);
        }

        await Subcategory.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Subcategory deleted successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export {
    addSubcategory,
    getAllSubcategories,
    getSubcategoryById,
    getSubcategoriesByCategory,
    updateSubcategory,
    deleteSubcategory,
};