import mongoose from 'mongoose';

const PublishRecordSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  version: { type: Number, required: true },
  publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  changes: { type: [String], default: [] }
}, { timestamps: true });

import { adminDb } from '../config/db';
export default adminDb.model('PublishRecord', PublishRecordSchema);
