import mongoose from "mongoose";
import { Review } from "../models/Review.js";
import { Product } from "../models/Product.js";
import { Order } from "../models/Order.js";
import { v2 as cloudinary } from "cloudinary";


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

const deleteImagesFromCloudinary = async (images = []) => {
    if (images.length === 0) return;
    await Promise.all(
        images.map((url) => {
            const publicId = getPublicIdFromUrl(url);
            if (!publicId) return Promise.resolve();
            return cloudinary.uploader.destroy(publicId);
        })
    );
};

// ─── Helper — update product rating ──────────────────────────

const updateProductRating = async (productId) => {
    const result = await Review.aggregate([
        { $match: { product: new mongoose.Types.ObjectId(productId) } },
        {
            $group: {
                _id: null,
                avgRating: { $avg: "$rating" },
                numReviews: { $sum: 1 },
            },
        },
    ]);

    const avgRating = result[0]?.avgRating || 0;
    const numReviews = result[0]?.numReviews || 0;

    await Product.findByIdAndUpdate(productId, {
        rating: parseFloat(avgRating.toFixed(1)),
        numReviews,
    });
};


const addReview  = async(req , res)=>{
    try {
        const { productId, orderId, rating, comment } = req.body;

        if (!productId || !orderId || !rating) {
            return res.status(400).json({
                success: false,
                message: "Product ID, order ID and rating are required",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(productId) ||
            !mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product or order ID",
            });
        }

        // ✅ Check product exists
        const product = await Product.findById(productId);
        if (!product || !product.isActive) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        // ✅ Check customer actually ordered this product
        const order = await Order.findOne({
            _id: orderId,
            customer: req.user._id,
            "orderItems.product": productId,
            orderStatus: "delivered",  // ✅ only after delivery
        });

        if (!order) {
            return res.status(403).json({
                success: false,
                message: "You can only review products from delivered orders",
            });
        }

        // ✅ Check already reviewed
        const alreadyReviewed = await Review.findOne({
            product: productId,
            customer: req.user._id,
        });

        if (alreadyReviewed) {
            return res.status(400).json({
                success: false,
                message: "You have already reviewed this product",
            });
        }

         // ✅ Handle review images
        const images = req.files && req.files.length > 0
            ? req.files.map((f) => f.path)
            : [];

        const review = new Review({
            product: productId,
            customer: req.user._id,
            order: orderId,
            rating: Number(rating),
            comment: comment || "",
            images,
            isVerified: true,
        });

        await review.save();

        // ✅ Update product average rating
        await updateProductRating(productId);

        await review.populate("customer", "name avatar");

        return res.status(201).json({
            success: true,
            data: review,
            message: "Review added successfully",
        });
    } catch (error) {
        if (req.files && req.files.length > 0) {
            await deleteImagesFromCloudinary(req.files.map((f) => f.path));
        }
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

const getProductReviews  = async(req,res)=>{
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

        const {
            page = 1,
            limit = 10,
            rating,
        } = req.query;

        const filter = { product: productId };
        if (rating) filter.rating = Number(rating);

        const skip = (Number(page) - 1) * Number(limit);

        const [reviews, total] = await Promise.all([
            Review.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .populate("customer", "name avatar"),
            Review.countDocuments(filter),
        ]);

        // ✅ Rating breakdown
        const ratingBreakdown = await Review.aggregate([
            { $match: { product: new mongoose.Types.ObjectId(productId) } },
            { $group: { _id: "$rating", count: { $sum: 1 } } },
            { $sort: { _id: -1 } },
        ]);

        return res.status(200).json({
            success: true,
            data: {
                reviews,
                total,
                page: Number(page),
                totalPages: Math.ceil(total / Number(limit)),
                ratingBreakdown,
            },
            message: "Reviews fetched successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}


const getMyReviews  = async(req,res)=>{
    try {
        const reviews = await Review.find({ customer: req.user._id })
            .sort({ createdAt: -1 })
            .populate("product", "name images price");

        return res.status(200).json({
            success: true,
            total: reviews.length,
            data: reviews,
            message: "Your reviews fetched successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

const updateReview  = async(req,res)=>{
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid review ID",
            });
        }

        const review = await Review.findOne({
            _id: req.params.id,
            customer: req.user._id,
        });

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found",
            });
        }

        const { rating, comment } = req.body;

        if (rating) review.rating = Number(rating);
        if (comment !== undefined) review.comment = comment;

        // ✅ New images uploaded — delete old ones
        if (req.files && req.files.length > 0) {
            await deleteImagesFromCloudinary(review.images);
            review.images = req.files.map((f) => f.path);
        }

        await review.save();
        // ✅ Recalculate product rating
        await updateProductRating(review.product);

        await review.populate("customer", "name avatar");

        return res.status(200).json({
            success: true,
            data: review,
            message: "Review updated successfully",
        });


    } catch (error) {
        if (req.files && req.files.length > 0) {
            await deleteImagesFromCloudinary(req.files.map((f) => f.path));
        }
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

const deleteReview  = async(req,res)=>{
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid review ID",
            });
        }

        const review = await Review.findOne({
            _id: req.params.id,
            customer: req.user._id,
        });

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found",
            });
        }

        // ✅ Delete review images from Cloudinary
        await deleteImagesFromCloudinary(review.images);

        const productId = review.product;
        await Review.findByIdAndDelete(req.params.id);

        // ✅ Recalculate product rating
        await updateProductRating(productId);

        return res.status(200).json({
            success: true,
            message: "Review deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

const deleteReviewByAdmin  = async(req,res)=>{
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid review ID",
            });
        }

        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found",
            });
        }

        await deleteImagesFromCloudinary(review.images);

        const productId = review.product;
        await Review.findByIdAndDelete(req.params.id);

        await updateProductRating(productId);

        return res.status(200).json({
            success: true,
            message: "Review deleted by admin successfully",
        });
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}
export{
    addReview,getProductReviews,getMyReviews,updateReview,deleteReview,deleteReviewByAdmin
}