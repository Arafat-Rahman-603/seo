import { Router } from 'express';
import { getProjects, getProjectDetails, createProject, updateProject, archiveProject } from '../controllers/projectController';
import { requireAuth, requireProjectAccess, requireRole, requireGlobalRole } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/', getProjects);
router.post('/', requireGlobalRole(['ADMIN']), createProject);
router.get('/:id', requireProjectAccess, getProjectDetails);
router.patch('/:id', requireProjectAccess, requireRole(['ADMIN']), updateProject);
router.patch('/:id/status', requireProjectAccess, requireRole(['ADMIN']), archiveProject);

export default router;
