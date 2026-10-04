import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  projectKey: { type: String, required: true, unique: true },
  description: { type: String },
  websiteUrl: { type: String },
  previewUrl: { type: String },
  status: { type: String, default: 'active' },
  draftVersion: { type: Number, default: 1 },
  publishedVersion: { type: Number, default: 0 },
}, { timestamps: true });

import { adminDb } from '../config/db';
export default adminDb.model('Project', ProjectSchema);
