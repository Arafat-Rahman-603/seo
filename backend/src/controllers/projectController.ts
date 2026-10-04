import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Project from '../models/Project';
import Membership from '../models/Membership';
import AuditLog from '../models/AuditLog';

export const getProjects = async (req: AuthRequest, res: Response) => {
  try {
    const memberships = await Membership.find({ userId: req.user._id }).populate('projectId');
    const projects = memberships.map(m => m.projectId).filter((p: any) => p && p.status !== 'TEST_FIXTURE');
    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, code: 'SERVER_ERROR', message: 'Internal server error' });
  }
};

export const getProjectDetails = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const project = await Project.findById(id);
    if (!project) {
       return res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'Project not found' });
    }
    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, code: 'SERVER_ERROR', message: 'Internal server error' });
  }
};

export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    const { name, slug, projectKey, description, websiteUrl, previewUrl, status } = req.body;
    
    const existingSlug = await Project.findOne({ slug });
    if (existingSlug) {
      return res.status(400).json({ success: false, code: 'VALIDATION_ERROR', message: 'Slug must be unique' });
    }
    const existingKey = await Project.findOne({ projectKey });
    if (existingKey) {
      return res.status(400).json({ success: false, code: 'VALIDATION_ERROR', message: 'Project Key must be unique' });
    }

    const project = await Project.create({ name, slug, projectKey, description, websiteUrl, previewUrl, status: status || 'ACTIVE' });
    
    // Create membership for the creator as ADMIN
    await Membership.create({ userId: req.user._id, projectId: project._id, role: 'ADMIN' });
    
    await AuditLog.create({
      projectId: project._id,
      actorId: req.user._id,
      action: 'WEBSITE_CREATED',
      target: project.name,
      details: { slug, projectKey }
    });

    res.status(201).json({ success: true, data: project });
  } catch (error: any) {
    res.status(500).json({ success: false, code: 'SERVER_ERROR', message: error.message || 'Internal server error' });
  }
};

export const updateProject = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, slug, description, websiteUrl, previewUrl, status } = req.body;
    
    if (slug) {
      const existingSlug = await Project.findOne({ slug, _id: { $ne: id } });
      if (existingSlug) {
        return res.status(400).json({ success: false, code: 'VALIDATION_ERROR', message: 'Slug must be unique' });
      }
    }

    const project = await Project.findByIdAndUpdate(id, { name, slug, description, websiteUrl, previewUrl, status }, { new: true });
    
    if (!project) {
      return res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'Project not found' });
    }
    
    await AuditLog.create({
      projectId: project._id,
      actorId: req.user._id,
      action: 'WEBSITE_UPDATED',
      target: project.name,
      details: { name, slug, description, websiteUrl, previewUrl, status }
    });

    res.json({ success: true, data: project });
  } catch (error: any) {
    res.status(500).json({ success: false, code: 'SERVER_ERROR', message: error.message || 'Internal server error' });
  }
};

export const archiveProject = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const project = await Project.findByIdAndUpdate(id, { status: 'ARCHIVED' }, { new: true });
    
    if (!project) {
      return res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'Project not found' });
    }
    
    await AuditLog.create({
      projectId: project._id,
      actorId: req.user._id,
      action: 'WEBSITE_ARCHIVED',
      target: project.name
    });

    res.json({ success: true, data: project });
  } catch (error: any) {
    res.status(500).json({ success: false, code: 'SERVER_ERROR', message: error.message || 'Internal server error' });
  }
};
