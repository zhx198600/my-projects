import jwt from 'jsonwebtoken';
import { type Request, type Response, type NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'cloud-drive-secret';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
  };
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'No token provided',
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.user = { userId: decoded.userId };
    next();
  } catch {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
    });
  }
};
