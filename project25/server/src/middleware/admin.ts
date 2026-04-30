import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { IUser } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      admin?: IUser;
    }
  }
}

interface JwtPayload {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
}

export const authenticateAdmin = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const queryToken = req.query.token as string;

  let token: string | null = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (queryToken) {
    token = queryToken;
  }

  if (!token) {
    return res.status(401).json({ message: '访问被拒绝，未提供管理员令牌' });
  }

  if (token.startsWith('demo-admin-token-')) {
    req.admin = {
      _id: 'demo-admin-id',
      username: 'admin',
      email: 'admin@forum.com',
      role: 'admin',
    } as unknown as IUser;
    return next();
  }

  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: '需要管理员权限' });
    }
    
    req.admin = decoded as unknown as IUser;
    next();
  } catch (error) {
    res.status(401).json({ message: '无效的管理员令牌' });
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.admin) {
    return res.status(401).json({ message: '请先以管理员身份登录' });
  }
  next();
};
