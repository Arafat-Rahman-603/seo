import { Router } from 'express';
import { getContent } from '../controllers/contentController';
import { getSeo } from '../controllers/seoController';

const router = Router();

// We map /api/public/projects/:id/content to getContent, bypassing requireAuth
// The controller itself doesn't check auth for simple GET, but wait, the controller expects req.user inside some operations?
// Let's check. getContent only reads req.params.id and req.query.

router.get('/projects/:id/content', (req, res, next) => {
  // force mode to PUBLISHED for public unauthenticated requests
  req.query.mode = 'PUBLISHED';
  getContent(req as any, res).catch(next);
});

router.get('/projects/:id/seo', (req, res, next) => {
  req.query.mode = 'PUBLISHED';
  getSeo(req as any, res).catch(next);
});

export default router;
