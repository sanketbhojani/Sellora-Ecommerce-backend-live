import mongoose from "mongoose";

const reviewSchema  = new mongoose.Schema({
        product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true,
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true,  // ✅ only purchased customers can review
    },

    rating: {
        type: Number,
        required: [true, "Please give a rating"],
        min: [1, "Rating must be at least 1"],
        max: [5, "Rating cannot exceed 5"],
    },

    comment: {
        type: String,
        trim: true,
        maxlength: [500, "Review cannot exceed 500 characters"],
        default: "",
    },

    images: [
        {
            type: String,  // ✅ optional review images
        }
    ],

    isVerified: {
        type: Boolean,
        default: true,  // ✅ verified purchase
    },
},{timestamps:true});


// ✅ One review per customer per product
reviewSchema.index({ product: 1, customer: 1 }, { unique: true });


export const Review  = mongoose.model('Review ',reviewSchema);