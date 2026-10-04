import mongoose from 'mongoose';

const MembershipSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  role: { type: String, enum: ['ADMIN', 'EDITOR', 'VIEWER'], required: true }
}, { timestamps: true });

import { adminDb } from '../config/db';
export default adminDb.model('Membership', MembershipSchema);
