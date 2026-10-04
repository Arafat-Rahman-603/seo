import { Router } from 'express';
import { getVersions, publishVersion, rollbackVersion } from '../controllers/versionController';
import { requireAuth, requireProjectAccess, requireRole } from '../middleware/auth';

const router = Router({ mergeParams: true });

router.use(requireAuth);
router.use(requireProjectAccess);

router.get('/', getVersions);
router.post('/publish', requireRole(['ADMIN']), publishVersion);
router.post('/rollback', requireRole(['ADMIN']), rollbackVersion);

export default router;
