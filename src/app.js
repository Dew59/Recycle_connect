import express from 'express';
import AppError from './utils/AppError.js';
import errorMiddleware from './middlewares/errorMiddleware.js';

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Handle unknown routes
app.use((req, res, next) => {
    next(new AppError('Route not found', 404));
});

// Central error handler
app.use(errorMiddleware);

export default app;