import mongoose from 'mongoose';

const connectDb = async () => {
    try {
        const dbUri = process.env.DEVELOPMENT_DB_URI.replace("<db_password>", process.env.DB_PASSWORD);

        const connect = await mongoose.connect(dbUri);

        console.log(`MongoDb connected: ${connect.connection.host}`);
        
    } catch (error) {
        console.error('Database connection error', error.message);
        
        process.exit(1)
    }
}

export default connectDb