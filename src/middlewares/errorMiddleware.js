import mongoose from 'mongoose';
import { ZodError } from 'zod';

const globalErrorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    let errors = [];

    if (err instanceof ZodError) {
        statusCode = 400;
        message = 'Validation failed';

        errors = err.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message
        }));
    } else if (err instanceof mongoose.Error.CastError) {
        statusCode = 400;
        message = 'Invalid resource ID';
    } else if (err instanceof mongoose.Error.ValidationError) {
        statusCode = 400;
        message = 'Validation failed';

        errors = Object.values(err.errors).map((validationError) => ({
            field: validationError.path,
            message: validationError.message
        }));
    } else if (err.code === 11000) {
        statusCode = 409;

        const field = err.keyValue
            ? Object.keys(err.keyValue)[0]
            : 'Field';

        message = `${field} already exists.`;
    }

    const isOperational = err.isOperational === true;
    const isKnownError =
        err instanceof ZodError ||
        err instanceof mongoose.Error.CastError ||
        err instanceof mongoose.Error.ValidationError ||
        err.code === 11000;

    if (
        statusCode >= 500 &&
        !isOperational &&
        !isKnownError
    ) {
        message = 'Internal Server Error';
        errors = [];
    }

    res.status(statusCode).json({
        success: false,
        message,
        errors,
        ...(process.env.NODE_ENV === 'development' && {
            stack: err.stack
        })
    });
};

export default globalErrorHandler;