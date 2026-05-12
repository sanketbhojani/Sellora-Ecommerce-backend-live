import mongoose from "mongoose";

const returnSchema = new mongoose.Schema({
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
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Seller",
        required: true,
    },
    reason: {
        type: String,
        required: [true, "Please provide return reason"],
        trim: true,
    },
    description: {
        type: String,
        trim: true,
        default: "",
    },
    images: [
        {
            type: String,
        }
    ],
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    refundAmount: {
        type: Number,
        required: true,
        default: 0,
    },
    status: {
        type: String,
        enum: ["requested", "approved", "rejected", "refunded"],
        default: "requested",
    },
    rejectedReason: {
        type: String,
        default: "",
    },
    refundedAt: {
        type: Date,
        default: null,
    },
    refundNote: {
        type: String,
        default: "",
    },
}, { timestamps: true });

export const Return = mongoose.model("Return", returnSchema);