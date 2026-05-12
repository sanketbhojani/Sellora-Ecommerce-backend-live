

const errorHandler  = (err,req,res,next) =>{
    let statusCode  = err.statusCode || 500;
    let message = err.message || "Internal Server Error";


    // ✅ Mongoose bad ObjectId
    if (err.name === "CastError") {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
    }


    // ✅ Mongoose bad ObjectId
    if (err.name === "CastError") {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
    }

    // ✅ Mongoose validation error
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(err.errors)
            .map((e) => e.message)
            .join(", ");
    }

    // ✅ JWT errors
    if (err.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid token. Please login again.";
    }

    if (err.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Token expired. Please login again.";
    }


    return res.status(statusCode).json({
        success: false,
        message,
        // ✅ Only show stack in development
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
}

export default errorHandler;