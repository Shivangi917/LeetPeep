import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        const DB_NAME = "leet"
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}`)
        console.log(`MongoDB connected: ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log('Error connection to MongoDB: ', error.message);
        process.exit(1); //1 is for failure, 0 status code is success
    }
}