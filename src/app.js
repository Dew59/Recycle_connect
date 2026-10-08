import express from 'express';
import AppError from './utils/AppError.js';
import errorMiddleware from './middlewares/errorMiddleware.js';
import authRoutes from './routes/authRoute.js';
import adminRoutes from './routes/adminRoute.js';
import collectorRoutes from './routes/collectorRoute.js';
import materialRoutes from './routes/materialRoute.js';
import incentiveRateRoutes from './routes/incentiveRateRoute.js';
import pickupRoutes from './routes/pickupRoute.js';
import collectionRoutes from './routes/collectionRoute.js';
import incentiveTransactionRoutes from './routes/incentiveTransactionRoute.js';

const app = express();

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/collectors', collectorRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/incentive-rates', incentiveRateRoutes);
app.use('/api/pickups', pickupRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/collections', incentiveTransactionRoutes);

// Handle unknown routes
app.use((req, res, next) => {
    next(new AppError('Route not found', 404));
});

// Central error handler
app.use(errorMiddleware);

export default app;