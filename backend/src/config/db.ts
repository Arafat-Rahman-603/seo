import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const adminDbUri = process.env.ADMIN_MONGODB_URI || 'mongodb://localhost:27017/plan2';


export const adminDb = mongoose.createConnection(adminDbUri);


adminDb.on('connected', () => console.log('MongoDB: plan2_admin connected successfully'));
adminDb.on('error', (err) => console.error('MongoDB: plan2_admin connection error:', err));




const connectDB = async () => {
  // Connections are created synchronously above.
  // We can just wait for them to be ready here if needed, or just let them connect in the background.
  return Promise.all([
    adminDb.asPromise(),

  ]);
};

export default connectDB;
