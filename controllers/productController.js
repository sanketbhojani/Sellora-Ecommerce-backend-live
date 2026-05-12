import mongoose from "mongoose";
import { Product } from "../models/Product.js";
import { Category } from "../models/Category.js";
import { Subcategory } from "../models/Subcategory.js";
import { v2 as cloudinary } from "cloudinary";
import { Seller } from "../models/Seller.js";

// ─── Cloudinary Helpers ───────────────────────────────────────

const getPublicIdFromUrl = (url) => {
    try {
        const parts = url.split("/upload/");
        const afterUpload = parts[1];
        const withoutVersion = afterUpload.replace(/^v\d+\//, "");
        return withoutVersion.replace(/\.[^/.]+$/, "");
    } catch (err) {
        console.error("Failed to extract public ID from:", url);
        return null;
    }
};

const deleteImagesFromCloudinary = async (images = []) => {
    if (images.length === 0) return;
    await Promise.all(
        images.map((imageUrl) => {
            const publicId = getPublicIdFromUrl(imageUrl);
            if (!publicId) return Promise.resolve();
            return cloudinary.uploader.destroy(publicId);
        })
    );
};

// ─── ADD PRODUCT ──────────────────────────────────────────────

const addProduct = async (req, res) => {
    try {
        const {
            name, description, price,
            originalPrice, categoryId,   // ✅ categoryId — ObjectId
            subcategoryId, stock, tags   // ✅ subcategoryId — ObjectId
        } = req.body;

        // ✅ Validate required fields
        if (!name || !description || !price || !categoryId || !subcategoryId || !stock) {
            if (req.files && req.files.length > 0) {
                await deleteImagesFromCloudinary(req.files.map((f) => f.path));
            }
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields",
            });
        }

        // ✅ Validate category ObjectId
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            if (req.files && req.files.length > 0) {
                await deleteImagesFromCloudinary(req.files.map((f) => f.path));
            }
            return res.status(400).json({
                success: false,
                message: "Invalid category ID",
            });
        }

        // ✅ Validate subcategory ObjectId
        if (!mongoose.Types.ObjectId.isValid(subcategoryId)) {
            if (req.files && req.files.length > 0) {
                await deleteImagesFromCloudinary(req.files.map((f) => f.path));
            }
            return res.status(400).json({
                success: false,
                message: "Invalid subcategory ID",
            });
        }

        // ✅ Find category by ObjectId
        const categoryDoc = await Category.findById(categoryId);
        if (!categoryDoc || !categoryDoc.isActive) {
            if (req.files && req.files.length > 0) {
                await deleteImagesFromCloudinary(req.files.map((f) => f.path));
            }
            return res.status(404).json({
                success: false,
                message: "Category not found or inactive",
            });
        }

        // ✅ Find subcategory by ObjectId and verify it belongs to the category
        const subcategoryDoc = await Subcategory.findById(subcategoryId);
        if (!subcategoryDoc || !subcategoryDoc.isActive) {
            if (req.files && req.files.length > 0) {
                await deleteImagesFromCloudinary(req.files.map((f) => f.path));
            }
            return res.status(404).json({
                success: false,
                message: "Subcategory not found or inactive",
            });
        }

        // ✅ Make sure subcategory belongs to the selected category
        if (subcategoryDoc.category.toString() !== categoryId) {
            if (req.files && req.files.length > 0) {
                await deleteImagesFromCloudinary(req.files.map((f) => f.path));
            }
            return res.status(400).json({
                success: false,
                message: "Subcategory does not belong to the selected category",
            });
        }

        // ✅ At least one image required
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please upload at least one product image",
            });
        }

        const images = req.files.map((file) => file.path);

        const product = new Product({
            name,
            description,
            price: Number(price),
            originalPrice: originalPrice ? Number(originalPrice) : Number(price),
            images,
            category: categoryDoc._id,
            subcategory: subcategoryDoc._id,
            stock: Number(stock),
            tags: tags ? tags.split(",").map((t) => t.trim().toLowerCase()) : [],
            seller: req.user._id,
        });

        await product.save();

        // ✅ Increment seller totalProducts
        await Seller.findByIdAndUpdate(req.user._id, {
            $inc: { totalProducts: 1 },
        });

        await product.populate([
            { path: "category", select: "name slug" },
            { path: "subcategory", select: "name slug" },
            { path: "seller", select: "name email" },
        ]);

        return res.status(201).json({
            success: true,
            data: product,
            message: "Product added successfully. It will be visible after admin approval.",
        });

    } catch (error) {
        if (req.files && req.files.length > 0) {
            await deleteImagesFromCloudinary(req.files.map((f) => f.path));
        }
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ─── GET ALL PRODUCTS ─────────────────────────────────────────

const getAllProducts = async (req, res) => {
    try {
        const {
            search,
            categoryId,       // ✅ categoryId — ObjectId
            subcategoryId,    // ✅ subcategoryId — ObjectId
            minPrice,
            maxPrice,
            page = 1,
            limit = 12,
            sort,             // Added sort for frontend compatibility
            sortBy = "createdAt",
            sortOrder = "desc",
        } = req.query;

        const filter = { isActive: true };

        // ✅ Text search
        if (search && search.trim()) {
            filter.$text = { $search: search.trim() };
        }

        // ✅ Filter by category ObjectId
        if (categoryId) {
            if (!mongoose.Types.ObjectId.isValid(categoryId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid category ID",
                });
            }
            filter.category = categoryId;
        }

        // ✅ Filter by subcategory ObjectId
        if (subcategoryId) {
            if (!mongoose.Types.ObjectId.isValid(subcategoryId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid subcategory ID",
                });
            }
            filter.subcategory = subcategoryId;
        }

        // ✅ Price range filter
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        // ✅ Prevent sort injection and handle frontend 'sort' parameter
        const allowedSortFields = ["createdAt", "price", "rating", "stock"];
        let mongooseSort = {};

        if (sort) {
            // Handle frontend style like "-price" or "price"
            const isDesc = sort.startsWith("-");
            const field = isDesc ? sort.substring(1) : sort;
            
            if (allowedSortFields.includes(field)) {
                mongooseSort[field] = isDesc ? -1 : 1;
            } else {
                mongooseSort["createdAt"] = -1;
            }
        } else {
            // Fallback to sortBy and sortOrder
            const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
            mongooseSort[safeSortBy] = sortOrder === "asc" ? 1 : -1;
        }

        const skip = (Number(page) - 1) * Number(limit);

        const [products, total] = await Promise.all([
            Product.find(filter)
                .sort(mongooseSort)
                .skip(skip)
                .limit(Number(limit))
                .populate("category", "name slug")
                .populate("subcategory", "name slug")
                .populate("seller", "name email"),
            Product.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            message: "Products fetched successfully",
            data: {
                products,
                total,
                page: Number(page),
                totalPages: Math.ceil(total / Number(limit)),
            },
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ─── GET PRODUCT BY ID ────────────────────────────────────────

const getProductById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

        const product = await Product.findById(req.params.id)
            .populate("category", "name slug")
            .populate("subcategory", "name slug")
            .populate("seller", "name email");

        if (!product || !product.isActive) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: product,
            message: "Product fetched successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ─── UPDATE PRODUCT ───────────────────────────────────────────

const updateProduct = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            if (req.files && req.files.length > 0) {
                await deleteImagesFromCloudinary(req.files.map((f) => f.path));
            }
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

        const product = await Product.findById(req.params.id);
        if (!product) {
            if (req.files && req.files.length > 0) {
                await deleteImagesFromCloudinary(req.files.map((f) => f.path));
            }
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        // ✅ Only seller or admin can update
        if (
            product.seller.toString() !== req.user._id.toString() &&
            req.user.role !== "admin"
        ) {
            if (req.files && req.files.length > 0) {
                await deleteImagesFromCloudinary(req.files.map((f) => f.path));
            }
            return res.status(403).json({
                success: false,
                message: "Not authorized to update this product",
            });
        }

        const allowedUpdates = {};
        const fields = ["name", "description", "price", "originalPrice", "stock", "tags"];
        fields.forEach((f) => {
            if (req.body[f] !== undefined) allowedUpdates[f] = req.body[f];
        });

        // ✅ Parse numbers
        if (allowedUpdates.price) allowedUpdates.price = Number(allowedUpdates.price);
        if (allowedUpdates.originalPrice) allowedUpdates.originalPrice = Number(allowedUpdates.originalPrice);
        if (allowedUpdates.stock) allowedUpdates.stock = Number(allowedUpdates.stock);

        // ✅ Parse tags
        if (allowedUpdates.tags && typeof allowedUpdates.tags === "string") {
            allowedUpdates.tags = allowedUpdates.tags.split(",").map((t) => t.trim().toLowerCase());
        }

        // ✅ Resolve categoryId to ObjectId
        if (req.body.categoryId) {
            if (!mongoose.Types.ObjectId.isValid(req.body.categoryId)) {
                if (req.files && req.files.length > 0) {
                    await deleteImagesFromCloudinary(req.files.map((f) => f.path));
                }
                return res.status(400).json({
                    success: false,
                    message: "Invalid category ID",
                });
            }

            const categoryDoc = await Category.findById(req.body.categoryId);
            if (!categoryDoc || !categoryDoc.isActive) {
                if (req.files && req.files.length > 0) {
                    await deleteImagesFromCloudinary(req.files.map((f) => f.path));
                }
                return res.status(404).json({
                    success: false,
                    message: "Category not found or inactive",
                });
            }

            allowedUpdates.category = categoryDoc._id;
        }

        // ✅ Resolve subcategoryId to ObjectId
        if (req.body.subcategoryId) {
            if (!mongoose.Types.ObjectId.isValid(req.body.subcategoryId)) {
                if (req.files && req.files.length > 0) {
                    await deleteImagesFromCloudinary(req.files.map((f) => f.path));
                }
                return res.status(400).json({
                    success: false,
                    message: "Invalid subcategory ID",
                });
            }

            const subcategoryDoc = await Subcategory.findById(req.body.subcategoryId);
            if (!subcategoryDoc || !subcategoryDoc.isActive) {
                if (req.files && req.files.length > 0) {
                    await deleteImagesFromCloudinary(req.files.map((f) => f.path));
                }
                return res.status(404).json({
                    success: false,
                    message: "Subcategory not found or inactive",
                });
            }

            // ✅ Verify subcategory belongs to category
            const categoryToCheck = allowedUpdates.category || product.category;
            if (subcategoryDoc.category.toString() !== categoryToCheck.toString()) {
                if (req.files && req.files.length > 0) {
                    await deleteImagesFromCloudinary(req.files.map((f) => f.path));
                }
                return res.status(400).json({
                    success: false,
                    message: "Subcategory does not belong to the selected category",
                });
            }

            allowedUpdates.subcategory = subcategoryDoc._id;
        }

        // ✅ Handle images — update DB first then delete old
        let oldImages = [];
        if (req.files && req.files.length > 0) {
            oldImages = [...product.images];
            allowedUpdates.images = req.files.map((f) => f.path);
        }

        // ✅ Reset approval if seller updates
        if (req.user.role === "seller") {
            allowedUpdates.isApproved = false;
            allowedUpdates.approvalStatus = "pending";
            allowedUpdates.approvedAt = null;
            allowedUpdates.approvedBy = null;
            allowedUpdates.rejectedReason = "";
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { $set: allowedUpdates },
            { new: true }
        )
            .populate("category", "name slug")
            .populate("subcategory", "name slug")
            .populate("seller", "name email");

        // ✅ Delete old images only after successful DB update
        if (oldImages.length > 0) {
            await deleteImagesFromCloudinary(oldImages);
        }

        return res.status(200).json({
            success: true,
            data: updatedProduct,
            message: req.user.role === "seller"
                ? "Product updated. Pending admin re-approval."
                : "Product updated successfully",
        });

    } catch (error) {
        if (req.files && req.files.length > 0) {
            await deleteImagesFromCloudinary(req.files.map((f) => f.path));
        }
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ─── DELETE PRODUCT ───────────────────────────────────────────

const deleteProduct = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        if (
            product.seller.toString() !== req.user._id.toString() &&
            req.user.role !== "admin"   // ✅ fixed: req.role → req.user.role
        ) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to delete this product",
            });
        }

        // ✅ Delete images from Cloudinary
        await deleteImagesFromCloudinary(product.images);

        await Product.findByIdAndDelete(req.params.id);

        // ✅ Decrement seller totalProducts
        await Seller.findByIdAndUpdate(product.seller, {
            $inc: { totalProducts: -1 },
        });

        return res.status(200).json({
            success: true,
            message: "Product deleted successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ─── GET MY PRODUCTS (Seller) ─────────────────────────────────

const getMyProducts = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 12,
            sortBy = "createdAt",
            sortOrder = "desc",
            approvalStatus,
        } = req.query;

        const filter = { seller: req.user._id };
        if (approvalStatus) filter.approvalStatus = approvalStatus;

        const skip = (Number(page) - 1) * Number(limit);
        const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

        const [products, total] = await Promise.all([
            Product.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(Number(limit))
                .populate("category", "name slug")
                .populate("subcategory", "name slug"),
            Product.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            data: {
                products,
                total,
                page: Number(page),
                totalPages: Math.ceil(total / Number(limit)),
            },
            message: "Your products fetched successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export {
    addProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getMyProducts,
};