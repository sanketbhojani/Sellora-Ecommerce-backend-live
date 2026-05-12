
import mongoose from 'mongoose'

const addressSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Customer',
        required:true
    },

    fullname:{
        type:String,
        required:[true,'Please Enter your fullname'],
        trim:true
    },
    phone:{
        type:String,
        required:[true,'Please enter your phone number']
    },
    addressLine1:{
        type:String,
        required:[true,'please enter address'],
        trim:true
    },
    addressLine2:{
        type:String,
        trim:true,
        default:""
    },
    city:{
        type:String,
        required:[true,'please enter city'],
        trim:true
    },
    state:{
        type:String,
        required:[true,'please enter state'],
        trim:true
    },
    pincode:{
        type:String,
        required:[true,'enter your pincode'],
    },
    country:{
        type:String,
        default:'India'
    },
    isDefault:{
        type:Boolean,
        default:false
    },
    addressType:{
        type:String,
        enum:["home","work","other"],
        default:"home"
    }

},{timestamps:true});

export const Address = mongoose.model('Address',addressSchema);