import { Router } from 'express';
import { getSeo, saveSeoOverrides, getSeoDiagnostics } from '../controllers/seoController';
import { requireAuth, requireProjectAccess, requireRole } from '../middleware/auth';

const router = Router({ mergeParams: true });

router.use(requireAuth);
router.use(requireProjectAccess);

router.get('/', getSeo);
router.patch('/', requireRole(['ADMIN', 'EDITOR']), saveSeoOverrides);
router.get('/diagnostics', getSeoDiagnostics);

export default router;
