import { Customer } from "../models/Customer.js";
import { Seller } from "../models/Seller.js";
import { Admin } from "../models/Admin.js";
import { v2 as cloudinary } from "cloudinary";

// ─── Helpers ─────────────────────────────────────────────────

const getModelByRole = (role) => {
    if (role === "seller") return Seller;
    if (role === "admin") return Admin;
    return Customer;
};

const getPublicIdFromUrl = (url) => {
    try {
        const parts = url.split("/upload/");
        const afterUpload = parts[1];
        const withoutVersion = afterUpload.replace(/^v\d+\//, "");
        return withoutVersion.replace(/\.[^/.]+$/, "");
    } catch {
        return null;
    }
};

// ─── GET PROFILE ──────────────────────────────────────────────

const getProfile = async (req, res) => {
    try {
        const Model = getModelByRole(req.role);

        const user = await Model.findById(req.user._id)
            .select("-password -otp -otpExpiry");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: user,
            message: "Profile fetched successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ─── UPDATE CUSTOMER PROFILE ──────────────────────────────────
// ✅ Customer can update: name, avatar
// ✅ Customer CANNOT change: email, phone

const updateCustomerProfile = async (req, res) => {
    try {
        const { name, email, phone } = req.body;

        // ✅ Block email and phone change
        if (email) {
            return res.status(400).json({
                success: false,
                message: "Email cannot be changed",
            });
        }

        if (phone) {
            return res.status(400).json({
                success: false,
                message: "Phone number cannot be changed",
            });
        }

        const customer = await Customer.findById(req.user._id);
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found",
            });
        }

        const updateData = {};
        if (name && name.trim()) updateData.name = name.trim();

        // ✅ Handle avatar upload
        const oldAvatar = customer.avatar || null;
        if (req.file) {
            updateData.avatar = req.file.path;
        }

        // ✅ Nothing to update
        if (Object.keys(updateData).length === 0) {
            if (req.file) {
                const publicId = getPublicIdFromUrl(req.file.path);
                if (publicId) await cloudinary.uploader.destroy(publicId);
            }
            return res.status(400).json({
                success: false,
                message: "Please provide at least one field to update",
            });
        }

        // ✅ Update DB first
        const updatedCustomer = await Customer.findByIdAndUpdate(
            req.user._id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select("-password -otp -otpExpiry");

        // ✅ Delete old avatar ONLY after successful DB update
        if (req.file && oldAvatar) {
            const publicId = getPublicIdFromUrl(oldAvatar);
            if (publicId) await cloudinary.uploader.destroy(publicId);
        }

        return res.status(200).json({
            success: true,
            data: updatedCustomer,
            message: "Profile updated successfully",
        });

    } catch (error) {
        if (req.file) {
            const publicId = getPublicIdFromUrl(req.file.path);
            if (publicId) await cloudinary.uploader.destroy(publicId);
        }
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ─── UPDATE SELLER PROFILE ────────────────────────────────────
// ✅ Seller can update: name, avatar, shopName, shopDescription
// ✅ Seller CANNOT change: email, phone

const updateSellerProfile = async (req, res) => {
    try {
        const { name, email, phone, shopName, shopDescription } = req.body;

        // ✅ Block email and phone change
        if (email) {
            return res.status(400).json({
                success: false,
                message: "Email cannot be changed",
            });
        }

        if (phone) {
            return res.status(400).json({
                success: false,
                message: "Phone number cannot be changed",
            });
        }

        const seller = await Seller.findById(req.user._id);
        if (!seller) {
            return res.status(404).json({
                success: false,
                message: "Seller not found",
            });
        }

        const updateData = {};
        if (name && name.trim()) updateData.name = name.trim();
        if (shopName && shopName.trim()) updateData.shopName = shopName.trim();
        if (shopDescription !== undefined) updateData.shopDescription = shopDescription.trim();

        // ✅ Handle avatar upload
        const oldAvatar = seller.avatar || null;
        if (req.file) {
            updateData.avatar = req.file.path;
        }

        // ✅ Nothing to update
        if (Object.keys(updateData).length === 0) {
            if (req.file) {
                const publicId = getPublicIdFromUrl(req.file.path);
                if (publicId) await cloudinary.uploader.destroy(publicId);
            }
            return res.status(400).json({
                success: false,
                message: "Please provide at least one field to update",
            });
        }

        // ✅ Update DB first
        const updatedSeller = await Seller.findByIdAndUpdate(
            req.user._id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select("-password -otp -otpExpiry");

        // ✅ Delete old avatar ONLY after successful DB update
        if (req.file && oldAvatar) {
            const publicId = getPublicIdFromUrl(oldAvatar);
            if (publicId) await cloudinary.uploader.destroy(publicId);
        }

        return res.status(200).json({
            success: true,
            data: updatedSeller,
            message: "Profile updated successfully",
        });

    } catch (error) {
        if (req.file) {
            const publicId = getPublicIdFromUrl(req.file.path);
            if (publicId) await cloudinary.uploader.destroy(publicId);
        }
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ─── UPDATE ADMIN PROFILE ─────────────────────────────────────
// ✅ Admin can update: name, phone, avatar
// ✅ Admin CANNOT change: email

const updateAdminProfile = async (req, res) => {
    try {
        const { name, phone, email } = req.body;

        // ✅ Block email change
        if (email) {
            return res.status(400).json({
                success: false,
                message: "Email cannot be changed",
            });
        }

        const admin = await Admin.findById(req.user._id);
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found",
            });
        }

        const updateData = {};
        if (name && name.trim()) updateData.name = name.trim();
        if (phone && phone.trim()) updateData.phone = phone.trim(); // ✅ Admin CAN change phone

        // ✅ Handle avatar upload
        const oldAvatar = admin.avatar || null;
        if (req.file) {
            updateData.avatar = req.file.path;
        }

        // ✅ Nothing to update
        if (Object.keys(updateData).length === 0) {
            if (req.file) {
                const publicId = getPublicIdFromUrl(req.file.path);
                if (publicId) await cloudinary.uploader.destroy(publicId);
            }
            return res.status(400).json({
                success: false,
                message: "Please provide at least one field to update",
            });
        }

        // ✅ Update DB first
        const updatedAdmin = await Admin.findByIdAndUpdate(
            req.user._id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select("-password -otp -otpExpiry");

        // ✅ Delete old avatar ONLY after successful DB update
        if (req.file && oldAvatar) {
            const publicId = getPublicIdFromUrl(oldAvatar);
            if (publicId) await cloudinary.uploader.destroy(publicId);
        }

        return res.status(200).json({
            success: true,
            data: updatedAdmin,
            message: "Profile updated successfully",
        });

    } catch (error) {
        if (req.file) {
            const publicId = getPublicIdFromUrl(req.file.path);
            if (publicId) await cloudinary.uploader.destroy(publicId);
        }
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ─── DELETE AVATAR ────────────────────────────────────────────
// ✅ Works for all roles

const deleteAvatar = async (req, res) => {
    try {
        const Model = getModelByRole(req.role);

        const user = await Model.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (!user.avatar) {
            return res.status(400).json({
                success: false,
                message: "No avatar to delete",
            });
        }

        // ✅ Delete from Cloudinary
        const publicId = getPublicIdFromUrl(user.avatar);
        if (publicId) {
            const result = await cloudinary.uploader.destroy(publicId);
            if (result.result !== "ok" && result.result !== "not found") {
                return res.status(500).json({
                    success: false,
                    message: "Failed to delete avatar from storage",
                });
            }
        }

        // ✅ Set empty string in DB after Cloudinary confirms
        const updatedUser = await Model.findByIdAndUpdate(
            req.user._id,
            { $set: { avatar: "" } },
            { new: true }
        ).select("-password -otp -otpExpiry");

        return res.status(200).json({
            success: true,
            data: updatedUser,
            message: "Avatar deleted successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export {
    getProfile,
    updateCustomerProfile,
    updateSellerProfile,
    updateAdminProfile,
    deleteAvatar,
};