import { Router, type Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import db, { getDirectoryContents } from '../db/index.js';
import { verifyToken, type AuthRequest } from '../middleware/auth.js';

const router = Router();

const generateShareCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const generateUniqueShareCode = (): string => {
  let code: string;
  do {
    code = generateShareCode();
  } while (db.prepare('SELECT id FROM shares WHERE share_code = ?').get(code));
  return code;
};

interface ShareRow {
  id: string;
  share_code: string;
  user_id: string;
  file_id: string | null;
  folder_id: string | null;
  type: string;
  password: string | null;
  expire_at: string | null;
  created_at: string;
}

const formatShareResponse = (row: ShareRow) => ({
  id: row.id,
  shareCode: row.share_code,
  userId: row.user_id,
  fileId: row.file_id,
  folderId: row.folder_id,
  type: row.type,
  password: row.password,
  expireAt: row.expire_at,
  createdAt: row.created_at,
});

interface FileRow {
  id: string;
  name: string;
  size: number;
  type: string;
  path: string;
  user_id: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

interface FolderRow {
  id: string;
  name: string;
  user_id: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

const formatFileItem = (row: FileRow) => ({
  id: row.id,
  name: row.name,
  type: 'file' as const,
  size: row.size,
  mimeType: row.type,
  path: row.path,
  userId: row.user_id,
  parentId: row.parent_id,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const formatFolderItem = (row: FolderRow) => ({
  id: row.id,
  name: row.name,
  type: 'folder' as const,
  userId: row.user_id,
  parentId: row.parent_id,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

router.post('/', verifyToken, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const { itemId, itemType, password, expireDays } = req.body;

    if (!itemId || !itemType) {
      res.status(400).json({ success: false, error: 'itemId and itemType are required' });
      return;
    }

    if (itemType !== 'file' && itemType !== 'folder') {
      res.status(400).json({ success: false, error: 'itemType must be "file" or "folder"' });
      return;
    }

    if (itemType === 'file') {
      const file = db
        .prepare('SELECT id FROM files WHERE id = ? AND user_id = ?')
        .get(itemId, userId);
      if (!file) {
        res.status(404).json({ success: false, error: 'File not found' });
        return;
      }
    } else {
      const folder = db
        .prepare('SELECT id FROM folders WHERE id = ? AND user_id = ?')
        .get(itemId, userId);
      if (!folder) {
        res.status(404).json({ success: false, error: 'Folder not found' });
        return;
      }
    }

    const id = uuidv4();
    const shareCode = generateUniqueShareCode();

    let hashedPassword: string | null = null;
    if (password && typeof password === 'string' && password.trim().length > 0) {
      hashedPassword = bcrypt.hashSync(password, 10);
    }

    let expireAt: string | null = null;
    if (expireDays && expireDays > 0) {
      const expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + expireDays);
      expireAt = expireDate.toISOString();
    }

    if (itemType === 'file') {
      db.prepare(
        'INSERT INTO shares (id, share_code, user_id, file_id, type, password, expire_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).run(id, shareCode, userId, itemId, itemType, hashedPassword, expireAt);
    } else {
      db.prepare(
        'INSERT INTO shares (id, share_code, user_id, folder_id, type, password, expire_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).run(id, shareCode, userId, itemId, itemType, hashedPassword, expireAt);
    }

    const shareRow = db
      .prepare('SELECT * FROM shares WHERE id = ?')
      .get(id) as ShareRow;

    res.status(201).json({
      success: true,
      message: 'Share created successfully',
      data: {
        ...formatShareResponse(shareRow),
        shareLink: `/s/${shareCode}`,
      },
    });
  } catch (error) {
    console.error('Create share error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.get('/', verifyToken, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const shares = db
      .prepare('SELECT * FROM shares WHERE user_id = ? ORDER BY created_at DESC')
      .all(userId) as ShareRow[];

    res.status(200).json({
      success: true,
      data: shares.map((share) => {
        const result: Record<string, unknown> = {
          ...formatShareResponse(share),
          shareLink: `/s/${share.share_code}`,
        };

        if (share.type === 'file' && share.file_id) {
          const file = db
            .prepare('SELECT name, size FROM files WHERE id = ?')
            .get(share.file_id) as { name: string; size: number } | undefined;
          if (file) {
            result.itemName = file.name;
            result.itemSize = file.size;
          }
        } else if (share.type === 'folder' && share.folder_id) {
          const folder = db
            .prepare('SELECT name FROM folders WHERE id = ?')
            .get(share.folder_id) as { name: string } | undefined;
          if (folder) {
            result.itemName = folder.name;
          }
        }

        return result;
      }),
    });
  } catch (error) {
    console.error('Get shares error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.delete('/:id', verifyToken, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const shareId = req.params.id;

    const share = db
      .prepare('SELECT * FROM shares WHERE id = ? AND user_id = ?')
      .get(shareId, userId) as ShareRow | undefined;

    if (!share) {
      res.status(404).json({ success: false, error: 'Share not found' });
      return;
    }

    db.prepare('DELETE FROM shares WHERE id = ?').run(shareId);

    res.status(200).json({
      success: true,
      message: 'Share deleted successfully',
    });
  } catch (error) {
    console.error('Delete share error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

const publicRouter = Router();

const getShareByCode = (code: string): ShareRow | undefined => {
  return db
    .prepare('SELECT * FROM shares WHERE share_code = ?')
    .get(code) as ShareRow | undefined;
};

const isShareExpired = (share: ShareRow): boolean => {
  if (!share.expire_at) return false;
  return new Date(share.expire_at) < new Date();
};

const verifySharePassword = (share: ShareRow, password?: string): boolean => {
  if (!share.password) return true;
  if (!password) return false;
  return bcrypt.compareSync(password, share.password);
};

publicRouter.get('/:code', (req: AuthRequest, res: Response): void => {
  try {
    const code = req.params.code;
    const { password } = req.query;

    const share = getShareByCode(code);
    if (!share) {
      res.status(404).json({ success: false, error: 'Share not found' });
      return;
    }

    if (isShareExpired(share)) {
      res.status(410).json({ success: false, error: 'Share has expired' });
      return;
    }

    if (!verifySharePassword(share, password as string | undefined)) {
      res.status(403).json({
        success: false,
        error: 'Password required',
        requirePassword: true,
      });
      return;
    }

    if (share.type === 'file' && share.file_id) {
      const file = db
        .prepare('SELECT * FROM files WHERE id = ?')
        .get(share.file_id) as FileRow | undefined;

      if (!file) {
        res.status(404).json({ success: false, error: 'File not found' });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          share: formatShareResponse(share),
          item: formatFileItem(file),
        },
      });
    } else if (share.type === 'folder' && share.folder_id) {
      const folder = db
        .prepare('SELECT * FROM folders WHERE id = ?')
        .get(share.folder_id) as FolderRow | undefined;

      if (!folder) {
        res.status(404).json({ success: false, error: 'Folder not found' });
        return;
      }

      const { folders, files } = getDirectoryContents(folder.user_id, folder.id);

      const items = [
        ...folders.map(formatFolderItem),
        ...files.map(formatFileItem),
      ];

      res.status(200).json({
        success: true,
        data: {
          share: formatShareResponse(share),
          folder: formatFolderItem(folder),
          items,
        },
      });
    } else {
      res.status(404).json({ success: false, error: 'Shared item not found' });
    }
  } catch (error) {
    console.error('Access share error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

publicRouter.get('/:code/download', (req: AuthRequest, res: Response): void => {
  try {
    const code = req.params.code;
    const { password } = req.query;

    const share = getShareByCode(code);
    if (!share) {
      res.status(404).json({ success: false, error: 'Share not found' });
      return;
    }

    if (isShareExpired(share)) {
      res.status(410).json({ success: false, error: 'Share has expired' });
      return;
    }

    if (!verifySharePassword(share, password as string | undefined)) {
      res.status(403).json({ success: false, error: 'Invalid password' });
      return;
    }

    if (share.type !== 'file' || !share.file_id) {
      res.status(400).json({ success: false, error: 'This share is not a file' });
      return;
    }

    const file = db
      .prepare('SELECT * FROM files WHERE id = ?')
      .get(share.file_id) as FileRow | undefined;

    if (!file) {
      res.status(404).json({ success: false, error: 'File not found' });
      return;
    }

    const encodedFilename = encodeURIComponent(file.name);
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedFilename}; filename="${encodedFilename}"`);
    res.setHeader('Content-Type', file.type);
    res.setHeader('Content-Length', String(file.size));

    const fs = require('fs');
    const fileStream = fs.createReadStream(file.path);
    fileStream.pipe(res);

    fileStream.on('error', (err: Error) => {
      console.error('Share download error:', err);
      if (!res.headersSent) {
        res.status(500).json({ success: false, error: 'Download failed' });
      }
    });
  } catch (error) {
    console.error('Share download error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

publicRouter.get('/:code/files/:fileId', (req: AuthRequest, res: Response): void => {
  try {
    const code = req.params.code;
    const fileId = req.params.fileId;
    const { password } = req.query;

    const share = getShareByCode(code);
    if (!share) {
      res.status(404).json({ success: false, error: 'Share not found' });
      return;
    }

    if (isShareExpired(share)) {
      res.status(410).json({ success: false, error: 'Share has expired' });
      return;
    }

    if (!verifySharePassword(share, password as string | undefined)) {
      res.status(403).json({ success: false, error: 'Invalid password' });
      return;
    }

    if (share.type !== 'folder' || !share.folder_id) {
      res.status(400).json({ success: false, error: 'This share is not a folder' });
      return;
    }

    const folder = db
      .prepare('SELECT * FROM folders WHERE id = ?')
      .get(share.folder_id) as FolderRow | undefined;

    if (!folder) {
      res.status(404).json({ success: false, error: 'Folder not found' });
      return;
    }

    const file = db
      .prepare('SELECT * FROM files WHERE id = ? AND user_id = ? AND parent_id = ?')
      .get(fileId, folder.user_id, folder.id) as FileRow | undefined;

    if (!file) {
      res.status(404).json({ success: false, error: 'File not found in this folder' });
      return;
    }

    const encodedFilename = encodeURIComponent(file.name);
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedFilename}; filename="${encodedFilename}"`);
    res.setHeader('Content-Type', file.type);
    res.setHeader('Content-Length', String(file.size));

    const fs = require('fs');
    const fileStream = fs.createReadStream(file.path);
    fileStream.pipe(res);

    fileStream.on('error', (err: Error) => {
      console.error('Folder file download error:', err);
      if (!res.headersSent) {
        res.status(500).json({ success: false, error: 'Download failed' });
      }
    });
  } catch (error) {
    console.error('Folder file download error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export { router as default, publicRouter };