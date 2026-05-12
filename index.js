import express from 'express'
import cors from 'cors'
import env from 'dotenv'
env.config();
import './config/db.js'
import router from './routes/router.js';
import cookieParser from 'cookie-parser';
import { authLimiter, generalLimiter, helmet,mongoSanitize } from './middlewares/securityMiddleware.js';
import errorHandler from './middlewares/errorMiddleware.js';
const app = express();

// ✅ CORS — allow React frontends
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:5176',
        'http://localhost:5177',
        'http://localhost:5178',
        process.env.FRONTEND_URL, // Allow deployed frontend URL
    ].filter(Boolean),
    credentials: true,
}));

// ✅ Security middlewares
// app.use(helmet());
// app.use(mongoSanitize());


app.use(express.json());
const port = +process.env.PORT || 6666;


app.use(cookieParser());

app.use('/api',router);

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

app.listen(port,()=>{
    console.log("Server is running on",port);
    
})
