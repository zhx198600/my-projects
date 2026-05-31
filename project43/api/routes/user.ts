import { Router, type Request, type Response } from 'express';
import db from '../db/index.js';
import { verifyToken, type AuthRequest } from '../middleware/auth.js';
import type { StorageInfo, StorageCheckResult } from '../../shared/types.js';

const router = Router();

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getStorageInfo = (total: number, used: number): StorageInfo => {
  const available = total - used;
  const percentage = total > 0 ? (used / total) * 100 : 0;
  const formatted = `${formatBytes(used)} / ${formatBytes(total)}`;

  return {
    total,
    used,
    available,
    percentage,
    formatted,
  };
};

router.get('/storage', verifyToken, (req: AuthRequest, res: Response): void => {
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
      .prepare('SELECT storage_quota, used_storage FROM users WHERE id = ?')
      .get(userId) as { storage_quota: number; used_storage: number } | undefined;

    if (!userRow) {
      res.status(404).json({
        success: false,
        error: 'User not found',
      });
      return;
    }

    const storageInfo = getStorageInfo(userRow.storage_quota, userRow.used_storage);

    res.status(200).json({
      success: true,
      data: storageInfo,
    });
  } catch (error) {
    console.error('Get storage info error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

router.post('/storage/check', verifyToken, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
      return;
    }

    const { fileSize } = req.body;

    if (fileSize === undefined || fileSize === null) {
      res.status(400).json({
        success: false,
        error: 'fileSize is required',
      });
      return;
    }

    const parsedFileSize = Number(fileSize);

    if (isNaN(parsedFileSize) || parsedFileSize < 0) {
      res.status(400).json({
        success: false,
        error: 'Invalid fileSize, must be a non-negative number',
      });
      return;
    }

    const userRow = db
      .prepare('SELECT storage_quota, used_storage FROM users WHERE id = ?')
      .get(userId) as { storage_quota: number; used_storage: number } | undefined;

    if (!userRow) {
      res.status(404).json({
        success: false,
        error: 'User not found',
      });
      return;
    }

    const available = userRow.storage_quota - userRow.used_storage;
    const sufficient = parsedFileSize <= available;

    let message: string;
    if (sufficient) {
      message = `Sufficient storage. Available: ${formatBytes(available)}, Required: ${formatBytes(parsedFileSize)}`;
    } else {
      const shortfall = parsedFileSize - available;
      message = `Insufficient storage. Need ${formatBytes(parsedFileSize)}, but only ${formatBytes(available)} available. Shortfall: ${formatBytes(shortfall)}`;
    }

    const result: StorageCheckResult = {
      sufficient,
      available,
      required: parsedFileSize,
      message,
    };

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Storage check error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;
