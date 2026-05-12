import mongoose from "mongoose";
import { Return } from "../models/Return.js";
import { Order } from "../models/Order.js";
import { Payment } from "../models/Payment.js";
import { Product } from "../models/Product.js";
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

// ─── REQUEST RETURN (Customer) ────────────────────────────────

const requestReturn = async (req, res) => {
    try {
        const { orderId, productId, reason, description, quantity } = req.body;

        if (!orderId || !productId || !reason || !quantity) {
            return res.status(400).json({
                success: false,
                message: "Order ID, product ID, reason, and quantity are required",
            });
        }

        if (
            !mongoose.Types.ObjectId.isValid(orderId) ||
            !mongoose.Types.ObjectId.isValid(productId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid order or product ID",
            });
        }

        // ✅ Validate quantity is a positive integer
        const parsedQuantity = parseInt(quantity);
        if (isNaN(parsedQuantity) || parsedQuantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a positive number",
            });
        }

        // ✅ Only delivered orders within 7 days
        const order = await Order.findOne({
            _id: orderId,
            customer: req.user._id,
            orderStatus: "delivered",
        });
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found or not delivered yet",
            });
        }

        // ✅ Check 7-day return window
        if (order.deliveredAt) {
            const deliveredDate = new Date(order.deliveredAt);
            const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
            if (Date.now() - deliveredDate.getTime() > sevenDaysInMs) {
                return res.status(400).json({
                    success: false,
                    message: "Return period has expired (7 days from delivery)",
                });
            }
        }

        // ✅ Find product in order
        const orderItem = order.orderItems.find(
            (item) => item.product.toString() === productId
        );
        if (!orderItem) {
            return res.status(404).json({
                success: false,
                message: "Product not found in this order",
            });
        }

        // ✅ Customer can't return more than they ordered
        if (parsedQuantity > orderItem.quantity) {
            return res.status(400).json({
                success: false,
                message: `You can only return up to ${orderItem.quantity} unit(s) of this product`,
            });
        }

        // ✅ No duplicate return
        const existingReturn = await Return.findOne({
            order: orderId,
            product: productId,
            customer: req.user._id,
            status: { $in: ["requested", "approved", "refunded"] },
        });
        if (existingReturn) {
            return res.status(400).json({
                success: false,
                message: "Return already requested for this product",
            });
        }

        // ✅ Refund = price × customer-specified quantity
        const refundAmount = parseFloat(
            (orderItem.price * parsedQuantity).toFixed(2)
        );

        const images =
            req.files && req.files.length > 0
                ? req.files.map((f) => f.path)
                : [];

        const returnRequest = new Return({
            order: orderId,
            customer: req.user._id,
            product: productId,
            seller: orderItem.seller,
            reason,
            description: description || "",
            images,
            quantity: parsedQuantity,   // ✅ customer's chosen quantity
            refundAmount,
            status: "requested",
        });

        await returnRequest.save();
        await returnRequest.populate([
            { path: "product", select: "name images price" },
            { path: "order", select: "totalPrice orderStatus" },
        ]);

        return res.status(201).json({
            success: true,
            data: returnRequest,
            message: "Return request submitted successfully",
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

// ─── GET MY RETURNS (Customer) ────────────────────────────────

const getMyReturns = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;

        const filter = { customer: req.user._id };
        if (status) filter.status = status;

        const skip = (Number(page) - 1) * Number(limit);

        const [returns, total] = await Promise.all([
            Return.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .populate("product", "name images price")
                .populate("order", "totalPrice orderStatus createdAt"),
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
            message: "Return requests fetched successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ─── GET RETURN BY ID ─────────────────────────────────────────

const getReturnById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid return ID",
            });
        }

        const returnRequest = await Return.findById(req.params.id)
            .populate("customer", "name email phone")
            .populate("product", "name images price")
            .populate("seller", "name shopName")
            .populate("order", "totalPrice paymentStatus orderStatus");

        if (!returnRequest) {
            return res.status(404).json({
                success: false,
                message: "Return request not found",
            });
        }

        if (
            returnRequest.customer._id.toString() !== req.user._id.toString() &&
            req.role !== "admin"
        ) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to view this return",
            });
        }

        return res.status(200).json({
            success: true,
            data: returnRequest,
            message: "Return fetched successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ─── GET ALL RETURNS (Admin) ──────────────────────────────────

const getAllReturns = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;

        const filter = {};
        if (status) filter.status = status;

        const skip = (Number(page) - 1) * Number(limit);

        const [returns, total] = await Promise.all([
            Return.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .populate("customer", "name email phone")
                .populate("product", "name images price")
                .populate("seller", "name shopName")
                .populate("order", "totalPrice paymentStatus"),
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
            message: "All return requests fetched successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ─── APPROVE RETURN + PROCESS REFUND (Admin) ──────────────────

const approveReturn = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid return ID",
            });
        }

        const { refundNote } = req.body || {};

        const returnRequest = await Return.findById(req.params.id);
        if (!returnRequest) {
            return res.status(404).json({
                success: false,
                message: "Return request not found",
            });
        }

        if (returnRequest.status !== "requested") {
            return res.status(400).json({
                success: false,
                message: `Return is already ${returnRequest.status}`,
            });
        }

        // ✅ Find payment for this order
        const payment = await Payment.findOne({ order: returnRequest.order });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment record not found for this order",
            });
        }

        if (payment.status !== "paid") {
            return res.status(400).json({
                success: false,
                message: `Cannot refund — payment status is: ${payment.status}`,
            });
        }

        // ✅ Update payment to refunded
        payment.status = "refunded";
        payment.refundAmount = returnRequest.refundAmount;
        payment.refundReason = returnRequest.reason;
        payment.refundedAt = new Date();
        await payment.save();

        // ✅ Update return to refunded
        returnRequest.status = "refunded";
        returnRequest.refundedAt = new Date();
        returnRequest.refundNote = refundNote || "Refund approved by admin";
        await returnRequest.save();

        // ✅ Update order payment status
        await Order.findByIdAndUpdate(returnRequest.order, {
            paymentStatus: "refunded",
        });

        // ✅ Restore product stock
        await Product.findByIdAndUpdate(returnRequest.product, {
            $inc: { stock: returnRequest.quantity },
        });

        return res.status(200).json({
            success: true,
            data: {
                returnRequest,
                payment,
                refundAmount: returnRequest.refundAmount,
            },
            message: `Return approved. Refund of ₹${returnRequest.refundAmount} processed successfully`,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ─── REJECT RETURN (Admin) ────────────────────────────────────

const rejectReturn = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid return ID",
            });
        }

        const { rejectedReason } = req.body;

        if (!rejectedReason) {
            return res.status(400).json({
                success: false,
                message: "Please provide rejection reason",
            });
        }

        const returnRequest = await Return.findById(req.params.id);
        if (!returnRequest) {
            return res.status(404).json({
                success: false,
                message: "Return request not found",
            });
        }

        if (returnRequest.status !== "requested") {
            return res.status(400).json({
                success: false,
                message: `Return is already ${returnRequest.status}`,
            });
        }

        returnRequest.status = "rejected";
        returnRequest.rejectedReason = rejectedReason;
        await returnRequest.save();

        return res.status(200).json({
            success: true,
            data: returnRequest,
            message: "Return request rejected successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ─── GET RETURN STATS (Admin) ─────────────────────────────────

const getReturnStats = async (req, res) => {
    try {
        const [
            totalReturns,
            requestedReturns,
            refundedReturns,
            rejectedReturns,
            totalRefundData,
        ] = await Promise.all([
            Return.countDocuments(),
            Return.countDocuments({ status: "requested" }),
            Return.countDocuments({ status: "refunded" }),
            Return.countDocuments({ status: "rejected" }),
            Return.aggregate([
                { $match: { status: "refunded" } },
                { $group: { _id: null, total: { $sum: "$refundAmount" } } },
            ]),
        ]);

        return res.status(200).json({
            success: true,
            data: {
                totalReturns,
                totalRefunded: totalRefundData[0]?.total || 0,
                returnsByStatus: {
                    requested: requestedReturns,
                    refunded: refundedReturns,
                    rejected: rejectedReturns,
                },
            },
            message: "Return stats fetched successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export {
    requestReturn,
    getMyReturns,
    getReturnById,
    getAllReturns,
    approveReturn,
    rejectReturn,
    getReturnStats,
};