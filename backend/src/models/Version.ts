import mongoose from 'mongoose';

const VersionSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  versionNumber: { type: Number, required: true },
  type: { type: String, enum: ['DRAFT', 'PUBLISHED', 'ROLLBACK'], required: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  contentOverrides: { type: mongoose.Schema.Types.Mixed, default: {} },
  seoOverrides: { type: mongoose.Schema.Types.Mixed, default: {} },
  changesSummary: { type: [String], default: [] }
}, { timestamps: true });

import { adminDb } from '../config/db';
export default adminDb.model('Version', VersionSchema);
