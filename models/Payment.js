import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true,
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        default: "INR",
    },
    method: {
        type: String,
        enum: [ "online", "upi"],
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending",
    },

    // ✅ Transaction reference — manually entered or generated
    transactionId: {
        type: String,
        default: "",
    },

    paidAt: {   
        type: Date,
        default: null,
    },
    refundedAt: {
        type: Date,
        default: null,
    },
    refundAmount: {
        type: Number,
        default: 0,
    },
    refundReason: {
        type: String,
        default: "",
    },
    note: {
        type: String,
        default: "",
    },
}, { timestamps: true });

export const Payment = mongoose.model("Payment", paymentSchema);