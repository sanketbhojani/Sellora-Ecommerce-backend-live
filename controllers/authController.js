import { Customer } from "../models/Customer.js";
import { Seller } from "../models/Seller.js";
import { Admin } from "../models/Admin.js";
import { v2 as cloudinary } from "cloudinary";
import bcrypt from "bcryptjs";
import generateOTP from "../utils/generateOTP.js";
import { sendOTPEmail, sendPasswordResetEmail } from "../utils/sendEmail.js";
import { generateAccessToken, generateRefreshToken } from "../utils/generateToken.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

// ─── Helpers ──────────────────────────────────────────────────

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

const findUserAcrossRoles = async ({ userId, email }) => {
    const roles = ["customer", "seller", "admin"];
    for (const role of roles) {
        const Model = getModelByRole(role);
        let user;
        if (userId) {
            user = await Model.findById(userId).select("+otp +otpExpiry +password");
        } else if (email) {
            user = await Model.findOne({ email }).select("+otp +otpExpiry +password");
        }
        if (user) return { user, role };
    }
    return { user: null, role: null };
};

// ─── REGISTER CUSTOMER ────────────────────────────────────────

const registerCustomer = async (req, res) => {
    try {
        const { name, email, password, confirmPassword, phone } = req.body;

        if (!name || !email || !password || !confirmPassword || !phone) {
            return res.status(400).json({ success: false, message: "All fields required" });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ success: false, message: "Password and confirm password do not match" });
        }
        const exists = await Customer.findOne({ email });
        if (exists) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        const { otp, otpExpiry } = generateOTP();
        const hashedPassword = await bcrypt.hash(password, 10);

        const newCustomer = new Customer({ name, email, password: hashedPassword, phone, otp, otpExpiry });

        // ✅ Send email in background — never blocks response
        sendOTPEmail({ name, email, otp, role: "Customer" }).then(emailResult => {
            if (!emailResult.success) console.error("[Email Error - Customer]:", emailResult.error);
        }).catch(err => console.error("[Email Error - Customer]:", err.message));
        
        await newCustomer.save();

        return res.status(201).json({
            success: true,
            data: {
                _id: newCustomer._id,
                name: newCustomer.name,
                email: newCustomer.email,
                isVerified: newCustomer.isVerified,
                otp, // DEV only
            },
            message: "Registration successful. A verification code has been sent to your email.",
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─── REGISTER SELLER ──────────────────────────────────────────

const registerSeller = async (req, res) => {
    try {
        const { name, email, password, confirmPassword, phone, shopName, shopDescription } = req.body;

        if (!name || !email || !password || !confirmPassword || !phone || !shopName) {
            return res.status(400).json({ success: false, message: "Please provide name, email, password, confirm password, phone and shop name" });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ success: false, message: "Password and confirm password do not match" });
        }
        const exists = await Seller.findOne({ email });
        if (exists) {
            return res.status(400).json({ success: false, message: "Seller already exists" });
        }

        const { otp, otpExpiry } = generateOTP();
        const hashedPassword = await bcrypt.hash(password, 10);

        const newSeller = new Seller({ name, email, password: hashedPassword, phone, shopName, shopDescription, otp, otpExpiry });

        // ✅ Send email in background — never blocks response
        sendOTPEmail({ name, email, otp, role: "Seller" }).then(emailResult => {
            if (!emailResult.success) console.error("[Email Error - Seller]:", emailResult.error);
        }).catch(err => console.error("[Email Error - Seller]:", err.message));
        
        await newSeller.save();

        return res.status(201).json({
            success: true,
            data: {
                _id: newSeller._id,
                name: newSeller.name,
                email: newSeller.email,
                shopName: newSeller.shopName,
                isVerified: newSeller.isVerified,
                isApproved: newSeller.isApproved,
                otp, // DEV only
            },
            message: "Seller registered successfully. A verification code has been sent to your email.",
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─── REGISTER ADMIN ───────────────────────────────────────────

const registerAdmin = async (req, res) => {
    try {
        const { name, email, password, confirmPassword, phone, isSuperAdmin, permissions } = req.body;

        if (!name || !email || !password || !confirmPassword || !phone) {
            return res.status(400).json({ success: false, message: "Please provide name, email, password, confirm password and phone" });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ success: false, message: "Password and confirm password do not match" });
        }
        const exists = await Admin.findOne({ email });
        if (exists) {
            return res.status(400).json({ success: false, message: "Email already registered as admin" });
        }

        // Only Super Admins can create Super Admin accounts
        if (isSuperAdmin && (!req.user || !req.user.isSuperAdmin)) {
            return res.status(403).json({
                success: false,
                message: "Only Super Admins can create Super Admin accounts",
            });
        }

        const { otp, otpExpiry } = generateOTP();
        const hashedPassword = await bcrypt.hash(password, 10);

        // Permissions can only be restricted/assigned for regular Admins.
        // Force full permissions for Super Admins.
        const finalPermissions = isSuperAdmin
            ? {
                manageProducts: true,
                manageSellers: true,
                manageOrders: true,
                manageCustomers: true
            }
            : (permissions || {
                manageProducts: true,
                manageSellers: true,
                manageOrders: true,
                manageCustomers: true
            });

        const newAdmin = new Admin({
            name,
            email,
            password: hashedPassword,
            phone,
            isSuperAdmin: isSuperAdmin || false,
            permissions: finalPermissions,
            otp,
            otpExpiry
        });

        // ✅ Send email in background — never blocks response
        sendOTPEmail({ name, email, otp, role: "Admin" }).then(emailResult => {
            if (!emailResult.success) console.error("[Email Error - Admin]:", emailResult.error);
        }).catch(err => console.error("[Email Error - Admin]:", err.message));
        
        await newAdmin.save();

        return res.status(201).json({
            success: true,
            data: {
                _id: newAdmin._id,
                name: newAdmin.name,
                email: newAdmin.email,
                isVerified: newAdmin.isVerified,
                otp, // DEV only
            },
            message: "Admin created successfully. A verification code has been sent to your email.",
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─── VERIFY OTP ───────────────────────────────────────────────

const verifyOTP = async (req, res) => {
    try {
        const { userId, otp, role = "customer" } = req.body;

        if (!userId || !otp) {
            return res.status(400).json({ success: false, message: "Please provide user ID and OTP" });
        }
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: "Invalid user ID" });
        }

        let { user, role: detectedRole } = await findUserAcrossRoles({ userId });

        if (!user) {
            return res.status(404).json({ success: false, message: "No account found with this ID" });
        }
        if (user.isVerified) {
            return res.status(400).json({ success: false, message: "Email is already verified" });
        }
        if (String(otp) !== String(user.otp)) {
            return res.status(400).json({ success: false, message: "Invalid OTP. Please check your email." });
        }
        if (user.otpExpiry < new Date()) {
            return res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
        }

        user.isVerified = true;
        user.otp = null;
        user.otpExpiry = null;
        await user.save();

        const accessToken = generateAccessToken(user._id, detectedRole);
        const refreshToken = generateRefreshToken(user._id, detectedRole);
        
        user.refreshToken = refreshToken;
        await user.save();

        const cookieName = getCookieNameByRole(detectedRole);
        res.cookie(cookieName, accessToken, { httpOnly: true, sameSite: "strict", maxAge: 15 * 60 * 1000 });

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
                token: accessToken,
            },
            message: "Email verified successfully! You can now login.",
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─── RESEND OTP ───────────────────────────────────────────────

const resendOTP = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ success: false, message: "Please provide user ID" });
        }
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: "Invalid user ID" });
        }

        let { user, role: detectedRole } = await findUserAcrossRoles({ userId });

        if (!user) {
            return res.status(404).json({ success: false, message: "No account found with this ID" });
        }
        

        const actualRole = user.role || detectedRole;
        const { otp, otpExpiry } = generateOTP();

        // ✅ Save first — always succeeds
        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save();

        // ✅ Email in background — never blocks response
        sendOTPEmail({ name: user.name, email: user.email, otp, role: actualRole }).catch(err =>
            console.error("[Email] resendOTP failed:", err.message)
        );

        return res.status(200).json({
            success: true,
            message: "A new OTP has been sent to your email.",
            otp, // DEV only
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─── LOGIN ────────────────────────────────────────────────────

const login = async (req, res) => {
    try {
        const { email, password, role = "customer" } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Please provide email and password" });
        }

        const Model = getModelByRole(role);
        const user = await Model.findOne({ email }).select("+password");

        if (!user) {
            return res.status(401).json({ success: false, message: `No ${role} account found with this email` });
        }
        if (!user.isActive) {
            return res.status(403).json({ success: false, message: "Your account has been deactivated" });
        }
        if (!user.isVerified) {
            return res.status(403).json({
                success: false,
                message: "Please verify your email using OTP before logging in",
                data: { userId: user._id, role }
            });
        }
        if (role === "seller" && !user.isApproved) {
            return res.status(403).json({ success: false, message: "Your seller account is pending admin approval" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        const accessToken = generateAccessToken(user._id, role);
        const refreshToken = generateRefreshToken(user._id, role);
        
        user.refreshToken = refreshToken;
        await user.save();

        const cookieName = getCookieNameByRole(role);
        res.cookie(cookieName, accessToken, { httpOnly: true, sameSite: "strict", maxAge: 15 * 60 * 1000 });

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
                token: accessToken,
            },
            message: "Login successfully",
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─── CHANGE PASSWORD ──────────────────────────────────────────

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmNewPassword } = req.body;

        if (!currentPassword || !newPassword || !confirmNewPassword) {
            return res.status(400).json({ success: false, message: "Please provide current password, new password and confirm new password" });
        }
        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ success: false, message: "New password and confirm new password do not match" });
        }
        if (currentPassword === newPassword) {
            return res.status(400).json({ success: false, message: "New password must be different from current password" });
        }

        const Model = getModelByRole(req.role);
        const user = await Model.findById(req.user._id).select("+password");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Current password is incorrect" });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        return res.status(200).json({ success: true, message: "Password changed successfully" });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─── FORGOT PASSWORD ──────────────────────────────────────────

const forgotPassword = async (req, res) => {
    try {
        const { email, role } = req.body;

        if (!email || !role) {
            return res.status(400).json({ success: false, message: "Please provide email and role" });
        }

        const Model = getModelByRole(role);
        const user = await Model.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: `No ${role} account found with this email` });
        }

        const { otp, otpExpiry } = generateOTP();

        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save();

        // Email in background
        sendPasswordResetEmail({ name: user.name, email: user.email, otp, role }).catch(err =>
            console.error("[Email] forgotPassword failed:", err.message)
        );

        return res.status(200).json({
            success: true,
            message: `A password reset code has been sent to your ${role} email.`,
            userId: user._id,
            otp, // DEV only
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─── VERIFY PASSWORD RESET OTP ────────────────────────────────

const verifyPasswordResetOTP = async (req, res) => {
    try {
        const { userId, email, otp, role } = req.body;

        if ((!userId && !email) || !otp) {
            return res.status(400).json({ success: false, message: "Please provide user ID/email and OTP" });
        }

        let user;
        if (userId) {
            const result = await findUserAcrossRoles({ userId });
            user = result.user;
        } else {
            const Model = getModelByRole(role);
            user = await Model.findOne({ email }).select("+otp +otpExpiry");
        }

        if (!user) {
            return res.status(404).json({ success: false, message: "No account found" });
        }
        if (String(otp) !== String(user.otp)) {
            return res.status(400).json({ success: false, message: "Invalid OTP code" });
        }
        if (user.otpExpiry < new Date()) {
            return res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
        }

        return res.status(200).json({ success: true, message: "OTP verified successfully. You can now reset your password.", userId: user._id });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─── RESET PASSWORD ───────────────────────────────────────────

const resetPassword = async (req, res) => {
    try {
        const { userId, email, role, otp, newPassword, confirmNewPassword } = req.body;

        if ((!userId && !email) || !otp || !newPassword || !confirmNewPassword) {
            return res.status(400).json({ success: false, message: "Please provide all required fields" });
        }
        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ success: false, message: "New password and confirm new password do not match" });
        }

        let user;
        if (userId) {
            const result = await findUserAcrossRoles({ userId });
            user = result.user;
        } else {
            const Model = getModelByRole(role);
            user = await Model.findOne({ email }).select("+otp +otpExpiry");
        }

        if (!user) {
            return res.status(404).json({ success: false, message: "No account found" });
        }
        if (String(otp) !== String(user.otp)) {
            return res.status(400).json({ success: false, message: "Invalid OTP code" });
        }
        if (user.otpExpiry < new Date()) {
            return res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.otp = null;
        user.otpExpiry = null;
        await user.save();

        return res.status(200).json({ success: true, message: "Password reset successfully. You can now login." });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─── GET ME ───────────────────────────────────────────────────

const getMe = async (req, res) => {
    try {
        const Model = getModelByRole(req.role);
        const user = await Model.findById(req.user._id).select("-password -otp -otpExpiry");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({ success: true, data: user, message: "Profile fetched successfully" });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─── LOGOUT ───────────────────────────────────────────────────

const logout = async (req, res) => {
    try {
        const role = req.headers['x-role'] || req.role || 'customer';
        const cookieName = getCookieNameByRole(role);

        if (req.user) {
            const Model = getModelByRole(req.user.role || role);
            await Model.findByIdAndUpdate(req.user._id, { refreshToken: null });
        }

        res.clearCookie(cookieName, { httpOnly: true, sameSite: "strict" });
        res.clearCookie("token", { httpOnly: true, sameSite: "strict" });

        return res.status(200).json({ success: true, message: "Logged out successfully" });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─── INITIATE MANUAL VERIFICATION ────────────────────────────

const initiateManualVerification = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: "Please provide your email address" });
        }

        let { user, role: detectedRole } = await findUserAcrossRoles({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: "No account found with this email" });
        }
        if (user.isVerified) {
            return res.status(400).json({ success: false, message: "Email is already verified. Please login." });
        }

        const actualRole = user.role || detectedRole;
        const { otp, otpExpiry } = generateOTP();

        // ✅ Save first — always succeeds
        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save();

        // ✅ Email in background — never blocks response
        sendOTPEmail({ name: user.name, email: user.email, otp, role: actualRole }).catch(err =>
            console.error("[Email] initiateManualVerification failed:", err.message)
        );

        return res.status(200).json({
            success: true,
            message: "A verification code has been sent to your email.",
            data: { userId: user._id, role: actualRole },
            otp, // DEV only
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─── FORGOT PASSWORD 2 (Role Specific) ───────────────────────

const forgetpassword2 = async (req, res) => {
    try {
        const { email, role } = req.body;

        if (!email || !role) {
            return res.status(400).json({ success: false, message: "Please provide email and role" });
        }

        const Model = getModelByRole(role);
        const user = await Model.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: `No ${role} account found with this email` });
        }

        const { otp, otpExpiry } = generateOTP();

        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save();

        // Email in background
        sendPasswordResetEmail({ name: user.name, email: user.email, otp, role }).catch(err =>
            console.error("[Email] forgetpassword2 failed:", err.message)
        );

        return res.status(200).json({
            success: true,
            message: `A password reset code has been sent to your ${role} email.`,
            userId: user._id,
            otp, // DEV only
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─── RESET PASSWORD 2 ─────────────────────────────────────────

const resetpassword2 = async (req, res) => {
    try {
        const { userId, email, role, otp, newPassword, confirmNewPassword } = req.body;

        if ((!userId && !email) || !otp || !newPassword || !confirmNewPassword) {
            return res.status(400).json({ success: false, message: "Please provide all required fields" });
        }
        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ success: false, message: "New password and confirm new password do not match" });
        }

        let user;
        if (userId) {
            const result = await findUserAcrossRoles({ userId });
            user = result.user;
        } else {
            const Model = getModelByRole(role);
            user = await Model.findOne({ email }).select("+otp +otpExpiry");
        }

        if (!user) {
            return res.status(404).json({ success: false, message: "No account found" });
        }
        if (String(otp) !== String(user.otp)) {
            return res.status(400).json({ success: false, message: "Invalid OTP code" });
        }
        if (user.otpExpiry < new Date()) {
            return res.status(400).json({ success: false, message: "OTP has expired" });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.otp = null;
        user.otpExpiry = null;
        await user.save();

        return res.status(200).json({ success: true, message: "Password reset successfully. You can now login." });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─── REFRESH TOKEN ────────────────────────────────────────────

const refreshToken = async (req, res) => {
    try {
        const role = req.headers['x-role'] || 'customer';
        const cookieName = getCookieNameByRole(role);
        
        let accessToken = req.cookies[cookieName];
        if (!accessToken && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            accessToken = req.headers.authorization.split(' ')[1];
        }

        if (!accessToken) {
            return res.status(401).json({ success: false, message: "No access token found" });
        }

        let decoded;
        try {
            decoded = jwt.verify(accessToken, process.env.JWT_SECRET, { ignoreExpiration: true });
        } catch (err) {
            return res.status(401).json({ success: false, message: "Invalid access token" });
        }

        const Model = getModelByRole(decoded.role);
        const user = await Model.findById(decoded.id);

        if (!user || !user.refreshToken) {
            return res.status(401).json({ success: false, message: "Invalid session" });
        }

        // Verify the stored refresh token
        try {
            jwt.verify(user.refreshToken, process.env.JWT_REFRESH_SECRET || (process.env.JWT_SECRET + 'refresh_secret_fallback'));
        } catch (err) {
            user.refreshToken = null;
            await user.save();
            return res.status(401).json({ success: false, message: "Session expired, please login again" });
        }

        const newAccessToken = generateAccessToken(user._id, decoded.role);
        const newRefreshToken = generateRefreshToken(user._id, decoded.role);
        
        user.refreshToken = newRefreshToken;
        await user.save();

        res.cookie(cookieName, newAccessToken, { httpOnly: true, sameSite: "strict", maxAge: 15 * 60 * 1000 });

        return res.status(200).json({ success: true, token: newAccessToken });

    } catch (error) {
        return res.status(401).json({ success: false, message: "Failed to refresh token" });
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
    initiateManualVerification,
    forgetpassword2,
    resetpassword2,
    refreshToken,
    verifyPasswordResetOTP
};