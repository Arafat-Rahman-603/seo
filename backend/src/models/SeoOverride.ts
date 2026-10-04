import mongoose from 'mongoose';

const SeoOverrideSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  page: { type: String, required: true },
  field: { type: String, required: true },
  value: { type: String, required: true }
}, { timestamps: true });

SeoOverrideSchema.index({ projectId: 1, page: 1, field: 1 }, { unique: true });

import { adminDb } from '../config/db';
export default adminDb.model('SeoOverride', SeoOverrideSchema);
