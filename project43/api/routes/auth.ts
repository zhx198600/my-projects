import { Router, type Request, type Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/index.js';
import { verifyToken, type AuthRequest } from '../middleware/auth.js';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'cloud-drive-secret';
const JWT_EXPIRES_IN = '24h';
const DEFAULT_STORAGE_QUOTA = 10737418240;

const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

const formatUser = (row: {
  id: string;
  username: string;
  email: string;
  storage_quota: number;
  used_storage: number;
}) => ({
  id: row.id,
  username: row.username,
  email: row.email,
  storageQuota: row.storage_quota,
  usedStorage: row.used_storage,
});

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({
        success: false,
        error: 'Username, email and password are required',
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters',
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        error: 'Invalid email format',
      });
      return;
    }

    const existingUser = db
      .prepare('SELECT id FROM users WHERE email = ? OR username = ?')
      .get(email, username) as { id: string } | undefined;

    if (existingUser) {
      res.status(409).json({
        success: false,
        error: 'User with this email or username already exists',
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = uuidv4();

    db.prepare(
      'INSERT INTO users (id, username, email, password, storage_quota, used_storage) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(id, username, email, hashedPassword, DEFAULT_STORAGE_QUOTA, 0);

    const token = generateToken(id);

    const userRow = db
      .prepare('SELECT id, username, email, storage_quota, used_storage FROM users WHERE id = ?')
      .get(id) as {
      id: string;
      username: string;
      email: string;
      storage_quota: number;
      used_storage: number;
    };

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: formatUser(userRow),
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
      return;
    }

    const userRow = db
      .prepare('SELECT * FROM users WHERE email = ?')
      .get(email) as {
      id: string;
      username: string;
      email: string;
      password: string;
      storage_quota: number;
      used_storage: number;
    } | undefined;

    if (!userRow) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, userRow.password);

    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
      return;
    }

    const token = generateToken(userRow.id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: formatUser(userRow),
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

router.get('/me', verifyToken, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
      return;
    }

    const userRow = db
      .prepare('SELECT id, username, email, storage_quota, used_storage FROM users WHERE id = ?')
      .get(userId) as {
      id: string;
      username: string;
      email: string;
      storage_quota: number;
      used_storage: number;
    } | undefined;

    if (!userRow) {
      res.status(404).json({
        success: false,
        error: 'User not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: formatUser(userRow),
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

router.post('/logout', (_req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

export default router;
