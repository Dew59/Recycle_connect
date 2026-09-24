import dotenv from 'dotenv';
import app from './app.js';
import connectDb from './config/dbConfig.js';

dotenv.config();

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