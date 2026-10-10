import cors from 'cors';

const allowedOrigins = (
    process.env.CORS_ORIGINS || 'http://localhost:5173'
)
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(null, false);
    },

    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    allowedHeaders: ['Content-Type', 'Authorization']
};

const corsConfig = cors(corsOptions);

export default corsConfig;
