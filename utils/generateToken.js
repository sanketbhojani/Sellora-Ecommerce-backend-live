import jwt from 'jsonwebtoken';
import env from 'dotenv'
env.config();

const generateAccessToken = (userId, role) => {
    return jwt.sign(
        {
            id: userId,
            role: role
        },
        process.env.JWT_SECRET,
        { expiresIn: "15m" } // Access token expires in 15 minutes
    );
}

const generateRefreshToken = (userId, role) => {
    return jwt.sign(
        {
            id: userId,
            role: role
        },
        process.env.JWT_REFRESH_SECRET || (process.env.JWT_SECRET + 'refresh_secret_fallback'),
        { expiresIn: process.env.JWT_REFRESH_EXPIRE || "7d" } // Refresh token expires in 7 days
    );
}

export { generateAccessToken, generateRefreshToken };