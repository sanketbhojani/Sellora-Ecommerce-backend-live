import mongoose from "mongoose";


const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "name is required"],
        trim: true,
    },

    email: {
        type: String,
        required: [true, "email is required"],
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, "Please enter a password"],
        minlength: [6, "Password must be at least 6 characters"],
    },

    phone:{
        type:String,
        trim:true,
    },
    avatar: {
      type: String,
      default: "",
    },

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
    role:{
        type:String,
        default:"customer",
        immutable:true
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    
}, { timestamps: true });


export const Customer = mongoose.model('Customer', customerSchema);