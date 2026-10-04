import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Membership from '../models/Membership';

export interface AuthRequest extends Request {
  user?: any;
  projectRole?: string;
  projectId?: string;
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ success: false, code: 'UNAUTHORIZED', message: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret123') as { id: string };
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ success: false, code: 'UNAUTHORIZED', message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, code: 'UNAUTHORIZED', message: 'Invalid token' });
  }
};

export const requireProjectAccess = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string; // projectId
    if (!id) {
       return res.status(400).json({ success: false, code: 'BAD_REQUEST', message: 'Project ID is required' });
    }
    const membership = await Membership.findOne({ userId: req.user._id, projectId: id });
    if (!membership) {
      return res.status(403).json({ success: false, code: 'FORBIDDEN', message: 'You do not have access to this project.' });
    }
    
    req.projectRole = membership.role;
    req.projectId = id;
    next();
  } catch (error) {
     return res.status(500).json({ success: false, code: 'SERVER_ERROR', message: 'Internal server error' });
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.projectRole || !allowedRoles.includes(req.projectRole)) {
      return res.status(403).json({ success: false, code: 'FORBIDDEN', message: 'You do not have permission to perform this action on this project.' });
    }
    next();
  };
};

export const requireGlobalRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.role || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, code: 'FORBIDDEN', message: 'You do not have global permission to perform this action.' });
    }
    next();
  };
};
