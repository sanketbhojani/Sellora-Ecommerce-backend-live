import jwt from 'jsonwebtoken';
import { Seller } from '../models/Seller.js';
import { Admin } from '../models/Admin.js';
import { Customer } from '../models/Customer.js';
import env from 'dotenv'
env.config();


const getModelByRole = (role) => {
    const r = role?.toLowerCase();
    if (r === "seller") return Seller;
    if (r === "admin") return Admin;
    return Customer;
};

// protect :- login or not check 
const protect = async (req, res, next) => {
    try {
        let token;
        const requestedRole = req.headers['x-role'];

        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }
        else if (req.cookies) {
            if (requestedRole === 'admin') {
                token = req.cookies.adminToken;
            } else if (requestedRole === 'seller') {
                token = req.cookies.sellerToken;
            } else if (requestedRole === 'customer') {
                token = req.cookies.customerToken;
            } else {
                // Default fallback if no x-role header
                token = req.cookies.token || req.cookies.customerToken || req.cookies.sellerToken || req.cookies.adminToken;
            }
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Not authorized. Please login first.",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const Model = getModelByRole(decoded.role);

        const user = await Model.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found. Token is invalid.",
            });
        }

        req.user = user;
        req.role = decoded.role;

        // Strict role check: if x-role header is present, it MUST match the token role
        if (requestedRole && requestedRole !== decoded.role) {
            return res.status(401).json({
                success: false,
                message: `Not authorized. You are trying to access ${requestedRole} area with a ${decoded.role} account.`
            });
        }

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Token is invalid or expired. Please login again.",
        });
    }
};


//Access cehck :;-
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Only ${roles.join(", ")} can access this`
            });
        }
        next();
    };
};

export {
    protect, authorizeRoles
}