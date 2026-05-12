
import rateLimit  from 'express-mongo-sanitize'
import helmet  from 'helmet'
import mongoSanitize  from 'express-mongo-sanitize'


// ✅ General rate limit — 100 requests per 15 minutes
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        message: "Too many requests. Please try again after 15 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});


// ✅ Auth rate limit — 10 requests per 15 minutes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        success: false,
        message: "Too many login attempts. Please try again after 15 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export { generalLimiter, authLimiter, helmet, mongoSanitize };
