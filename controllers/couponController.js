import mongoose from "mongoose";
import { Coupon } from "../models/Coupon.js";
import { Cart } from "../models/Cart.js";

// ✅ FIX 3: validateCoupon is now a reusable HELPER function (not a route handler)
// It takes (code, cartTotal) and returns { valid, coupon, discountAmount, message }
// Used internally by applyCoupon and placeOrder
const validateCoupon = async (code, cartTotal) => {
    const coupon = await Coupon.findOne({
        code: code.toUpperCase(),
        isActive: true,
    });

    if (!coupon) {
        return { valid: false, message: "Invalid or inactive coupon" };
    }

    if (new Date() > new Date(coupon.expiresAt)) {
        return { valid: false, message: "Coupon has expired" };
    }

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
        return { valid: false, message: "Coupon usage limit has been reached" };
    }

    if (cartTotal < coupon.minOrderAmount) {
        return { valid: false, message: `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon` };
    }

    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
        discountAmount = (cartTotal * coupon.discountValue) / 100;
        if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
            discountAmount = coupon.maxDiscountAmount;
        }
    } else {
        // flat — discount cannot exceed cart total
        discountAmount = Math.min(coupon.discountValue, cartTotal);
    }

    return {
        valid: true,
        coupon,
        discountAmount: parseFloat(discountAmount.toFixed(2)),
    };
};

const createCoupon = async (req, res) => {
    try {
        const {
            code, discountType, discountValue,
            minOrderAmount, maxDiscountAmount,
            usageLimit, expiresAt,
        } = req.body;

        if (!code || !discountType || !discountValue || !expiresAt) {
            return res.status(400).json({
                success: false,
                message: "Code, discount type, discount value and expiry are required",
            });
        }

        // ✅ Validate discount value for percentage
        if (discountType === "percentage" && discountValue > 100) {
            return res.status(400).json({
                success: false,
                message: "Percentage discount cannot exceed 100%",
            });
        }

        // ✅ Check duplicate
        const existing = await Coupon.findOne({ code: code.toUpperCase() });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: "Coupon code already exists",
            });
        }

        const coupon = new Coupon({
            code: code.toUpperCase(),
            discountType,
            discountValue,
            minOrderAmount: minOrderAmount || 0,
            maxDiscountAmount: maxDiscountAmount || null,
            usageLimit: usageLimit || null,
            expiresAt: new Date(expiresAt),
            createdBy: req.user._id,
        });

        await coupon.save();

        return res.status(201).json({
            success: true,
            data: coupon,
            message: "Coupon created successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const applyCoupon = async (req, res) => {
    try {
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({
                success: false,
                message: "Coupon code is required",
            });
        }

        // ✅ Get customer cart
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Your cart is empty",
            });
        }

        // ✅ FIX 4: applyCoupon now uses the validateCoupon helper
        const result = await validateCoupon(code, cart.totalPrice);

        if (!result.valid) {
            return res.status(400).json({
                success: false,
                message: result.message,
            });
        }

        const { coupon, discountAmount } = result;
        const finalAmount = parseFloat((cart.totalPrice - discountAmount).toFixed(2));

        return res.status(200).json({
            success: true,
            data: {
                code: coupon.code,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                discountAmount,
                originalAmount: cart.totalPrice,
                finalAmount,
            },
            message: `Coupon applied! You save ₹${discountAmount}`,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getAllCoupons = async (req, res) => {
    try {
        const { page = 1, limit = 10, isActive } = req.query;

        const filter = {};
        if (isActive !== undefined) filter.isActive = isActive === "true";

        const skip = (Number(page) - 1) * Number(limit);

        const [coupons, total] = await Promise.all([
            Coupon.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            Coupon.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            data: {
                coupons,
                total,
                page: Number(page),
                totalPages: Math.ceil(total / Number(limit)),
            },
            message: "Coupons fetched successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const updateCoupon = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid coupon ID",
            });
        }

        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: "Coupon not found",
            });
        }

        const updated = await Coupon.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            success: true,
            data: updated,
            message: "Coupon updated successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const deleteCoupon = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid coupon ID",
            });
        }

        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: "Coupon not found",
            });
        }

        await Coupon.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Coupon deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const toggleCouponStatus = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid coupon ID",
            });
        }

        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: "Coupon not found",
            });
        }

        coupon.isActive = !coupon.isActive;
        await coupon.save();

        return res.status(200).json({
            success: true,
            data: { isActive: coupon.isActive },
            message: `Coupon ${coupon.isActive ? "activated" : "deactivated"} successfully`,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export {
    createCoupon,
    applyCoupon,
    validateCoupon, // ✅ exported so orderController can import and use it
    getAllCoupons,
    updateCoupon,
    deleteCoupon,
    toggleCouponStatus,
};