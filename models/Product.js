
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'please enter product name'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'please enter product description']
    },

    price: {
        type: Number,
        required: [true, 'please enter product price'],
        min: [0, 'Price can not be negative']
    },
    originalPrice: {
        type: Number,
        default: 0
    },
    images: [
        {
            type: String
        }
    ],
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        requiredd: [true, "Please select category"],
    },
    subcategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subcategory",
        requiredd: [true, "Please select subcategory"],
    },
    stock: {
        type: Number,
        required: [true, 'please enter your stock quntity'],
        default: 0,
        min: [0, 'Stock can not be negative']
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    numReviews: {
        type: Number,
        default: 0
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        required: true
    },
    tags: [
        {
            type: String,
            lowercase: true
        }
    ],
    isActive: {
        type: Boolean,
        default: true
    },
    isApproved: {
        type: Boolean,
        default: true
    },
    approvalStatus: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "approved"
    },
    approvedAt: {
        type: Date
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin"
    },
    rejectedReason: {
        type: String,
        default: ""
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

productSchema.index({ name: "text", description: "text", category: "text", tags: "text" });

export const Product = mongoose.model('Product', productSchema)