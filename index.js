import express from 'express'
import cors from 'cors'
import env from 'dotenv'
env.config();
import './config/db.js'
import router from './routes/router.js';
import cookieParser from 'cookie-parser';
import { authLimiter, generalLimiter, helmet, mongoSanitize } from './middlewares/securityMiddleware.js';
import errorHandler from './middlewares/errorMiddleware.js';
import { swaggerDocs } from './config/swagger.js';

const app = express();

// ✅ CORS — allow all origins
app.use(cors({
    origin: true,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-role'],
}));

// ✅ Security middlewares
// app.use(helmet());
// app.use(mongoSanitize());

app.use(express.json());
const port = +process.env.PORT || 6666;
app.use(cookieParser());

// ✅ TEMP DEBUG EMAIL ROUTE — remove after fixing
app.get('/test-email', async (req, res) => {
    const nodemailer = (await import('nodemailer')).default;
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    try {
        await transporter.verify();
        res.json({
            success: true,
            message: 'SMTP works!',
            user: process.env.EMAIL_USER
        });
    } catch (err) {
        res.json({
            success: false,
            error: err.message,
            code: err.code,
            user: process.env.EMAIL_USER || 'NOT SET',
            pass: process.env.EMAIL_PASS ? `SET (${process.env.EMAIL_PASS.length} chars)` : 'NOT SET'
        });
    }
});

app.use('/api', router);

// ✅ Initialize Swagger Docs
swaggerDocs(app);

// ✅ Rate limiting
// app.use("/api", generalLimiter);
// app.use("/api", authLimiter);

// ✅ 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
    });
});

// ✅ Global error handler — must be last
app.use(errorHandler);

app.listen(port, () => {
    console.log("Server is running on", port);
})