import mongoose from "mongoose";

const couponSchema  = new mongoose.Schema({
    code:{
        type: String,
        required: [true, "Coupon code is required"],
        unique: true,
        uppercase: true,
        trim: true,
    },

    discountType:{
        type: String,
        enum: ["percentage", "flat"],
        required: true,
    },

    discountValue: {
        type: Number,
        required: true,
        min: [1, "Discount value must be at least 1"],
    },
    minOrderAmount: {
        type: Number,
        default: 0,
    },

    maxDiscountAmount: {
        type: Number,
        default: null,  // ✅ max cap for percentage coupons
    },
    usageLimit: {
        type: Number,
        default: null,  // ✅ null = unlimited
    },
    usedCount: {
        type: Number,
        default: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
    },
},{timestamps:true})


export const Coupon = mongoose.model('Coupon',couponSchema);
