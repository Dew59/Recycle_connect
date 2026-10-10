import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import connectDb from './config/dbConfig.js';

const port = process.env.PORT;

const startServer = async () => {
    try {
        await connectDb();

        app.listen(port, () => {
            console.log(`Server running on port ${port}`); 
        })
    } catch (error) {
        console.error("Failed to start server:", error);
        
        process.exit(1);
    }
}

startServer();