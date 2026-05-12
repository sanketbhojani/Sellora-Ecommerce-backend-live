import jwt from 'jsonwebtoken';
import env from 'dotenv'
env.config();
const generateToken = (userId, role) => {
    return jwt.sign(
        {
            id: userId,
            role: role
        },

        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || "7d" }

    );

}

export default generateToken;