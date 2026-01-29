import mongoose from 'mongoose';
import Admin from '../utils/admin/login/loginSchema.js';

const connectDB = async () => {
  try {
    // Check if already connected
    if (mongoose.connections[0].readyState) {
      console.log('Already connected to MongoDB');
      return;
    }

    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGO_URL);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Create initial admin after successful connection
    try {
      await Admin.createInitialAdmin();
    } catch (adminError) {
      console.error('Error creating initial admin:', adminError.message);
    }

  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

export default connectDB;