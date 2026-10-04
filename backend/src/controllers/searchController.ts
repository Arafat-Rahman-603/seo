import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { getResolvedContent } from '../services/contentService';
import { getResolvedSeo } from '../services/seoService';
import Project from '../models/Project';

export const searchProject = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { q } = req.query as { q: string };

    if (!q || q.trim() === '') {
      return res.json({ success: true, data: [] });
    }

    const query = q.toLowerCase();
    const pages = ['home', 'services', 'about', 'contact'];
    const results: any[] = [];

    for (const page of pages) {
      // Check page name
      if (page.toLowerCase().includes(query)) {
         results.push({ type: 'page', page, text: `Page: ${page}`, link: `/projects/${id}/content/${page}` });
      }

      // Check content
      const content = await getResolvedContent(id, page, 'DRAFT');
      if (content && content.data) {
         const searchObj = (obj: any, path: string) => {
            if (typeof obj === 'string') {
               if (obj.toLowerCase().includes(query)) {
                  results.push({ type: 'content', page, field: path, text: obj, link: `/projects/${id}/content/${page}` });
               }
            } else if (typeof obj === 'object' && obj !== null) {
               Object.keys(obj).forEach(k => {
                  searchObj(obj[k], path ? `${path}.${k}` : k);
               });
            }
         };
         searchObj(content.data, '');
      }

      // Check SEO
      const seo = await getResolvedSeo(id, page, 'DRAFT');
      if (seo && seo.data) {
         Object.keys(seo.data).forEach(field => {
            const val = seo.data[field];
            if (typeof val === 'string' && val.toLowerCase().includes(query)) {
               results.push({ type: 'seo', page, field, text: val, link: `/projects/${id}/seo/${page}` });
            }
         });
      }
    }

    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, code: 'SERVER_ERROR', message: 'Internal server error' });
  }
};
