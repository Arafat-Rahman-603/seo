import { Router } from 'express';
import { getContent, saveContentOverrides, resetContentOverride } from '../controllers/contentController';
import { requireAuth, requireProjectAccess, requireRole } from '../middleware/auth';

const router = Router({ mergeParams: true });

router.use(requireAuth);
router.use(requireProjectAccess);

router.get('/', getContent);
router.patch('/', requireRole(['ADMIN', 'EDITOR']), saveContentOverrides);
router.delete('/override', requireRole(['ADMIN', 'EDITOR']), resetContentOverride);

export default router;
