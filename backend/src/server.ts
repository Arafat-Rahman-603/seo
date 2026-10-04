import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDB from './config/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || ['http://localhost:3000', 'http://localhost:3001'].includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

import authRoutes from './routes/authRoutes';
import projectRoutes from './routes/projectRoutes';
import contentRoutes from './routes/contentRoutes';
import seoRoutes from './routes/seoRoutes';
import versionRoutes from './routes/versionRoutes';
import auditRoutes from './routes/auditRoutes';
import searchRoutes from './routes/searchRoutes';
import publicRoutes from './routes/publicRoutes';
// Basic Health Route
app.get('/api/health', (req, res) => {
  res.json({ success: true });
});

// API Routes
app.use('/api/public', publicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects/:id/content', contentRoutes);
app.use('/api/projects/:id/seo', seoRoutes);
app.use('/api/projects/:id/versions', versionRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/projects/:id/search', searchRoutes);

// Initialize Server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
