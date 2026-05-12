import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
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
        required: [true, "Please enter a password"],
        minlength: [6, "Password must be at least 6 characters"],
    },

    phone:{
        type:String,
    },
    avatar: {
      type: String,
      default: "",
    },


    // Admin-specific permissions
    // Super admin can create other admins

    isSuperAdmin:{
        type:Boolean,
        default:false
    },
    permissions:{
        manageProducts:{
            type:Boolean,
            default:true
        },
        manageSellers:{
            type:Boolean,
            default:true
        },
        manageOrders:{
            type:Boolean,
            default:true
        },
        manageCustomers:{
            type:Boolean,
            default:true
        }
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

    role: {
      type: String,
      default: "admin",
      immutable: true,
    }
},{timestamps:true});


export const Admin = mongoose.model('Admin',adminSchema);