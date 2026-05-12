import mongoose from "mongoose";
import { Customer } from "../models/Customer.js";
import { Seller } from "../models/Seller.js";
import { Product } from "../models/Product.js";
import { Order } from "../models/Order.js";
import { Review } from "../models/Review.js";

// ─── DASHBOARD STATS ──────────────────────────────────────────

const getDashboardStats = async (req, res) => {
    try {
        const [
            totalCustomers,
            totalSellers,
            approvedSellers,
            pendingSellers,
            totalProducts,
            activeProducts,
            pendingProducts,
            totalOrders,
            placedOrders,
            confirmedOrders,
            processingOrders,
            shippedOrders,
            deliveredOrders,
            cancelledOrders,
            revenueData,
        ] = await Promise.all([
            Customer.countDocuments(),
            Seller.countDocuments(),
            Seller.countDocuments({ isApproved: true }),
            Seller.countDocuments({ isApproved: false, isVerified: true }),
            Product.countDocuments(),
            Product.countDocuments({ isActive: true, approvalStatus: "approved" }),
            Product.countDocuments({ approvalStatus: "pending" }),
            Order.countDocuments(),
            Order.countDocuments({ orderStatus: "placed" }),
            Order.countDocuments({ orderStatus: "confirmed" }),
            Order.countDocuments({ orderStatus: "processing" }),
            Order.countDocuments({ orderStatus: "shipped" }),
            Order.countDocuments({ orderStatus: "delivered" }),
            Order.countDocuments({ orderStatus: "cancelled" }),
            Order.aggregate([
                { $match: { paymentStatus: "paid" } },
                { $group: { _id: null, total: { $sum: "$totalPrice" } } },
            ]),
        ]);

        return res.status(200).json({
            success: true,
            data: {
                users: {
                    totalCustomers,
                    totalSellers,
                    approvedSellers,
                    pendingSellers,
                },
                products: {
                    total: totalProducts,
                    active: activeProducts,
                    pending: pendingProducts,
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
                totalRevenue: revenueData[0]?.total || 0,
            },
            message: "Dashboard stats fetched successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ─── GET ALL CUSTOMERS ────────────────────────────────────────

const getAllCustomers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, isActive } = req.query;

        const filter = {};

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }

        if (isActive !== undefined) {
            filter.isActive = isActive === "true";
        }

        const skip = (Number(page) - 1) * Number(limit);

        const [customers, total] = await Promise.all([
            Customer.find(filter)
                .select("-password -otp -otpExpiry")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            Customer.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            data: {
                customers,
                total,
                page: Number(page),
                totalPages: Math.ceil(total / Number(limit)),
            },
            message: "Customers fetched successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ─── GET ALL SELLERS ──────────────────────────────────────────

const getAllSellers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, isApproved, isActive } = req.query;

        const filter = {};

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { shopName: { $regex: search, $options: "i" } },
            ];
        }

        if (isApproved !== undefined) filter.isApproved = isApproved === "true";
        if (isActive !== undefined) filter.isActive = isActive === "true";

        const skip = (Number(page) - 1) * Number(limit);

        const [sellers, total] = await Promise.all([
            Seller.find(filter)
                .select("-password -otp -otpExpiry")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            Seller.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            data: {
                sellers,
                total,
                page: Number(page),
                totalPages: Math.ceil(total / Number(limit)),
            },
            message: "Sellers fetched successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ─── GET SELLER BY ID ─────────────────────────────────────────

const getSellerById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid seller ID",
            });
        }

        const seller = await Seller.findById(req.params.id)
            .select("-password -otp -otpExpiry");

        if (!seller) {
            return res.status(404).json({
                success: false,
                message: "Seller not found",
            });
        }

        // ✅ Real time counts
        const [productCount, orderCount, totalRevenueData] = await Promise.all([
            Product.countDocuments({ seller: req.params.id }),
            Order.countDocuments({ "orderItems.seller": req.params.id }),
            Order.aggregate([
                {
                    $match: {
                        "orderItems.seller": new mongoose.Types.ObjectId(req.params.id),
                        paymentStatus: "paid",
                    },
                },
                { $unwind: "$orderItems" },
                {
                    $match: {
                        "orderItems.seller": new mongoose.Types.ObjectId(req.params.id),
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalRevenue: {
                            $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] },
                        },
                    },
                },
            ]),
        ]);

        return res.status(200).json({
            success: true,
            data: {
                seller,
                productCount,
                orderCount,
                totalRevenue: totalRevenueData[0]?.totalRevenue || 0,
            },
            message: "Seller fetched successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ─── APPROVE SELLER ───────────────────────────────────────────

const approveSeller = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid seller ID",
            });
        }

        const seller = await Seller.findById(req.params.id);
        if (!seller) {
            return res.status(404).json({
                success: false,
                message: "Seller not found",
            });
        }

        if (seller.isApproved) {
            return res.status(400).json({
                success: false,
                message: "Seller is already approved",
            });
        }

        seller.isApproved = true;
        await seller.save();

        return res.status(200).json({
            success: true,
            data: {
                sellerId: seller._id,
                name: seller.name,
                isApproved: seller.isApproved,
            },
            message: `Seller "${seller.name}" approved successfully`,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ─── REJECT SELLER ────────────────────────────────────────────

const rejectSeller = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid seller ID",
            });
        }

        const seller = await Seller.findById(req.params.id);
        if (!seller) {
            return res.status(404).json({
                success: false,
                message: "Seller not found",
            });
        }

        if (!seller.isApproved) {
            return res.status(400).json({
                success: false,
                message: "Seller is already rejected or not approved",
            });
        }

        seller.isApproved = false;
        await seller.save();

        return res.status(200).json({
            success: true,
            data: {
                sellerId: seller._id,
                name: seller.name,
                isApproved: seller.isApproved,
            },
            message: `Seller "${seller.name}" approval revoked`,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ─── ACTIVATE / DEACTIVATE USER ───────────────────────────────

const toggleUserStatus = async (req, res) => {
    try {
        const { role = "customer" } = req.query;

        if (!["customer", "seller"].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role. Must be customer or seller",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID",
            });
        }

        const Model = role === "seller" ? Seller : Customer;

        const user = await Model.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // ✅ Toggle — if active make inactive and vice versa
        user.isActive = !user.isActive;
        await user.save();

        return res.status(200).json({
            success: true,
            data: {
                userId: user._id,
                name: user.name,
                isActive: user.isActive,
            },
            message: `User "${user.name}" has been ${user.isActive ? "activated" : "deactivated"}`,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ─── GET ALL PRODUCTS (Admin) ─────────────────────────────────

const getAllProductsAdmin = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 12,
            approvalStatus,
            isActive,
            search,
        } = req.query;

        const filter = {};

        if (approvalStatus) filter.approvalStatus = approvalStatus;
        if (isActive !== undefined) filter.isActive = isActive === "true";

        if (search && search.trim()) {
            filter.$text = { $search: search.trim() };
        }

        const skip = (Number(page) - 1) * Number(limit);

        const [products, total] = await Promise.all([
            Product.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .populate("category", "name slug")
                .populate("subcategory", "name slug")
                .populate("seller", "name email shopName"),
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
            message: "Products fetched successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ─── GET PRODUCTS BY SELLER (Admin) ──────────────────────────

const getProductsBySeller = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.sellerId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid seller ID",
            });
        }

        const seller = await Seller.findById(req.params.sellerId)
            .select("name email shopName");

        if (!seller) {
            return res.status(404).json({
                success: false,
                message: "Seller not found",
            });
        }

        const {
            page = 1,
            limit = 12,
            approvalStatus,
        } = req.query;

        const filter = { seller: req.params.sellerId };
        if (approvalStatus) filter.approvalStatus = approvalStatus;

        const skip = (Number(page) - 1) * Number(limit);

        const [products, total] = await Promise.all([
            Product.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .populate("category", "name slug")
                .populate("subcategory", "name slug"),
            Product.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            data: {
                seller,
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

// ─── APPROVE PRODUCT ──────────────────────────────────────────

const activeProduct = async (req, res) => {
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

        if (product.approvalStatus === "approved") {
            return res.status(400).json({
                success: false,
                message: "Product is already approved",
            });
        }

        product.isApproved = true;
        product.approvalStatus = "approved";
        product.isActive = true;
        product.approvedAt = new Date();
        product.approvedBy = req.user._id;
        product.rejectedReason = "";
        await product.save();

        return res.status(200).json({
            success: true,
            data: {
                productId: product._id,
                name: product.name,
                approvalStatus: product.approvalStatus,
            },
            message: `Product "${product.name}" approved and is now live`,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ─── REJECT PRODUCT ───────────────────────────────────────────

const deactiveProduct = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

        const { rejectedReason } = req.body;

        if (!rejectedReason) {
            return res.status(400).json({
                success: false,
                message: "Please provide rejection reason",
            });
        }

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        if (product.approvalStatus === "rejected") {
            return res.status(400).json({
                success: false,
                message: "Product is already rejected",
            });
        }

        product.isApproved = false;
        product.approvalStatus = "rejected";
        product.isActive = false;
        product.rejectedReason = rejectedReason;
        product.approvedAt = null;
        product.approvedBy = null;
        await product.save();

        return res.status(200).json({
            success: true,
            data: {
                productId: product._id,
                name: product.name,
                approvalStatus: product.approvalStatus,
                rejectedReason,
            },
            message: `Product "${product.name}" rejected`,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ─── GET ALL ORDERS (Admin) ───────────────────────────────────

const getAllOrders = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            orderStatus,
            paymentStatus,
            paymentMethod,
        } = req.query;

        const filter = {};
        if (orderStatus) filter.orderStatus = orderStatus;
        if (paymentStatus) filter.paymentStatus = paymentStatus;
        if (paymentMethod) filter.paymentMethod = paymentMethod;

        const skip = (Number(page) - 1) * Number(limit);

        const [orders, total, revenueData] = await Promise.all([
            Order.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .populate("customer", "name email phone")
                .populate("orderItems.product", "name images price")
                .populate("orderItems.seller", "name shopName"),
            Order.countDocuments(filter),
            Order.aggregate([
                { $match: { paymentStatus: "paid" } },
                { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" } } },
            ]),
        ]);

        return res.status(200).json({
            success: true,
            data: {
                orders,
                total,
                totalRevenue: revenueData[0]?.totalRevenue || 0,
                page: Number(page),
                totalPages: Math.ceil(total / Number(limit)),
            },
            message: "All orders fetched successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ─── GET ORDERS BY SELLER (Admin) ────────────────────────────

const getOrdersBySeller = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.sellerId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid seller ID",
            });
        }

        const seller = await Seller.findById(req.params.sellerId)
            .select("name email shopName");

        if (!seller) {
            return res.status(404).json({
                success: false,
                message: "Seller not found",
            });
        }

        const {
            page = 1,
            limit = 10,
            orderStatus,
        } = req.query;

        const filter = { "orderItems.seller": req.params.sellerId };
        if (orderStatus) filter.orderStatus = orderStatus;

        const skip = (Number(page) - 1) * Number(limit);

        const [orders, total, revenueData] = await Promise.all([
            Order.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .populate("customer", "name email phone")
                .populate("orderItems.product", "name images price"),
            Order.countDocuments(filter),
            Order.aggregate([
                {
                    $match: {
                        "orderItems.seller": new mongoose.Types.ObjectId(req.params.sellerId),
                        paymentStatus: "paid",
                    },
                },
                { $unwind: "$orderItems" },
                {
                    $match: {
                        "orderItems.seller": new mongoose.Types.ObjectId(req.params.sellerId),
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalRevenue: {
                            $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] },
                        },
                    },
                },
            ]),
        ]);

        return res.status(200).json({
            success: true,
            data: {
                seller,
                orders,
                total,
                totalRevenue: revenueData[0]?.totalRevenue || 0,
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

// ─── GET PENDING PRODUCTS (Admin) ────────────────────────────

const getInactiveProduct = async (req, res) => {
    try {
        const { page = 1, limit = 12 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const [products, total] = await Promise.all([
            Product.find({ isActive:false })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .populate("category", "name slug")
                .populate("subcategory", "name slug")
                .populate("seller", "name email shopName"),
            Product.countDocuments({ approvalStatus: "pending" }),
        ]);

        return res.status(200).json({
            success: true,
            data: {
                products,
                total,
                page: Number(page),
                totalPages: Math.ceil(total / Number(limit)),
            },
            message: "Pending products fetched successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// ─────────────────────────────────────────────
// Deactivate User
// ─────────────────────────────────────────────

const deactivateUser = async (req, res) => {
    try {
        const { role = "customer" } = req.query;

        // ✅ Added: role validation
        if (role !== "customer" && role !== "seller") {
            return res.status(400).json({
                success: false,
                message: "Invalid role. Must be customer or seller",
            });
        }

        // ✅ Added: ObjectId validation
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID",
            });
        }

        let Model = Customer;
        if (role === "seller") Model = Seller;

        const user = await Model.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (!user.isActive) {
            return res.status(400).json({
                success: false,
                message: "User account is already deactivated",
            });
        }

        user.isActive = false;
        await user.save();

        return res.status(200).json({
            success: true,                
            data: {
                userId: user._id,
                name: user.name,
                isActive: user.isActive
            },
            message: `User "${user.name}" has been deactivated (banned)`
        });
    } catch (error) {
        return res.status(500).json({
            success: false,                
            message: error.message
        });
    }
};

// ─────────────────────────────────────────────
// Activate User
// ─────────────────────────────────────────────

const activateUser = async (req, res) => {
    try {
        const { role = "customer" } = req.query;

        // ✅ Added: role validation
        if (role !== "customer" && role !== "seller") {
            return res.status(400).json({
                success: false,
                message: "Invalid role. Must be customer or seller",
            });
        }

        // ✅ Added: ObjectId validation
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID",
            });
        }

        let Model = Customer;
        if (role === "seller") Model = Seller;

        const user = await Model.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (user.isActive) {
            return res.status(400).json({
                success: false,
                message: "User account is already active",
            });
        }

        user.isActive = true;
        await user.save();

        return res.status(200).json({
            success: true,                  // ✅ Fixed: typo "sucess"
            data: {
                userId: user._id,
                name: user.name,
                isActive: user.isActive
            },
            message: `User "${user.name}" account has been reactivated`
        });
    } catch (error) {
        return res.status(500).json({
            success: false,               
            message: error.message
        });
    }
};



// ─── GET ALL REVIEWS (Admin) ──────────────────────────────────

const getAllReviewsAdmin = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const [reviews, total] = await Promise.all([
            Review.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .populate("customer", "name email avatar")
                .populate("product", "name images price seller")
                .populate({
                    path: "product",
                    populate: {
                        path: "seller",
                        select: "shopName"
                    }
                }),
            Review.countDocuments(),
        ]);

        return res.status(200).json({
            success: true,
            data: reviews,
            total,
            message: "All reviews fetched successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export {
    getDashboardStats,
    getAllCustomers,
    getAllSellers,
    getSellerById,
    approveSeller,
    rejectSeller,
    toggleUserStatus,
    getAllProductsAdmin,
    getProductsBySeller,
    activeProduct,
    deactiveProduct,
    getAllOrders,
    getOrdersBySeller,
    getInactiveProduct,
    activateUser,
    deactivateUser,
    getAllReviewsAdmin,
};