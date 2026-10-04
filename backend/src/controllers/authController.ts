import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import AuditLog from '../models/AuditLog';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, code: 'UNAUTHORIZED', message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, code: 'UNAUTHORIZED', message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'supersecret123', {
      expiresIn: '1d'
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    await AuditLog.create({
      actorId: user._id,
      action: 'LOGIN',
      details: { email }
    });

    res.json({ success: true, data: { user: { id: user._id, email: user.email, name: user.name } } });
  } catch (error) {
    res.status(500).json({ success: false, code: 'SERVER_ERROR', message: 'Internal server error' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
     res.clearCookie('token');
     res.json({ success: true, message: 'Logged out successfully' });
  } catch(error) {
     res.status(500).json({ success: false, code: 'SERVER_ERROR', message: 'Internal server error' });
  }
};

export const me = async (req: any, res: Response) => {
  if (req.user) {
     res.json({ success: true, data: { user: req.user } });
  } else {
     res.status(401).json({ success: false, code: 'UNAUTHORIZED', message: 'Not authenticated' });
  }
};
