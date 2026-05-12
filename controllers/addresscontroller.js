import mongoose from "mongoose";
import { Address } from "../models/Address.js";

const addAddress = async (req, res) => {
    try {
        const {
            fullname,
            phone,
            addressLine1,
            addressLine2,
            city,
            state,
            pincode,
            country,
            addressType,
            isDefault
        } = req.body;

        if (!fullname || !phone || !addressLine1 || !city || !state || !pincode) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields",
            });
        }

        // ✅ If this is default, unset all other defaults first
        if (isDefault) {
            await Address.updateMany(
                { user: req.user._id },
                { $set: { isDefault: false } }
            );
        }

        const address = new Address({
            user: req.user._id,
            fullname: fullname.trim(),
            phone: phone,
            addressLine1: addressLine1.trim(),
            addressLine2: addressLine2 ? addressLine2.trim() : "",
            city: city.trim(),
            state: state.trim(),
            pincode: pincode,
            country: country ? country.trim() : "India",
            addressType: addressType || "home",
            isDefault: isDefault || false,
        });

        await address.save();

        await address.populate("user", "name email phone");

        return res.status(201).json({
            success: true,
            data: address,
            message: "Address added successfully",
        });
    } catch (error) {
        return res.status(500).json({
            sucess: false,
            message: error.message
        })
    }
}

const getAddresses = async (req, res) => {
    try {
        const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1 });

        return res.status(200).json({
            success: true,
            total: addresses.length,
            data: addresses,
            message: "Addresses fetched successfully",
        });
    } catch (error) {
        return res.status(500).json({
            sucess: false,
            message: error.message
        })
    }
}

const getAddressById  = async(req,res)=>{
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid address ID",
            });
        }

        const address = await Address.findOne({
            _id:req.params.id,
            user:req.user._id
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: address,
            message: "Address fetched successfully",
        });
        
    } catch (error) {
        return res.status(500).json({
            sucess:false,
            message:error.message
        })
    }
}
const updateAddress = async (req, res) => {
    try {
        // ✅ ObjectId validation
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid address ID",
            });
        }


        const address = await Address.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found",
            });
        }

        // ✅ If setting as default, unset all others first
        if (req.body.isDefault) {
            await Address.updateMany(
                { user: req.user._id },
                { $set: { isDefault: false } }
            );
        }

        // ✅ Whitelist allowed fields — prevent injection
        const allowedUpdates = {};
        const fields = [
            "fullname", "phone", "addressLine1", "addressLine2",
            "city", "state", "pincode", "country", "addressType", "isDefault",
        ];
        fields.forEach((f) => {
            if (req.body[f] !== undefined) allowedUpdates[f] = req.body[f];
        });


        const updatedAddress = await Address.findByIdAndUpdate(
            req.params.id,
            { $set: allowedUpdates },
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            success: true,
            data: updatedAddress,
            message: "Address updated successfully",
        });
    } catch (error) {
        return res.status(500).json({
            sucess: false,
            message: error.message
        })
    }
}
const setDefaultAddress  = async(req,res)=>{
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid address ID",
            });
        }

        const address = await Address.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found",
            });
        }


        // ✅ Remove default from all addresses
        await Address.updateMany(
            { user: req.user._id },
            { $set: { isDefault: false } }
        );

        // ✅ Set this address as default
        address.isDefault = true;
        await address.save();

        return res.status(200).json({
            success: true,
            data: address,
            message: "Default address updated successfully",
        });
    } catch (error) {
        return res.status(500).json({
            sucess:false,
            message:error.message
        })
    }
}
const deleteAddress = async (req, res) => {
    try {
        // ✅ ObjectId validation
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid address ID",
            });
        }

        // ✅ Make sure address belongs to this user
        const address = await Address.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found",
            });
        }

        // ✅ Fixed: was deleteOne() with no filter — deletes random document
        await Address.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Address deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            sucess: false,
            message: error.message
        })
    }
}
export {
    addAddress, getAddresses, updateAddress, deleteAddress,getAddressById,setDefaultAddress
}