import { Customer } from "../models/Customer.js";
import { Seller } from "../models/Seller.js";
import { Admin } from "../models/Admin.js";
import { v2 as cloudinary } from "cloudinary";
import bcrypt from "bcryptjs";
import generateOTP from "../utils/generateOTP.js";
import { sendOTPEmail, sendPasswordResetEmail } from "../utils/sendEmail.js";
import generateToken from "../utils/generateToken.js";
import mongoose from "mongoose";

// ─── Helper ───────────────────────────────────────────────────

const getModelByRole = (role) => {
    const r = role?.toLowerCase();
    if (r === "seller") return Seller;
    if (r === "admin") return Admin;
    return Customer;
};

const getCookieNameByRole = (role) => {
    const r = role?.toLowerCase();
    if (r === "seller") return "sellerToken";
    if (r === "admin") return "adminToken";
    return "customerToken";
};

// ─── REGISTER CUSTOMER ────────────────────────────────────────

const registerCustomer = async (req, res) => {
    try {
        const { name, email, password, confirmPassword, phone } = req.body;

        if (!name || !email || !password || !confirmPassword || !phone) {
            return res.status(400).json({
                success: false,
                message: "All fields required",
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password and confirm password do not match",
            });
        }

        const exists = await Customer.findOne({ email });
        if (exists) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
            });
        }

        const { otp, otpExpiry } = generateOTP();
        const hashedPassword = await bcrypt.hash(password, 10);

        const newCustomer = new Customer({
            name,
            email,
            password: hashedPassword,
            phone,
            otp,
            otpExpiry,
        });

        await newCustomer.save();

        // ✅ Await email for better debugging
        console.log("Calling sendOTPEmail for customer registration...");
        const emailRes = await sendOTPEmail({ name, email, otp, role: "Customer" });
        console.log("sendOTPEmail call finished.");

        return res.status(201).json({
            success: true,
            data: {
                _id: newCustomer._id,
                name: newCustomer.name,
                email: newCustomer.email,
                isVerified: newCustomer.isVerified,
                // ✅ DEV/DEBUG ONLY: expose OTP if email fails or in debug mode
                ...((process.env.NODE_ENV !== 'production' || process.env.DEBUG_OTP === 'true' || !emailRes.success) && { otp }),
            },
            message: emailRes.success 
                ? "Customer registered successfully. OTP sent to email. Check your inbox."
                : `Customer registered, but OTP email failed to send. Error: ${emailRes.error}. (Tip: If you are the developer, check the OTP in this response data).`,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ─── REGISTER SELLER ──────────────────────────────────────────

const registerSeller = async (req, res) => {
    try {
        const { name, email, password, confirmPassword, phone, shopName, shopDescription } = req.body;

        if (!name || !email || !password || !confirmPassword || !phone || !shopName) {
            return res.status(400).json({
                success: false,
                message: "Please provide name, email, password, confirm password, phone and shop name",
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password and confirm password do not match",
            });
        }

        const exists = await Seller.findOne({ email });
        if (exists) {
            return res.status(400).json({
                success: false,
                message: "Seller already exists",
            });
        }

        const { otp, otpExpiry } = generateOTP();
        const hashedPassword = await bcrypt.hash(password, 10);

        const newSeller = new Seller({
            name,
            email,
            password: hashedPassword,
            phone,
            shopName,
            shopDescription,
            otp,
            otpExpiry,
        });

        await newSeller.save();

        // ✅ Await email
        console.log("Calling sendOTPEmail for seller registration...");
        const emailRes = await sendOTPEmail({ name, email, otp, role: "Seller" });

        return res.status(201).json({
            success: true,
            data: {
                _id: newSeller._id,
                name: newSeller.name,
                email: newSeller.email,
                shopName: newSeller.shopName,
                isVerified: newSeller.isVerified,
                isApproved: newSeller.isApproved,
                // ✅ DEV/DEBUG ONLY: expose OTP if email fails or in debug mode
                ...((process.env.NODE_ENV !== 'production' || process.env.DEBUG_OTP === 'true' || !emailRes.success) && { otp }),
            },
            message: emailRes.success 
                ? "Seller registered successfully. OTP sent to email. Check your inbox."
                : `Seller registered, but OTP email failed to send. Error: ${emailRes.error}. (Tip: If you are the developer, check the OTP in this response data).`,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ─── REGISTER ADMIN ───────────────────────────────────────────

const registerAdmin = async (req, res) => {
    try {
        const { name, email, password, confirmPassword, phone, isSuperAdmin } = req.body;

        if (!name || !email || !password || !confirmPassword || !phone) {
            return res.status(400).json({
                success: false,
                message: "Please provide name, email, password, confirm password and phone",
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password and confirm password do not match",
            });
        }

        const exists = await Admin.findOne({ email });
        if (exists) {
            return res.status(400).json({
                success: false,
                message: "Email already registered as admin",
            });
        }

        const { otp, otpExpiry } = generateOTP();
        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = new Admin({
            name,
            email,
            password: hashedPassword,
            phone,
            isSuperAdmin: isSuperAdmin || false,
            otp,
            otpExpiry,
        });

        await newAdmin.save();

        // ✅ Await email
        console.log(`[Admin] Registering admin: ${email}. Triggering OTP email...`);
        const emailRes = await sendOTPEmail({ name, email, otp, role: "Admin" });
        
        if (emailRes.success) {
            console.log(`✅ [Admin] OTP email sent successfully to ${email}`);
        } else {
            console.error(`❌ [Admin] OTP email failed for ${email}:`, emailRes.error);
        }

        return res.status(201).json({
            success: true,
            data: {
                _id: newAdmin._id,
                name: newAdmin.name,
                email: newAdmin.email,
                isVerified: newAdmin.isVerified,
                // ✅ DEV/DEBUG ONLY: expose OTP if email fails or in debug mode
                ...((process.env.NODE_ENV !== 'production' || process.env.DEBUG_OTP === 'true' || !emailRes.success) && { otp }),
            },
            message: emailRes.success 
                ? "Admin created successfully. OTP sent to email. Check your inbox."
                : `Admin created, but OTP email failed to send. Error: ${emailRes.error}. (Tip: If you are the developer, check the OTP in this response data).`,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ─── VERIFY OTP ───────────────────────────────────────────────

const verifyOTP = async (req, res) => {
    try {
        const { userId, otp, role = "customer" } = req.body;

        // ✅ Validate required fields
        if (!userId || !otp) {
            return res.status(400).json({
                success: false,
                message: "Please provide user ID and OTP",
            });
        }

        // ✅ Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID",
            });
        }

        const Model = getModelByRole(role);

        // ✅ Find by _id instead of email
        const user = await Model.findById(userId).select("+otp +otpExpiry");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No account found with this ID",
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: "Email is already verified",
            });
        }

        if (String(otp) !== String(user.otp)) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP. Please check your email.",
            });
        }

        if (user.otpExpiry < new Date()) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new one.",
            });
        }

        user.isVerified = true;
        user.otp = null;
        user.otpExpiry = null;
        await user.save();

        const token = generateToken(user._id, role);

        const cookieName = getCookieNameByRole(role);
        res.cookie(cookieName, token, {
            httpOnly: true,
            sameSite: "strict",
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                phone: user.phone,
                shopName: user.shopName,
                isVerified: user.isVerified,
                isSuperAdmin: user.isSuperAdmin,
                permissions: user.permissions,
                token,
            },
            message: "Email verified successfully! You can now login.",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ─── RESEND OTP ───────────────────────────────────────────────

const resendOTP = async (req, res) => {
    try {
        const { userId, role = "customer" } = req.body;

        // ✅ Validate required fields
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "Please provide user ID",
            });
        }

        // ✅ Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID",
            });
        }

        const Model = getModelByRole(role);

        // ✅ Find by _id instead of email
        const user = await Model.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No account found with this ID",
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: "Email is already verified",
            });
        }

        const { otp, otpExpiry } = generateOTP();
        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save();

        // ✅ Await email
        const emailRes = await sendOTPEmail({ name: user.name, email: user.email, otp, role });

        return res.status(200).json({
            success: true,
            message: emailRes.success 
                ? "A new OTP has been sent to your email."
                : `Failed to send OTP: ${emailRes.error}. Please check your EMAIL_USER/PASS.`,
            ...((process.env.NODE_ENV !== 'production' || process.env.DEBUG_OTP === 'true') && { otp }),
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ─── LOGIN ────────────────────────────────────────────────────

const login = async (req, res) => {
    try {
        const { email, password, role = "customer" } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide email and password",
            });
        }

        const Model = getModelByRole(role);
        const user = await Model.findOne({ email }).select("+password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: `No ${role} account found with this email`,
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Your account has been deactivated",
            });
        }

        if (!user.isVerified) {
            return res.status(403).json({
                success: false,
                message: "Please verify your email using OTP before logging in",
                data: {
                    userId: user._id,
                    role: role
                }
            });
        }

        if (role === "seller" && !user.isApproved) {
            return res.status(403).json({
                success: false,
                message: "Your seller account is pending admin approval",
            });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        const token = generateToken(user._id, role);

        const cookieName = getCookieNameByRole(role);
        res.cookie(cookieName, token, {
            httpOnly: true,
            sameSite: "strict",
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                phone: user.phone,
                shopName: user.shopName,
                isSuperAdmin: user.isSuperAdmin,
                permissions: user.permissions,
                token,
            },
            message: "Login successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ─── CHANGE PASSWORD ──────────────────────────────────────────

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmNewPassword } = req.body;

        if (!currentPassword || !newPassword || !confirmNewPassword) {
            return res.status(400).json({
                success: false,
                message: "Please provide current password, new password and confirm new password",
            });
        }

        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({
                success: false,
                message: "New password and confirm new password do not match",
            });
        }

        if (currentPassword === newPassword) {
            return res.status(400).json({
                success: false,
                message: "New password must be different from current password",
            });
        }

        const Model = getModelByRole(req.role);  
        const user = await Model.findById(req.user._id).select("+password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Current password is incorrect",
            });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password changed successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ─── FORGOT PASSWORD ──────────────────────────────────────────

