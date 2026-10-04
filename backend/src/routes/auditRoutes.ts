import { Router } from 'express';
import { getAuditLogs } from '../controllers/auditController';
import { requireAuth, requireProjectAccess, requireRole } from '../middleware/auth';

const router = Router({ mergeParams: true });

router.use(requireAuth);

// Project specific logs
router.get('/projects/:id', requireProjectAccess, requireRole(['ADMIN']), getAuditLogs);

// Global logs
router.get('/', requireRole(['ADMIN']), getAuditLogs);

export default router;
