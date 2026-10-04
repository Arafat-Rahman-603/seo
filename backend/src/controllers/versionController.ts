import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Version from '../models/Version';
import Project from '../models/Project';
import ContentOverride from '../models/ContentOverride';
import SeoOverride from '../models/SeoOverride';
import AuditLog from '../models/AuditLog';
import PublishRecord from '../models/PublishRecord';

export const getVersions = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const versions = await Version.find({ projectId: id }).sort({ versionNumber: -1 }).populate('authorId', 'name email');
    res.json({ success: true, data: versions });
  } catch (error) {
    res.status(500).json({ success: false, code: 'SERVER_ERROR', message: 'Internal server error' });
  }
};

export const publishVersion = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'Project not found' });

    // Gather all current overrides
    const contentOverrides = await ContentOverride.find({ projectId: id });
    const seoOverrides = await SeoOverride.find({ projectId: id });

    // Group by page
    const groupedContent: any = {};
    for (const co of contentOverrides) {
      if (!groupedContent[co.page]) groupedContent[co.page] = [];
      groupedContent[co.page].push({ path: co.path, value: co.value });
    }

    const groupedSeo: any = {};
    for (const so of seoOverrides) {
      if (!groupedSeo[so.page]) groupedSeo[so.page] = [];
      groupedSeo[so.page].push({ field: so.field, value: so.value });
    }

    const newVersionNumber = project.draftVersion;

    // Check if this version already exists (shouldn't happen usually but just in case)
    const existingVersion = await Version.findOne({ projectId: id, versionNumber: newVersionNumber });
    if (existingVersion) {
        // Just update it if it exists for some reason
        existingVersion.contentOverrides = groupedContent;
        existingVersion.seoOverrides = groupedSeo;
        existingVersion.type = 'PUBLISHED';
        await existingVersion.save();
    } else {
        await Version.create({
            projectId: id,
            versionNumber: newVersionNumber,
            type: 'PUBLISHED',
            authorId: req.user._id,
            contentOverrides: groupedContent,
            seoOverrides: groupedSeo,
            changesSummary: ['Published draft changes']
        });
    }

    project.publishedVersion = newVersionNumber;
    project.draftVersion = newVersionNumber + 1; // Increment draft for future changes
    await project.save();

    await PublishRecord.create({
      projectId: id,
      version: newVersionNumber,
      publishedBy: req.user._id,
      changes: ['Published new version']
    });

    await AuditLog.create({
      projectId: id,
      actorId: req.user._id,
      action: 'PUBLISH',
      version: newVersionNumber,
      details: { versionNumber: newVersionNumber }
    });

    res.json({ success: true, message: 'Published successfully', data: { publishedVersion: newVersionNumber } });
  } catch (error) {
     console.error(error);
     res.status(500).json({ success: false, code: 'SERVER_ERROR', message: 'Internal server error' });
  }
};

export const rollbackVersion = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { versionNumber } = req.body;
    
    if (!versionNumber) return res.status(400).json({ success: false, code: 'BAD_REQUEST', message: 'Version number required' });

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'Project not found' });

    const targetVersion = await Version.findOne({ projectId: id, versionNumber });
    if (!targetVersion) return res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'Version not found' });

    // A rollback creates a NEW version snapshot that is identical to the target version
    const newVersionNumber = project.draftVersion;

    await Version.create({
      projectId: id,
      versionNumber: newVersionNumber,
      type: 'ROLLBACK',
      authorId: req.user._id,
      contentOverrides: targetVersion.contentOverrides,
      seoOverrides: targetVersion.seoOverrides,
      changesSummary: [`Rolled back to version ${versionNumber}`]
    });

    // We also need to restore the actual Draft state to this rollback state
    // Delete all current draft overrides
    await ContentOverride.deleteMany({ projectId: id });
    await SeoOverride.deleteMany({ projectId: id });

    // Restore from snapshot
    if (targetVersion.contentOverrides) {
        for (const [page, overrides] of Object.entries(targetVersion.contentOverrides)) {
            for (const ov of (overrides as any[])) {
                await ContentOverride.create({ projectId: id, page, path: ov.path, value: ov.value });
            }
        }
    }
    
    if (targetVersion.seoOverrides) {
        for (const [page, overrides] of Object.entries(targetVersion.seoOverrides)) {
             for (const ov of (overrides as any[])) {
                await SeoOverride.create({ projectId: id, page, field: ov.field, value: ov.value });
            }
        }
    }

    project.publishedVersion = newVersionNumber;
    project.draftVersion = newVersionNumber + 1;
    await project.save();

    await AuditLog.create({
      projectId: id,
      actorId: req.user._id,
      action: 'ROLLBACK',
      version: newVersionNumber,
      details: { targetVersion: versionNumber }
    });

    res.json({ success: true, message: 'Rollback successful', data: { publishedVersion: newVersionNumber } });
  } catch (error) {
    res.status(500).json({ success: false, code: 'SERVER_ERROR', message: 'Internal server error' });
  }
};