const forgotPassword = async (req, res) => {
    try {
        const { email, role = "customer" } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Please provide your email address",
            });
        }

        const Model = getModelByRole(role);
        const user = await Model.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No account found with this email",
            });
        }

        const { otp, otpExpiry } = generateOTP();
        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save();

        // ✅ Await email
        const emailRes = await sendPasswordResetEmail({ name: user.name, email: user.email, otp, role });

        return res.status(200).json({
            success: true,
            message: emailRes.success 
                ? "A password reset code has been sent to your email."
                : `Failed to send reset email: ${emailRes.error}. Please check your EMAIL_USER/PASS.`,
            ...((process.env.NODE_ENV !== 'production' || process.env.DEBUG_OTP === 'true') && { otp }),
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ─── RESET PASSWORD ───────────────────────────────────────────

const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword, confirmNewPassword, role = "customer" } = req.body;

        if (!email || !otp || !newPassword || !confirmNewPassword) {
            return res.status(400).json({
                success: false,
                message: "Please provide email, OTP, new password and confirm new password",
            });
        }

        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({
                success: false,
                message: "New password and confirm new password do not match",
            });
        }

        const Model = getModelByRole(role);
        const user = await Model.findOne({ email }).select("+otp +otpExpiry");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No account found with this email",
            });
        }

        if (String(otp) !== String(user.otp)) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP code",
            });
        }

        if (user.otpExpiry < new Date()) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new one.",
            });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.otp = null;
        user.otpExpiry = null;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password reset successfully. You can now login.",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ─── GET ME ───────────────────────────────────────────────────

