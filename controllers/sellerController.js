import mongoose from "mongoose";
import { Seller } from "../models/Seller.js";
import { Product } from "../models/Product.js";
import { Order } from "../models/Order.js";
import { Review } from "../models/Review.js";
import { Payment } from "../models/Payment.js";
import { Return } from "../models/Return.js";
import { v2 as cloudinary } from "cloudinary";

// ─── Cloudinary Helper ────────────────────────────────────────

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

// ─── GET SELLER PROFILE ───────────────────────────────────────

const getSellerProfile = async (req, res) => {
    try {
        const seller = await Seller.findById(req.user._id)
            .select("-password -otp -otpExpiry");

        if (!seller) {
            return res.status(404).json({
                success: false,
                message: "Seller not found",
            });
        }

        // ✅ Real time stats
        const sellerId = new mongoose.Types.ObjectId(req.user._id);

        const [totalProducts, salesData] = await Promise.all([
            Product.countDocuments({
                seller: sellerId,
                isActive: true,
            }),
            Order.aggregate([
                { $match: { "orderItems.seller": sellerId, paymentStatus: "paid" } },
                { $unwind: "$orderItems" },
                { $match: { "orderItems.seller": sellerId } },
                {
                    $group: {
                        _id: null,
                        totalSales: {
                            $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] },
                        },
                        totalOrders: { $sum: 1 },
                    },
                },
            ]),
        ]);

        return res.status(200).json({
            success: true,
            data: {
                ...seller.toObject(),
                totalProducts,
                totalSales: salesData[0]?.totalSales || 0,
                totalOrders: salesData[0]?.totalOrders || 0,
            },
            message: "Seller profile fetched successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ─── UPDATE SELLER PROFILE ────────────────────────────────────

const updateSellerProfile = async (req, res) => {
    try {
        const { name, phone, shopName, shopDescription } = req.body;

        const seller = await Seller.findById(req.user._id);
        if (!seller) {
            return res.status(404).json({
                success: false,
                message: "Seller not found",
            });
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (phone) updateData.phone = phone;
        if (shopName) updateData.shopName = shopName;
        if (shopDescription !== undefined) updateData.shopDescription = shopDescription;

        if (req.file) {
            if (seller.avatar) {
                const publicId = getPublicIdFromUrl(seller.avatar);
                if (publicId) await cloudinary.uploader.destroy(publicId);
            }
            updateData.avatar = req.file.path;
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please provide at least one field to update",
            });
        }

        const updatedSeller = await Seller.findByIdAndUpdate(
            req.user._id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select("-password -otp -otpExpiry");

        return res.status(200).json({
            success: true,
            data: updatedSeller,
            message: "Profile updated successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ─── DELETE AVATAR ────────────────────────────────────────────

const deleteSellerAvatar = async (req, res) => {
    try {
        const seller = await Seller.findById(req.user._id);
        if (!seller) {
            return res.status(404).json({
                success: false,
                message: "Seller not found",
            });
        }

        if (!seller.avatar) {
            return res.status(400).json({
                success: false,
                message: "No avatar to delete",
            });
        }

        const publicId = getPublicIdFromUrl(seller.avatar);
        if (publicId) await cloudinary.uploader.destroy(publicId);

        await Seller.findByIdAndUpdate(
            req.user._id,
            { $set: { avatar: "" } },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Avatar deleted successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ─── GET SELLER DASHBOARD ─────────────────────────────────────

const getSellerDashboard = async (req, res) => {
    try {
        const sellerId = new mongoose.Types.ObjectId(req.user._id);

        const [
            totalProducts,
            activeProducts,
            pendingProducts,
            rejectedProducts,
            totalOrders,
            placedOrders,
            confirmedOrders,
            processingOrders,
            shippedOrders,
            deliveredOrders,
            cancelledOrders,
            revenueData,
            pendingPayments,
            paidPayments,
            returnRequests,
        ] = await Promise.all([
            Product.countDocuments({ seller: sellerId }),
            Product.countDocuments({ seller: sellerId, isActive: true, approvalStatus: "approved" }),
            Product.countDocuments({ seller: sellerId, approvalStatus: "pending" }),
            Product.countDocuments({ seller: sellerId, approvalStatus: "rejected" }),
            Order.countDocuments({ "orderItems.seller": sellerId }),
            Order.countDocuments({ "orderItems.seller": sellerId, orderStatus: "placed" }),
            Order.countDocuments({ "orderItems.seller": sellerId, orderStatus: "confirmed" }),
            Order.countDocuments({ "orderItems.seller": sellerId, orderStatus: "processing" }),
            Order.countDocuments({ "orderItems.seller": sellerId, orderStatus: "shipped" }),
            Order.countDocuments({ "orderItems.seller": sellerId, orderStatus: "delivered" }),
            Order.countDocuments({ "orderItems.seller": sellerId, orderStatus: "cancelled" }),
            Order.aggregate([
                { $match: { "orderItems.seller": sellerId, paymentStatus: "paid" } },
                { $unwind: "$orderItems" },
                { $match: { "orderItems.seller": sellerId } },
                {
                    $group: {
                        _id: null,
                        totalRevenue: {
                            $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] },
                        },
                        totalItemsSold: { $sum: "$orderItems.quantity" },
                    },
                },
            ]),
            // ✅ Pending payments for seller orders
            Order.countDocuments({
                "orderItems.seller": sellerId,
                paymentStatus: "pending",
            }),
            // ✅ Paid payments count
            Order.countDocuments({
                "orderItems.seller": sellerId,
                paymentStatus: "paid",
            }),
            // ✅ Return requests for seller products
            Return.countDocuments({
                seller: sellerId,
                status: "requested",
            }),
        ]);

        // ✅ Recent 5 orders
        const recentOrders = await Order.find({ "orderItems.seller": sellerId })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("customer", "name email")
            .populate("orderItems.product", "name images price");

        // ✅ Top 5 selling products
        const topProducts = await Order.aggregate([
            { $match: { "orderItems.seller": sellerId } },
            { $unwind: "$orderItems" },
            { $match: { "orderItems.seller": sellerId } },
            {
                $group: {
                    _id: "$orderItems.product",
                    totalSold: { $sum: "$orderItems.quantity" },
                    totalRevenue: {
                        $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] },
                    },
                },
            },
            { $sort: { totalSold: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "product",
                },
            },
            { $unwind: "$product" },
            {
                $project: {
                    "product.name": 1,
                    "product.images": 1,
                    "product.price": 1,
                    "product.stock": 1,
                    totalSold: 1,
                    totalRevenue: 1,
                },
            },
        ]);

        return res.status(200).json({
            success: true,
            data: {
                products: {
                    total: totalProducts,
                    active: activeProducts,
                    pending: pendingProducts,
                    rejected: rejectedProducts,
                },
                orders: {
                    total: totalOrders,
                    placed: placedOrders,
                    confirmed: confirmedOrders,
                    processing: processingOrders,
                    shipped: shippedOrders,
                    delivered: deliveredOrders,
                    cancelled: cancelledOrders,
                },
                payments: {
                    pending: pendingPayments,   // ✅ pending payments
                    paid: paidPayments,          // ✅ paid payments
                },
                returns: {
                    pending: returnRequests,     // ✅ pending return requests
                },
                totalRevenue: revenueData[0]?.totalRevenue || 0,
                totalItemsSold: revenueData[0]?.totalItemsSold || 0,
                recentOrders,
                topProducts,
            },
            message: "Seller dashboard fetched successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ─── GET SELLER ORDERS ────────────────────────────────────────

const getSellerOrders = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            orderStatus,
            paymentStatus,
        } = req.query;

        const filter = { "orderItems.seller": req.user._id };
        if (orderStatus) filter.orderStatus = orderStatus;
        if (paymentStatus) filter.paymentStatus = paymentStatus;

        const skip = (Number(page) - 1) * Number(limit);

        const [orders, total] = await Promise.all([
            Order.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .populate("customer", "name email phone")
                .populate("orderItems.product", "name images price"),
            Order.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            data: {
                orders,
                total,
                page: Number(page),
                totalPages: Math.ceil(total / Number(limit)),
            },
            message: "Seller orders fetched successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ─── GET SELLER ORDER BY ID ───────────────────────────────────

const getSellerOrderById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID",
            });
        }

        const order = await Order.findOne({
            _id: req.params.id,
            "orderItems.seller": req.user._id,
        })
            .populate("customer", "name email phone")
            .populate("orderItems.product", "name images price category subcategory");

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: order,
            message: "Order fetched successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ─── UPDATE ORDER STATUS (Seller) ────────────────────────────

const updateOrderStatus = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID",
            });
        }

        const { orderStatus, trackingId } = req.body;
        const allowedStatuses = ["confirmed", "processing", "shipped"];

        if (!orderStatus) {
            return res.status(400).json({
                success: false,
                message: "Order status is required",
            });
        }

        if (!allowedStatuses.includes(orderStatus)) {
            return res.status(400).json({
                success: false,
                message: `Seller can only update status to: ${allowedStatuses.join(", ")}`,
            });
        }

        // ✅ trackingId required when shipping
        if (orderStatus === "shipped" && !trackingId) {
            return res.status(400).json({
                success: false,
                message: "Tracking ID is required when shipping an order",
            });
        }

        const order = await Order.findOne({
            _id: req.params.id,
            "orderItems.seller": req.user._id,
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        if (["cancelled", "delivered"].includes(order.orderStatus)) {
            return res.status(400).json({
                success: false,
                message: `Cannot update order that is already ${order.orderStatus}`,
            });
        }

        order.orderStatus = orderStatus;
        if (orderStatus === "shipped") order.trackingId = trackingId;
        await order.save();

        return res.status(200).json({
            success: true,
            data: order,
            message: "Order status updated successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ─── GET SELLER PRODUCTS ──────────────────────────────────────

const getSellerProducts = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 12,
            approvalStatus,
            sortBy = "createdAt",
            sortOrder = "desc",
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
            message: "Seller products fetched successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ─── GET SELLER PAYMENTS ──────────────────────────────────────

const getSellerPayments = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
        } = req.query;

        const sellerId = req.user._id;

        // ✅ Get all orders for this seller
        const sellerOrders = await Order.find(
            { "orderItems.seller": sellerId },
            { _id: 1 }
        );

        const orderIds = sellerOrders.map((o) => o._id);

        if (orderIds.length === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    payments: [],
                    total: 0,
                    stats: {
                        totalRevenue: 0,
                        pendingAmount: 0,
                        paidAmount: 0,
                        refundedAmount: 0,
                    },
                },
                message: "No payments found",
            });
        }

        const filter = { order: { $in: orderIds } };
        if (status) filter.status = status;

        const skip = (Number(page) - 1) * Number(limit);

        const [payments, total] = await Promise.all([
            Payment.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .populate("order", "totalPrice orderStatus orderItems")
                .populate("customer", "name email"),
            Payment.countDocuments(filter),
        ]);

        // ✅ Payment stats for this seller
        const stats = await Payment.aggregate([
            { $match: { order: { $in: orderIds } } },
            {
                $group: {
                    _id: "$status",
                    totalAmount: { $sum: "$amount" },
                    count: { $sum: 1 },
                },
            },
        ]);

        // ✅ Build stats object
        const paymentStats = {
            totalRevenue: 0,
            pendingAmount: 0,
            paidAmount: 0,
            refundedAmount: 0,
        };

        stats.forEach((s) => {
            if (s._id === "paid") paymentStats.paidAmount = s.totalAmount;
            if (s._id === "pending") paymentStats.pendingAmount = s.totalAmount;
            if (s._id === "refunded") paymentStats.refundedAmount = s.totalAmount;
        });

        paymentStats.totalRevenue = paymentStats.paidAmount - paymentStats.refundedAmount;

        return res.status(200).json({
            success: true,
            data: {
                payments,
                total,
                page: Number(page),
                totalPages: Math.ceil(total / Number(limit)),
                stats: paymentStats,
            },
            message: "Seller payments fetched successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ─── GET SELLER RETURNS ───────────────────────────────────────

const getSellerReturns = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
        } = req.query;

        const filter = { seller: req.user._id };
        if (status) filter.status = status;

        const skip = (Number(page) - 1) * Number(limit);

        const [returns, total] = await Promise.all([
            Return.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .populate("customer", "name email phone")
                .populate("product", "name images price")
                .populate("order", "totalPrice orderStatus"),
            Return.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            data: {
                returns,
                total,
                page: Number(page),
                totalPages: Math.ceil(total / Number(limit)),
            },
            message: "Seller return requests fetched successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ─── GET SELLER REVIEWS ───────────────────────────────────────

const getSellerReviews = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const sellerProducts = await Product.find(
            { seller: req.user._id },
            { _id: 1 }
        );

        const productIds = sellerProducts.map((p) => p._id);

        if (productIds.length === 0) {
            return res.status(200).json({
                success: true,
                data: { reviews: [], total: 0, avgRating: 0 },
                message: "No reviews found",
            });
        }

        const skip = (Number(page) - 1) * Number(limit);

        const [reviews, total, ratingData] = await Promise.all([
            Review.find({ product: { $in: productIds } })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .populate("customer", "name avatar")
                .populate("product", "name images"),
            Review.countDocuments({ product: { $in: productIds } }),
            Review.aggregate([
                { $match: { product: { $in: productIds } } },
                {
                    $group: {
                        _id: null,
                        avgRating: { $avg: "$rating" },
                        totalReviews: { $sum: 1 },
                    },
                },
            ]),
        ]);

        return res.status(200).json({
            success: true,
            data: {
                reviews,
                total,
                page: Number(page),
                totalPages: Math.ceil(total / Number(limit)),
                avgRating: ratingData[0]?.avgRating
                    ? parseFloat(ratingData[0].avgRating.toFixed(1))
                    : 0,
                totalReviews: ratingData[0]?.totalReviews || 0,
            },
            message: "Seller reviews fetched successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ─── GET PUBLIC SELLER PROFILE ────────────────────────────────

const getPublicSellerProfile = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid seller ID",
            });
        }

        const seller = await Seller.findOne({
            _id: req.params.id,
            isActive: true,
            isApproved: true,
        }).select("name shopName shopDescription avatar createdAt");

        if (!seller) {
            return res.status(404).json({
                success: false,
                message: "Seller not found",
            });
        }

        const sellerId = new mongoose.Types.ObjectId(req.params.id);

        const [totalProducts, salesData, sellerProductIds] = await Promise.all([
            Product.countDocuments({
                seller: sellerId,
                approvalStatus: "approved",
                isActive: true,
            }),
            Order.aggregate([
                { $match: { "orderItems.seller": sellerId, paymentStatus: "paid" } },
                { $unwind: "$orderItems" },
                { $match: { "orderItems.seller": sellerId } },
                {
                    $group: {
                        _id: null,
                        totalSales: {
                            $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] },
                        },
                    },
                },
            ]),
            Product.find({ seller: sellerId }, { _id: 1 }),
        ]);

        const productIds = sellerProductIds.map((p) => p._id);

        const ratingData = await Review.aggregate([
            { $match: { product: { $in: productIds } } },
            {
                $group: {
                    _id: null,
                    avgRating: { $avg: "$rating" },
                    totalReviews: { $sum: 1 },
                },
            },
        ]);

        return res.status(200).json({
            success: true,
            data: {
                seller,
                totalProducts,
                totalSales: salesData[0]?.totalSales || 0,
                avgRating: ratingData[0]?.avgRating
                    ? parseFloat(ratingData[0].avgRating.toFixed(1))
                    : 0,
                totalReviews: ratingData[0]?.totalReviews || 0,
            },
            message: "Seller profile fetched successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ─── GET PUBLIC SELLER PRODUCTS ───────────────────────────────

const getPublicSellerProducts = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid seller ID",
            });
        }

        // ✅ Check seller exists
        const seller = await Seller.findOne({
            _id: req.params.id,
            isActive: true,
        });

        if (!seller) {
            return res.status(404).json({
                success: false,
                message: "Seller not found",
            });
        }

        const { page = 1, limit = 12 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        // ✅ Relaxed filter — only check seller and isActive
        // approvalStatus removed to show all active products
        const filter = {
            seller: new mongoose.Types.ObjectId(req.params.id),
            isActive: true,
        };

        // ✅ Debug — log what products exist for this seller
        const allProducts = await Product.find({ seller: req.params.id });
        // console.log("Total products for seller:", allProducts.length);
        // console.log("Products:", allProducts.map(p => ({
        //     name: p.name,
        //     isActive: p.isActive,
        //     approvalStatus: p.approvalStatus,
        // })));

        const [products, total] = await Promise.all([
            Product.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .populate("category", "name slug")
                .populate("subcategory", "name slug")
                .populate("seller", "name shopName avatar"),
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
            message: "Seller products fetched successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export {
    getSellerProfile,
    updateSellerProfile,
    deleteSellerAvatar,
    getSellerDashboard,
    getSellerOrders,
    getSellerOrderById,
    updateOrderStatus,
    getSellerProducts,
    getSellerPayments,
    getSellerReturns,
    getSellerReviews,
    getPublicSellerProfile,
    getPublicSellerProducts,
};