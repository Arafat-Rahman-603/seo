import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import AuditLog from '../models/AuditLog';

export const getAuditLogs = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string; // projectId
    let query: any = {};
    if (id) {
       query.projectId = id;
    }
    const logs = await AuditLog.find(query).sort({ createdAt: -1 }).populate('actorId', 'name email').limit(100);
    res.json({ success: true, data: logs });
  } catch (error) {
     res.status(500).json({ success: false, code: 'SERVER_ERROR', message: 'Internal server error' });
  }
};
