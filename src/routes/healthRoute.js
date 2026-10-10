
import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/', (req, res) => {
    const isDatabaseConnected = mongoose.connection.readyState === 1;

    if (!isDatabaseConnected) {
        return res.status(503).json({
            success: false,
            message: 'Recycle Connect API is unavailable',
            status: 'unhealthy',
            database: 'disconnected',
            timestamp: new Date().toISOString()
        });
    }

    return res.status(200).json({
        success: true,
        message: 'Recycle Connect API is healthy',
        status: 'healthy',
        database: 'connected',
        timestamp: new Date().toISOString()
    });
});

export default router;
