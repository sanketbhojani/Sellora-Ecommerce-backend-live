import {Order} from '../models/Order.js'
import { Review } from '../models/Review.js'
import {Wishlist} from '../models/Wishlist.js'
import {Address} from '../models/Address.js'
import { Customer } from '../models/Customer.js'
import mongoose from 'mongoose'
import { Product } from '../models/Product.js'



// ─────────────────────────────────────────────────────────────────────────────
//  ORDER HISTORY
// ─────────────────────────────────────────────────────────────────────────────

// @desc    Get all my orders
// @route   GET /api/customers/orders
// @access  Private (customer)
export const getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const query = { customer: req.user._id };
    if (status) query.status = status;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate("orderItems", "name image price")
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: orders,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single order detail
// @route   GET /api/customers/orders/:orderId
// @access  Private (customer)
export const getMyOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: "Invalid order ID." });
    }

    const order = await Order.findOne({
      _id: orderId,
      customer: req.user._id,
    }).populate("orderItems", "name images price description");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    return res.status(200).json({ success: true, data: order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel my order (only pending / processing)
// @route   PATCH /api/customers/orders/:orderId/cancel
// @access  Private (customer)
export const cancelMyOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: "Invalid order ID." });
    }

    const order = await Order.findOne({ _id: orderId, customer: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    // ✅ Fixed: use orderStatus and correct enum values from schema
    if (!["placed", "confirmed"].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled at this stage. Current status: "${order.orderStatus}".`,
      });
    }

    order.orderStatus = "cancelled";
    order.cancelReason = reason || "Cancelled by customer";
    order.cancelledAt = new Date();

    // ✅ Mark as refunded if already paid
    if (order.isPaid) {
      order.paymentStatus = "paid";
    }

    // ✅ Restore stock
    await Promise.all(
      order.orderItems.map((item) =>
        Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        })
      )
    );

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully.",
      data: order,
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Track my order
// @route   GET /api/customers/orders/:orderId/tracking
// @access  Private (customer)
export const trackMyOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: "Invalid order ID." });
    }

    const order = await Order.findOne({
      _id: orderId,
      customer: req.user._id,
    }).select(
      "orderStatus trackingId cancelReason cancelledAt createdAt"
    );

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    return res.status(200).json({ success: true, data: order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};



// ─────────────────────────────────────────────────────────────────────────────
//  DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────

// @desc    My dashboard summary
// @route   GET /api/customers/dashboard
// @access  Private (customer)
export const getMyDashboard = async (req, res) => {
  try {
    const customerId = req.user._id;

    const [
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalReviews,
      wishlist,
      totalAddresses,
      customer,
    ] = await Promise.all([
      Order.countDocuments({ customer: customerId }),
      Order.countDocuments({ customer: customerId, status: "pending" }),
      Order.countDocuments({ customer: customerId, status: "processing" }),
      Order.countDocuments({ customer: customerId, status: "shipped" }),
      Order.countDocuments({ customer: customerId, status: "delivered" }),
      Order.countDocuments({ customer: customerId, status: "cancelled" }),
      Review.countDocuments({ customer: customerId }),
      Wishlist.findOne({ user: customerId }).select("products"),
      Address.countDocuments({ user: customerId }),
      Customer.findById(customerId).select("name email avatar phone"),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        customer: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          avatar: customer.avatar,
        },
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          processing: processingOrders,
          shipped: shippedOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders,
        },
        wishlistCount: wishlist ? wishlist.products.length : 0,
        savedAddresses: totalAddresses,
        reviewsGiven: totalReviews,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};