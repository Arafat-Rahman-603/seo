import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { getResolvedContent } from '../services/contentService';
import ContentOverride from '../models/ContentOverride';
import Project from '../models/Project';
import AuditLog from '../models/AuditLog';
import Version from '../models/Version';

export const getContent = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string; // projectId
    const { page, mode, version } = req.query as { page: string, mode?: 'DRAFT' | 'PUBLISHED', version?: string };
    
    if (!page) {
      return res.status(400).json({ success: false, code: 'BAD_REQUEST', message: 'Page is required' });
    }

    let resolved;
    if (mode === 'PUBLISHED') {
      const project = await Project.findById(id);
      if (project && project.publishedVersion > 0) {
        const publishedVer = await Version.findOne({ projectId: id, versionNumber: project.publishedVersion });
        resolved = await getResolvedContent(id, page, 'PUBLISHED', publishedVer);
      } else {
        resolved = await getResolvedContent(id, page, 'PUBLISHED', { contentOverrides: {} });
      }
    } else {
      resolved = await getResolvedContent(id, page, 'DRAFT');
    }
    
    if (!resolved) {
       return res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'Page content not found' });
    }

    res.json({ success: true, data: resolved });
  } catch (error) {
    res.status(500).json({ success: false, code: 'SERVER_ERROR', message: 'Internal server error' });
  }
};

export const saveContentOverrides = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string; // projectId
    const { changes } = req.body; // Array of { page, path, value }

    if (!Array.isArray(changes) || changes.length === 0) {
      return res.status(400).json({ success: false, code: 'BAD_REQUEST', message: 'Changes array is required' });
    }

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'Project not found' });

    for (const change of changes) {
       await ContentOverride.findOneAndUpdate(
         { projectId: id, page: change.page, path: change.path },
         { value: change.value },
         { upsert: true, new: true }
       );
    }
    
    project.draftVersion += 1;
    await project.save();

    await AuditLog.create({
      projectId: id,
      actorId: req.user._id,
      action: 'CONTENT_SAVE',
      details: { changes }
    });

    res.json({ success: true, message: 'Content saved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, code: 'SERVER_ERROR', message: 'Internal server error' });
  }
};

export const resetContentOverride = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { page, path } = req.body;

    if (!page || !path) {
      return res.status(400).json({ success: false, code: 'BAD_REQUEST', message: 'Page and path are required' });
    }
    
    await ContentOverride.deleteOne({ projectId: id, page, path });
    
    const project = await Project.findById(id);
    if (project) {
       project.draftVersion += 1;
       await project.save();
    }

    await AuditLog.create({
      projectId: id,
      actorId: req.user._id,
      action: 'CONTENT_RESET',
      details: { page, path }
    });

    res.json({ success: true, message: 'Content reset successfully' });
  } catch (error) {
     res.status(500).json({ success: false, code: 'SERVER_ERROR', message: 'Internal server error' });
  }
};
