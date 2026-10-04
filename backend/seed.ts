
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { adminDb } from './src/config/db';
import User from './src/models/User';
import Project from './src/models/Project';
import SeoOverride from './src/models/SeoOverride';

async function seed() {
  await new Promise(r => setTimeout(r, 2000));
  await User.deleteMany({});
  await Project.deleteMany({});
  await SeoOverride.deleteMany({});

  const hashedPassword = await bcrypt.hash('admin123', 10);
  await User.create({
    name: 'Admin User',
    email: 'admin@example.com',
    password: hashedPassword,
    role: 'ADMIN'
  });

  const projectId = new mongoose.Types.ObjectId('6ac202d4d1c09439df205139');
  await Project.create({
    _id: projectId,
    name: 'Northstar Digital',
    slug: 'northstar',
    projectKey: 'NS-001',
    description: 'The real demo website for Plan 2.',
    websiteUrl: 'http://localhost:3001',
    previewUrl: 'http://localhost:3001/preview',
    status: 'ACTIVE',
    draftVersion: 1,
    publishedVersion: 0
  });

  console.log('Seeded successfully!');
  process.exit(0);
}

seed().catch(console.error);

