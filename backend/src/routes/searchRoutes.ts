import { Router } from 'express';
import { searchProject } from '../controllers/searchController';
import { requireAuth, requireProjectAccess } from '../middleware/auth';

const router = Router({ mergeParams: true });

router.use(requireAuth);
router.use(requireProjectAccess);

router.get('/', searchProject);

export default router;