const getMe = async (req, res) => {
    try {
        const Model = getModelByRole(req.role);
        const user = await Model.findById(req.user._id).select("-password -otp -otpExpiry");

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

// ─── LOGOUT ───────────────────────────────────────────────────

const logout = async (req, res) => {
    try {
        const role = req.headers['x-role'] || req.role || 'customer';
        const cookieName = getCookieNameByRole(role);

        res.clearCookie(cookieName, {
            httpOnly: true,
            sameSite: "strict",
        });

        // Also clear generic token cookie just in case
        res.clearCookie("token", {
            httpOnly: true,
            sameSite: "strict",
        });

        return res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const initiateManualVerification = async (req, res) => {
    try {
        const { email, role = "customer" } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Please provide your email address",
            });
        }

        const Model = getModelByRole(role);
        const user = await Model.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No account found with this email",
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: "Email is already verified. Please login.",
            });
        }

        const { otp, otpExpiry } = generateOTP();
        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save();

        const emailRes = await sendOTPEmail({ name: user.name, email: user.email, otp, role });

        return res.status(200).json({
            success: true,
            message: "A verification code has been sent to your email.",
            data: {
                userId: user._id,
                role: role
            },
            ...((process.env.NODE_ENV !== 'production' || process.env.DEBUG_OTP === 'true') && { otp }),
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export {
    registerCustomer,
    registerSeller,
    registerAdmin,
    verifyOTP,
    resendOTP,
    login,
    changePassword,
    forgotPassword,
    resetPassword,
    getMe,
    logout,
    initiateManualVerification
};