import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const adminDbUri = process.env.ADMIN_MONGODB_URI || 'mongodb://localhost:27017/plan2_admin';
const runtimeDbUri = process.env.RUNTIME_MONGODB_URI || 'mongodb://localhost:27017/northstar_runtime';

export const adminDb = mongoose.createConnection(adminDbUri);
export const runtimeDb = mongoose.createConnection(runtimeDbUri);

adminDb.on('connected', () => console.log('MongoDB: plan2_admin connected successfully'));
adminDb.on('error', (err) => console.error('MongoDB: plan2_admin connection error:', err));

runtimeDb.on('connected', () => console.log('MongoDB: northstar_runtime connected successfully'));
runtimeDb.on('error', (err) => console.error('MongoDB: northstar_runtime connection error:', err));

const connectDB = async () => {
  // Connections are created synchronously above.
  // We can just wait for them to be ready here if needed, or just let them connect in the background.
  return Promise.all([
    adminDb.asPromise(),
    runtimeDb.asPromise()
  ]);
};

export default connectDB;
