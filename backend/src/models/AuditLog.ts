import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  target: { type: String },
  version: { type: Number },
  details: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

import { adminDb } from '../config/db';
export default adminDb.model('AuditLog', AuditLogSchema);
