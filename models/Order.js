import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        default: null,
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: [0, "Price cannot be negative"]
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, "Quantity cannot be less than 1"]
    }
}, { _id: false });


const orderSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },

    orderItems: [orderItemSchema],

    shippingAddress: {
        fullname: {
            type: String,
            required: true,
            trim: true
        },
        phone: {
            type: String,           
            required: true,
            trim: true
        },
        addressLine1: {
            type: String,
            required: true,
            trim: true
        },
        addressLine2: {
            type: String,
            default: "",
            trim: true
        },
        city: {
            type: String,
            required: true,        
            trim: true
        },
        state: {
            type: String,
            required: true,
            trim: true
        },
        pincode: {
            type: String,
            required: true,        
            trim: true
        },
        country: {
            type: String,
            default: "India",
            trim: true
        },
        addressType: {
            type: String,
            enum: ["home", "work", "other"],
            default: "home"        
        }
    },

    itemsPrice: {
        type: Number,
        required: true,
        default: 0,
        min: [0, "Items price cannot be negative"]
    },
    shippingCharge: {
        type: Number,
        required: true,
        default: 0,
        min: [0, "Shipping charge cannot be negative"]
    },
    taxPrice: {
        type: Number,
        required: true,
        default: 0,
        min: [0, "Tax price cannot be negative"]
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0,
        min: [0, "Total price cannot be negative"]
    },
    discount: {
        type: Number,
        default: 0,             
        min: 0
    },

    paymentMethod: {
        type: String,
        enum: [ "online", "upi"],
        required:true
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending",
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    paidAt: {
        type: Date,
        default: null             
    },

    orderStatus: {
        type: String,
        enum: ["placed", "confirmed", "processing", "shipped", "delivered", "cancelled"],
        default: "placed"
    },
    deliveredAt: {
        type: Date,
        default: null       
    },
    trackingId: {
        type: String,
        default: ""                
    },
    cancelReason: {
        type: String,
        default: ""
    },
    cancelledAt: {
        type: Date,
        default: null           
    },
    seenBySellers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        default: []
    }],

}, { timestamps: true });

export const Order = mongoose.model('Order', orderSchema);