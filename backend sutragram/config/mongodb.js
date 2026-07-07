import mongoose from "mongoose";
import 'dotenv/config';

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI ||'mongodb+srv://sutragram:FzXsNAXMZiRoefKY@cluster0.xexgusd.mongodb.net/?appName=Cluster0' ;
    if (!uri) throw new Error("MONGO_URI is not defined in environment variables");

    mongoose.connection.on('connected', () => {
      console.log('✅ MongoDB connected successfully');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB runtime error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected. Mongoose will auto-reconnect.');
    });

    await mongoose.connect(uri); 
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

export default connectDB;