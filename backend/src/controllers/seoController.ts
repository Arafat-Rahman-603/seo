import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { getResolvedSeo, validateSeo } from '../services/seoService';
import SeoOverride from '../models/SeoOverride';
import Project from '../models/Project';
import AuditLog from '../models/AuditLog';
import Version from '../models/Version';

export const getSeo = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { page, mode } = req.query as { page: string, mode?: 'DRAFT' | 'PUBLISHED' };

    if (!page) {
      return res.status(400).json({ success: false, code: 'BAD_REQUEST', message: 'Page is required' });
    }

    let resolved;
    if (mode === 'PUBLISHED') {
      const project = await Project.findById(id);
      if (project && project.publishedVersion > 0) {
        const publishedVer = await Version.findOne({ projectId: id, versionNumber: project.publishedVersion });
        resolved = await getResolvedSeo(id, page, 'PUBLISHED', publishedVer);
      } else {
        resolved = await getResolvedSeo(id, page, 'PUBLISHED', { seoOverrides: {} });
      }
    } else {
      resolved = await getResolvedSeo(id, page, 'DRAFT');
    }

    if (!resolved) {
       return res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'SEO data not found' });
    }

    const diagnostics = validateSeo(resolved.data);

    res.json({ success: true, data: { ...resolved, diagnostics } });
  } catch (error) {
    res.status(500).json({ success: false, code: 'SERVER_ERROR', message: 'Internal server error' });
  }
};

export const saveSeoOverrides = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { page, changes } = req.body; // Array of { field, value }

    if (!page || !Array.isArray(changes) || changes.length === 0) {
      return res.status(400).json({ success: false, code: 'BAD_REQUEST', message: 'Page and changes are required' });
    }

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'Project not found' });

    for (const change of changes) {
       await SeoOverride.findOneAndUpdate(
         { projectId: id, page: page, field: change.field },
         { value: change.value },
         { upsert: true, new: true }
       );
    }

    project.draftVersion += 1;
    await project.save();

    await AuditLog.create({
      projectId: id,
      actorId: req.user._id,
      action: 'SEO_SAVE',
      details: { page, changes }
    });

    res.json({ success: true, message: 'SEO saved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, code: 'SERVER_ERROR', message: 'Internal server error' });
  }
};

export const getSeoDiagnostics = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const pages = ['home', 'about', 'contact', 'services'];
    
    let totalErrors = 0;
    let totalWarnings = 0;
    const pageDiagnostics: any = {};

    for (const page of pages) {
      const resolved = await getResolvedSeo(id, page, 'DRAFT');
      if (resolved) {
        const diagnostics = validateSeo(resolved.data);
        pageDiagnostics[page] = diagnostics;
        
        for (const diag of diagnostics) {
          if (diag.severity === 'ERROR') totalErrors++;
          else if (diag.severity === 'WARNING') totalWarnings++;
        }
      }
    }

    res.json({ 
      success: true, 
      data: {
        totalErrors,
        totalWarnings,
        pageDiagnostics
      } 
    });
  } catch (error) {
     res.status(500).json({ success: false, code: 'SERVER_ERROR', message: 'Internal server error' });
  }
}
