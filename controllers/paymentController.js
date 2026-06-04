import mongoose from "mongoose";
import { Payment } from "../models/Payment.js";
import { Order } from "../models/Order.js";

// ─── GET PAYMENT BY ORDER ID ──────────────────────────────────

const getPaymentByOrderId = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.orderId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID",
            });
        }

        const payment = await Payment.findOne({ order: req.params.orderId })
            .populate("order", "totalPrice orderStatus paymentStatus trackingId")
            .populate("customer", "name email phone");

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment not found for this order",
            });
        }

        if (
            payment.customer._id.toString() !== req.user._id.toString() &&
            req.role !== "admin"
        ) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to view this payment",
            });
        }

        return res.status(200).json({
            success: true,
            data: payment,
            message: "Payment fetched successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ─── GET MY PAYMENTS (Customer) ───────────────────────────────

const getMyPayments = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;

        const filter = { customer: req.user._id };
        if (status) filter.status = status;

        const skip = (Number(page) - 1) * Number(limit);

        const [payments, total] = await Promise.all([
            Payment.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .populate("order", "totalPrice orderStatus trackingId"),
            Payment.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            data: {
                payments,
                total,
                page: Number(page),
                totalPages: Math.ceil(total / Number(limit)),
            },
            message: "Payment history fetched successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ─── GET ALL PAYMENTS (Admin) ─────────────────────────────────

const getAllPayments = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, method } = req.query;

        const filter = {};
        if (status) filter.status = status;
        if (method) filter.method = method;

        if (req.role === 'admin' || req.role === 'seller') {
            const adminOrders = await Order.find({ "orderItems.seller": req.user._id }).select("_id");
            filter.order = { $in: adminOrders.map(o => o._id) };
        }

        const skip = (Number(page) - 1) * Number(limit);

        const [payments, total] = await Promise.all([
            Payment.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .populate("customer", "name email phone")
                .populate("order", "totalPrice orderStatus trackingId"),
            Payment.countDocuments(filter),
        ]);

        const revenueData = await Payment.aggregate([
            { $match: { status: "paid" } },
            { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
        ]);

        const refundData = await Payment.aggregate([
            { $match: { status: "refunded" } },
            { $group: { _id: null, totalRefunded: { $sum: "$refundAmount" } } },
        ]);

        return res.status(200).json({
            success: true,
            data: {
                payments,
                total,
                totalRevenue: revenueData[0]?.totalRevenue || 0,
                totalRefunded: refundData[0]?.totalRefunded || 0,
                page: Number(page),
                totalPages: Math.ceil(total / Number(limit)),
            },
            message: "All payments fetched successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ─── PROCESS REFUND (Admin) ───────────────────────────────────

const processRefund = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.paymentId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment ID",
            });
        }

        const { refundReason, refundAmount } = req.body;

        const payment = await Payment.findById(req.params.paymentId);
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment not found",
            });
        }

        if (payment.status !== "paid") {
            return res.status(400).json({
                success: false,
                message: `Cannot refund a payment with status: ${payment.status}`,
            });
        }

        const finalRefundAmount = refundAmount
            ? parseFloat(refundAmount)
            : payment.amount;

        if (finalRefundAmount > payment.amount) {
            return res.status(400).json({
                success: false,
                message: "Refund amount cannot exceed payment amount",
            });
        }

        payment.status = "refunded";
        payment.refundAmount = finalRefundAmount;
        payment.refundReason = refundReason || "Refund by admin";
        payment.refundedAt = new Date();
        await payment.save();

        await Order.findByIdAndUpdate(payment.order, {
            paymentStatus: "refunded",
        });

        return res.status(200).json({
            success: true,
            data: payment,
            message: `Refund of ₹${finalRefundAmount} processed successfully`,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ─── GET PAYMENT STATS (Admin) ────────────────────────────────

const getPaymentStats = async (req, res) => {
    try {
        const baseFilter = {};
        if (req.role === 'admin' || req.role === 'seller') {
            const adminOrders = await Order.find({ "orderItems.seller": req.user._id }).select("_id");
            baseFilter.order = { $in: adminOrders.map(o => o._id) };
        }

        const [
            totalPayments,
            paidPayments,
            pendingPayments,
            failedPayments,
            refundedPayments,
            revenueData,
            refundData,
        ] = await Promise.all([
            Payment.countDocuments(baseFilter),
            Payment.countDocuments({ ...baseFilter, status: "paid" }),
            Payment.countDocuments({ ...baseFilter, status: "pending" }),
            Payment.countDocuments({ ...baseFilter, status: "failed" }),
            Payment.countDocuments({ ...baseFilter, status: "refunded" }),
            Payment.aggregate([
                { $match: { ...baseFilter, status: "paid" } },
                { $group: { _id: null, total: { $sum: "$amount" } } },
            ]),
            Payment.aggregate([
                { $match: { ...baseFilter, status: "refunded" } },
                { $group: { _id: null, total: { $sum: "$refundAmount" } } },
            ]),
        ]);

        return res.status(200).json({
            success: true,
            data: {
                totalPayments,
                totalRevenue: revenueData[0]?.total || 0,
                totalRefunded: refundData[0]?.total || 0,
                paymentsByStatus: {
                    paid: paidPayments,
                    pending: pendingPayments,
                    failed: failedPayments,
                    refunded: refundedPayments,
                },
            },
            message: "Payment stats fetched successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export {
    getPaymentByOrderId,
    getMyPayments,
    getAllPayments,
    processRefund,
    getPaymentStats,
};