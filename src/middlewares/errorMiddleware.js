import mongoose from "mongoose";

const globalErrorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    if (err instanceof mongoose.Error.CastError) {
        error.statusCode = 400;
        error.message = "Invalid resourse ID"
    };

    if (err instanceof mongoose.Error.ValidationError) {
        error.statusCode = 400;
        error.message = Object.values(err.errors)
            .map((e) => e.message)
            .join(", ");
    }

    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        error.statusCode = 409;
        error.message = `${field} already exists.`
    }

    if (err.isOperational) {
        return res.status(error.statusCode).json({
            status: err.status || "error",
            message: err.message,
        });
    }

    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
        ...(process.env.NODE_ENV === "development" && {
            stack: err.stack
        })
    })
};

export default globalErrorHandler;