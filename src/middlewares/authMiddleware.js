import jwt from 'jsonwebtoken';
import AppError from '../utils/AppError.js';

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return next(new AppError('Authentication token is required', 401));
    }

    if (!authHeader.startsWith('Bearer ')) {
        return next(
            new AppError(
                'Invalid authorization format. Use Bearer <token>',
                401
            )
        );
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return next(new AppError('Authentication token is required', 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = {
            id: decoded.id,
            role: decoded.role
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return next(new AppError('Authentication token has expired', 401));
        }

        if (error.name === 'JsonWebTokenError') {
            return next(new AppError('Invalid authentication token', 401));
        }

        return next(new AppError('Authentication failed', 401));
    }
};

export default authMiddleware;