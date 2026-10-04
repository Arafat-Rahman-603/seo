import mongoose from 'mongoose';

const ContentOverrideSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  page: { type: String, required: true },
  path: { type: String, required: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true }
}, { timestamps: true });

// Ensure uniqueness per project/page/path
ContentOverrideSchema.index({ projectId: 1, page: 1, path: 1 }, { unique: true });

import { runtimeDb } from '../config/db';
export default runtimeDb.model('ContentOverride', ContentOverrideSchema);
