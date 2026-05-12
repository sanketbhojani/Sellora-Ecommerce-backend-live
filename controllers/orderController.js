import mongoose from "mongoose";
import { Address } from '../models/Address.js'
import { Cart } from '../models/Cart.js'
import { Order } from '../models/Order.js'
import { Product } from "../models/Product.js";
import { Seller } from "../models/Seller.js";
import { Payment } from "../models/Payment.js";
import { validateCoupon } from "./couponController.js";
import { Coupon } from "../models/Coupon.js";

// ─── PLACE ORDER ──────────────────────────────────────────────

const placeOrder = async (req, res) => {
    try {
        const { addressId, paymentMethod, couponCode, transactionId, note } = req.body;

        if (!addressId || !paymentMethod) {
            return res.status(400).json({
                success: false,
                message: "Address and payment method are required",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(addressId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid address ID",
            });
        }

        if (!["online", "upi"].includes(paymentMethod)) {
            return res.status(400).json({
                success: false,
                message: "Payment method must be online or upi",
            });
        }

        if (!transactionId) {
            return res.status(400).json({
                success: false,
                message: "Transaction ID is required",
            });
        }

        // ✅ Get address
        const address = await Address.findOne({ _id: addressId, user: req.user._id });
        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found",
            });
        }

        // ✅ Get cart
        const cart = await Cart.findOne({ user: req.user._id }).populate({
            path: "items.product",
            select: "name price stock isActive images seller",
        });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Your cart is empty",
            });
        }

        // ✅ Validate cart items
        const orderItems = [];
        let itemsPrice = 0;

        for (const item of cart.items) {
            const product = item.product;

            if (!product || !product.isActive) {
                return res.status(400).json({
                    success: false,
                    message: "One or more products are no longer available",
                });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Only ${product.stock} units available for "${product.name}"`,
                });
            }

            orderItems.push({
                product: product._id,
                seller: product.seller,
                name: product.name,
                image: product.images[0] || "",
                price: product.price,
                quantity: item.quantity,
            });

            itemsPrice += product.price * item.quantity;
        }

        itemsPrice = parseFloat(itemsPrice.toFixed(2));

        // ✅ Validate coupon
        let discountAmount = 0;
        let appliedCoupon = null;

        if (couponCode && couponCode.trim() !== "") {
            const couponResult = await validateCoupon(couponCode, itemsPrice);
            if (!couponResult.valid) {
                return res.status(400).json({
                    success: false,
                    message: couponResult.message,
                });
            }
            discountAmount = couponResult.discountAmount;
            appliedCoupon = couponResult.coupon;
        }

        // ✅ Calculate charges
        const discountedItemsPrice = parseFloat((itemsPrice - discountAmount).toFixed(2));
        const shippingCharge = discountedItemsPrice >= 500 ? 0 : 50;
        const taxPrice = parseFloat((discountedItemsPrice * 0.018).toFixed(2));
        const totalPrice = parseFloat((discountedItemsPrice + shippingCharge).toFixed(2));

        const shippingAddress = {
            fullname: address.fullname,
            phone: address.phone,
            addressLine1: address.addressLine1,
            addressLine2: address.addressLine2 || "",
            city: address.city,
            state: address.state,
            pincode: address.pincode,
            country: address.country,
            addressType: address.addressType,
        };

        const trackingId =
            "TRK" + Date.now() +
            Math.random().toString(36).substring(2, 7).toUpperCase();

        // ✅ Create order — always paid immediately
        const order = new Order({
            customer: req.user._id,
            orderItems,
            shippingAddress,
            itemsPrice,
            shippingCharge,
            taxPrice,
            discount: discountAmount,
            totalPrice,
            paymentMethod,
            paymentStatus: "paid",
            orderStatus: "placed",
            isPaid: true,
            paidAt: new Date(),
            trackingId,
            transactionId,
        });

        await order.save();

        // ✅ Create payment record
        const payment = new Payment({
            order: order._id,
            customer: req.user._id,
            amount: totalPrice,
            currency: "INR",
            method: paymentMethod,
            status: "paid",
            transactionId,
            paidAt: new Date(),
            note: note || "",
        });

        await payment.save();

        // ✅ Increment coupon usedCount
        if (appliedCoupon) {
            await Coupon.findByIdAndUpdate(appliedCoupon._id, {
                $inc: { usedCount: 1 },
            });
        }

        // ✅ Deduct stock
        await Promise.all(
            orderItems.map((item) =>
                Product.findByIdAndUpdate(item.product, {
                    $inc: { stock: -item.quantity },
                })
            )
        );

        // ✅ Clear cart
        cart.items = [];
        cart.totalItems = 0;
        cart.totalPrice = 0;
        await cart.save();

        await order.populate([
            { path: "orderItems.product", select: "name images price" },
            { path: "orderItems.seller", select: "name shopName" },
            { path: "customer", select: "name email phone" },
        ]);

        return res.status(201).json({
            success: true,
            data: { order, payment },
            message: "Order placed successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ─── GET MY ORDERS (Customer) ─────────────────────────────────

const getMyOrders = async (req, res) => {
    try {
        const { page = 1, limit = 10, orderStatus, paymentStatus } = req.query;

        const filter = { customer: req.user._id };
        if (orderStatus) filter.orderStatus = orderStatus;
        if (paymentStatus) filter.paymentStatus = paymentStatus;

        const skip = (Number(page) - 1) * Number(limit);

        const [orders, total] = await Promise.all([
            Order.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .populate("orderItems.product", "name images price")
                .populate("orderItems.seller", "name shopName"),
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
            message: "Orders fetched successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ─── GET ORDER BY ID ──────────────────────────────────────────

const getOrderById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID",
            });
        }

        const order = await Order.findById(req.params.id)
            .populate("orderItems.product", "name images price category subcategory")
            .populate("orderItems.seller", "name shopName email")
            .populate("customer", "name email phone");

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        if (
            order.customer._id.toString() !== req.user._id.toString() &&
            req.role !== "admin"
        ) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to view this order",
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

// ─── CANCEL ORDER (Customer) ──────────────────────────────────

// const cancelOrder = async (req, res) => {
//     try {
//         if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid order ID",
//             });
//         }

//         const order = await Order.findById(req.params.id);
//         if (!order) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Order not found",
//             });
//         }

//         if (order.customer.toString() !== req.user._id.toString()) {
//             return res.status(403).json({
//                 success: false,
//                 message: "Not authorized to cancel this order",
//             });
//         }

//         if (!["placed", "confirmed"].includes(order.orderStatus)) {
//             return res.status(400).json({
//                 success: false,
//                 message: `Order cannot be cancelled once it is ${order.orderStatus}`,
//             });
//         }

//         const { cancelReason } = req.body;

//         order.orderStatus = "cancelled";
//         order.cancelReason = cancelReason || "Cancelled by customer";
//         order.cancelledAt = new Date();
//         order.paymentStatus = "paid"; // always paid so always refunded on cancel

//         // ✅ Restore stock
//         await Promise.all(
//             order.orderItems.map((item) =>
//                 Product.findByIdAndUpdate(item.product, {
//                     $inc: { stock: item.quantity },
//                 })
//             )
//         );

//         // ✅ Mark payment as refunded
//         await Payment.findOneAndUpdate(
//             { order: order._id },
//             {
//                 status: "paid",
//                 refundAmount: order.totalPrice,
//                 refundReason: cancelReason || "Cancelled by customer",
//                 refundedAt: new Date(),
//             }
//         );

//         await order.save();

//         return res.status(200).json({
//             success: true,
//             data: order,
//             message: "Order cancelled successfully",
//         });

//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             message: error.message,
//         });
//     }
// };

// ─── GET ALL ORDERS (Admin) ───────────────────────────────────

// const getAllOrders = async (req, res) => {
//     try {
//         const { page = 1, limit = 10, orderStatus, paymentStatus, paymentMethod } = req.query;

//         const filter = {};
//         if (orderStatus) filter.orderStatus = orderStatus;
//         if (paymentStatus) filter.paymentStatus = paymentStatus;
//         if (paymentMethod) filter.paymentMethod = paymentMethod;

//         const skip = (Number(page) - 1) * Number(limit);

//         const [orders, total] = await Promise.all([
//             Order.find(filter)
//                 .sort({ createdAt: -1 })
//                 .skip(skip)
//                 .limit(Number(limit))
//                 .populate("customer", "name email phone")
//                 .populate("orderItems.product", "name images price")
//                 .populate("orderItems.seller", "name shopName"),
//             Order.countDocuments(filter),
//         ]);

//         const revenueData = await Order.aggregate([
//             { $match: { paymentStatus: "paid" } },
//             { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" } } },
//         ]);

//         return res.status(200).json({
//             success: true,
//             data: {
//                 orders,
//                 total,
//                 totalRevenue: revenueData[0]?.totalRevenue || 0,
//                 page: Number(page),
//                 totalPages: Math.ceil(total / Number(limit)),
//             },
//             message: "All orders fetched successfully",
//         });

//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             message: error.message,
//         });
//     }
// };

// ─── UPDATE ORDER STATUS (Admin) ──────────────────────────────

const updateOrderStatus = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID",
            });
        }

        const { orderStatus, trackingId } = req.body;

        const validOrderStatuses = ["placed", "confirmed", "processing", "shipped", "delivered", "cancelled"];

        if (!orderStatus || !validOrderStatuses.includes(orderStatus)) {
            return res.status(400).json({
                success: false,
                message: `Invalid order status. Valid values: ${validOrderStatuses.join(", ")}`,
            });
        }

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        order.orderStatus = orderStatus;

        if (orderStatus === "delivered") {
            order.deliveredAt = new Date();

            // ✅ Increment totalSales for each seller
            const sellerSalesMap = {};
            for (const item of order.orderItems) {
                const sellerId = item.seller?.toString();
                if (sellerId) {
                    sellerSalesMap[sellerId] = (sellerSalesMap[sellerId] || 0) + item.quantity;
                }
            }
            await Promise.all(
                Object.entries(sellerSalesMap).map(([sellerId, qty]) =>
                    Seller.findByIdAndUpdate(sellerId, { $inc: { totalSales: qty } })
                )
            );
        }

        if (orderStatus === "cancelled") {
            order.cancelledAt = new Date();
            order.cancelReason = order.cancelReason || "Cancelled by admin";
            order.paymentStatus = "refunded";

            // ✅ Restore stock
            await Promise.all(
                order.orderItems.map((item) =>
                    Product.findByIdAndUpdate(item.product, {
                        $inc: { stock: item.quantity },
                    })
                )
            );

            // ✅ Mark payment refunded
            await Payment.findOneAndUpdate(
                { order: order._id },
                {
                    status: "refunded",
                    refundAmount: order.totalPrice,
                    refundReason: "Cancelled by admin",
                    refundedAt: new Date(),
                }
            );
        }

        if (trackingId) order.trackingId = trackingId;

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

// ─── GET SELLER ORDERS ────────────────────────────────────────

const getSellerOrders = async (req, res) => {
    try {
        const { page = 1, limit = 10, orderStatus } = req.query;

        const filter = { "orderItems.seller": req.user._id };
        if (orderStatus) filter.orderStatus = orderStatus;

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

// ─── GET ORDER STATS (Admin) ──────────────────────────────────

const getOrderStats = async (req, res) => {
    try {
        const [
            totalOrders,
            placedOrders,
            confirmedOrders,
            processingOrders,
            shippedOrders,
            deliveredOrders,
            cancelledOrders,
            totalRevenueData,
        ] = await Promise.all([
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
                totalOrders,
                totalRevenue: totalRevenueData[0]?.total || 0,
                ordersByStatus: {
                    placed: placedOrders,
                    confirmed: confirmedOrders,
                    processing: processingOrders,
                    shipped: shippedOrders,
                    delivered: deliveredOrders,
                    cancelled: cancelledOrders,
                },
            },
            message: "Order stats fetched successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export {
    placeOrder,
    getMyOrders,
    getOrderById,
    // cancelOrder,
    // getAllOrders,
    updateOrderStatus,
    getSellerOrders,
    getOrderStats,
};