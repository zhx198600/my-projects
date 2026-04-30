import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { IUser } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

interface JwtPayload {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: '访问被拒绝，未提供令牌' });
  }

  const token = authHeader.split(' ')[1];

  if (token.startsWith('demo-token-') || token.startsWith('demo-admin-token-')) {
    const isAdmin = token.startsWith('demo-admin-token-');
    req.user = {
      _id: isAdmin ? 'demo-admin-id' : 'demo-user-id',
      username: isAdmin ? 'admin' : '演示用户',
      email: isAdmin ? 'admin@forum.com' : 'user@demo.com',
      role: isAdmin ? 'admin' : 'user',
    } as unknown as IUser;
    return next();
  }

  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = decoded as unknown as IUser;
    next();
  } catch (error) {
    res.status(401).json({ message: '无效的令牌' });
  }
};

export const authorizeAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: '请先登录' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: '需要管理员权限' });
  }

  next();
};
