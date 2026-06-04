import mongoose from "mongoose";

const sellerSchema  = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "name is requiredd"],
        trim: true,
    },

    email: {
        type: String,
        required: [true, "email is requiredd"],
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        requiredd: [true, "Please enter a password"],
        minlength: [6, "Password must be at least 6 characters"],
    },

    phone:{
        type:String,
        required: [true, "Phone number is requiredd for sellers"],
    },
    avatar: {
      type: String,
      default: "",
    },
    // Seller-specific fields

    shopName:{
        type:String,
        required:[true,"Please enter your shop/brand name"],
        trim:true
    },
    shopDescription: {
      type: String,
      trim: true,
    },
    isApproved:{
        type:Boolean,
        default:false
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Email verification via OTP

    isVerified:{
        type:Boolean,
        default:false
    },

    otp:{
        type:Number,      
        default:null
    },

    otpExpiry:{
        type:Date,
        default:null
    },

    totalProducts:{
        type:Number,
        default:0
    },
    totalSales:{
        type:Number,
        default:0
    },
    role: {
      type: String,
      default: "seller",
      immutable: true,
    },
    refreshToken: {
        type: String,
        default: null,
    }
},{timestamps:true});


export const Seller = mongoose.model('Seller',sellerSchema);