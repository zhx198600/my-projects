import { Router, type Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import db, { getDirectoryContents, checkNameExists } from '../db/index.js';
import { verifyToken, type AuthRequest } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import { deletePhysicalFile, getMimeType } from '../services/storage.js';
import type { FileSystemItem } from '../../shared/types.js';

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const router = Router();

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

const formatFileResponse = (row: FileRow) => ({
  id: row.id,
  name: row.name,
  size: row.size,
  type: row.type,
  path: row.path,
  userId: row.user_id,
  parentId: row.parent_id,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

interface FolderRow {
  id: string;
  name: string;
  user_id: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

const formatFolderResponse = (row: FolderRow) => ({
  id: row.id,
  name: row.name,
  userId: row.user_id,
  parentId: row.parent_id,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

type SortField = 'name' | 'created_at' | 'size' | 'type';
type SortOrder = 'asc' | 'desc';

const getSortValue = (item: FileSystemItem, sortBy: SortField): string | number => {
  switch (sortBy) {
    case 'name':
      return item.name.toLowerCase();
    case 'created_at':
      return item.createdAt;
    case 'size':
      return item.size ?? 0;
    case 'type':
      return item.type;
    default:
      return item.name.toLowerCase();
  }
};

const sortItems = (items: FileSystemItem[], sortBy: SortField, sortOrder: SortOrder): FileSystemItem[] => {
  return [...items].sort((a, b) => {
    const aVal = getSortValue(a, sortBy);
    const bVal = getSortValue(b, sortBy);

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
};

router.get('/', verifyToken, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const { parentId, sortBy = 'name', sortOrder = 'asc', type } = req.query;

    const parentIdValue = parentId === undefined || parentId === 'null' ? null : (parentId as string);

    if (parentIdValue !== null) {
      const parentFolder = db
        .prepare('SELECT * FROM folders WHERE id = ? AND user_id = ?')
        .get(parentIdValue, userId) as FolderRow | undefined;

      if (!parentFolder) {
        res.status(404).json({ success: false, error: 'Parent folder not found' });
        return;
      }
    }

    const sortByValue = (['name', 'created_at', 'size', 'type'].includes(sortBy as string)
      ? sortBy
      : 'name') as SortField;
    const sortOrderValue = (['asc', 'desc'].includes(sortOrder as string)
      ? sortOrder
      : 'asc') as SortOrder;

    const { folders, files } = getDirectoryContents(userId, parentIdValue);

    let fileItems = files.map((file): FileSystemItem => ({
      id: file.id,
      name: file.name,
      type: 'file',
      size: file.size,
      mimeType: file.type,
      path: file.path,
      userId: file.user_id,
      parentId: file.parent_id,
      createdAt: file.created_at,
      updatedAt: file.updated_at,
    }));

    if (type) {
      fileItems = fileItems.filter((item) => item.mimeType?.startsWith(type as string));
    }

    const folderItems: FileSystemItem[] = folders.map((folder): FileSystemItem => ({
      id: folder.id,
      name: folder.name,
      type: 'folder',
      userId: folder.user_id,
      parentId: folder.parent_id,
      createdAt: folder.created_at,
      updatedAt: folder.updated_at,
    }));

    const sortedFolders = sortItems(folderItems, sortByValue, sortOrderValue);
    const sortedFiles = sortItems(fileItems, sortByValue, sortOrderValue);

    const allItems = [...sortedFolders, ...sortedFiles];

    res.status(200).json({
      success: true,
      data: {
        items: allItems,
        total: allItems.length,
        parentId: parentIdValue,
      },
    });
  } catch (error) {
    console.error('Get file list error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.post('/upload', verifyToken, (req: AuthRequest, res: Response): void => {
  upload.array('files', 20)(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          res.status(413).json({
            success: false,
            error: 'File too large. Maximum size is 1GB',
          });
          return;
        }
        res.status(400).json({
          success: false,
          error: `Upload error: ${err.message}`,
        });
        return;
      }
      console.error('Upload middleware error:', err);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
      return;
    }

    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const files = req.files as Express.Multer.File[] | undefined;
    const { parentId } = req.body;

    if (!files || files.length === 0) {
      res.status(400).json({ success: false, error: 'No files uploaded' });
      return;
    }

    const userRow = db
      .prepare('SELECT storage_quota, used_storage FROM users WHERE id = ?')
      .get(userId) as { storage_quota: number; used_storage: number } | undefined;

    if (!userRow) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    const available = userRow.storage_quota - userRow.used_storage;

    if (totalSize > available) {
      for (const file of files) {
        deletePhysicalFile(file.path);
      }
      const shortfall = totalSize - available;
      res.status(413).json({
        success: false,
        error: `Not enough storage space. Used: ${formatBytes(userRow.used_storage)}, Total: ${formatBytes(userRow.storage_quota)}, Available: ${formatBytes(available)}, Required: ${formatBytes(totalSize)}, Shortfall: ${formatBytes(shortfall)}`,
      });
      return;
    }

    const uploadedFiles = [];

    for (const file of files) {
      const id = uuidv4();
      const name = file.originalname;
      const size = file.size;
      const type = file.mimetype || getMimeType(name);
      const filePath = file.path;

      db.prepare(
        'INSERT INTO files (id, name, size, type, path, user_id, parent_id) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).run(id, name, size, type, filePath, userId, parentId || null);

      uploadedFiles.push({
        id,
        name,
        size,
        type,
        path: filePath,
        userId,
        parentId: parentId || null,
      });
    }

    db.prepare('UPDATE users SET used_storage = used_storage + ? WHERE id = ?').run(
      totalSize,
      userId
    );

    res.status(201).json({
      success: true,
      message: 'Files uploaded successfully',
      data: {
        files: uploadedFiles,
        totalSize,
        count: uploadedFiles.length,
      },
    });
  });
});

router.get('/:id/info', verifyToken, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const fileId = req.params.id;
    const fileRow = db
      .prepare('SELECT * FROM files WHERE id = ? AND user_id = ?')
      .get(fileId, userId) as FileRow | undefined;

    if (!fileRow) {
      res.status(404).json({ success: false, error: 'File not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: formatFileResponse(fileRow),
    });
  } catch (error) {
    console.error('Get file info error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

const getTokenFromReq = (req: AuthRequest): string | null => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  return (req.query.token as string) || null;
};

const verifyFileAccess = (req: AuthRequest, res: Response): string | null => {
  const token = getTokenFromReq(req);
  if (!token) {
    res.status(401).json({ success: false, error: 'No token provided' });
    return null;
  }
  const JWT_SECRET = process.env.JWT_SECRET || 'cloud-drive-secret';
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch {
    res.status(401).json({ success: false, error: 'Invalid or expired token' });
    return null;
  }
};

router.get('/:id/preview', (req: AuthRequest, res: Response): void => {
  try {
    const userId = verifyFileAccess(req, res);
    if (!userId) return;

    const fileId = req.params.id;
    const fileRow = db
      .prepare('SELECT * FROM files WHERE id = ? AND user_id = ?')
      .get(fileId, userId) as FileRow | undefined;

    if (!fileRow) {
      res.status(404).json({ success: false, error: 'File not found' });
      return;
    }

    const encodedFilename = encodeURIComponent(fileRow.name);
    res.setHeader('Content-Disposition', `inline; filename*=UTF-8''${encodedFilename}; filename="${encodedFilename}"`);
    res.setHeader('Content-Type', fileRow.type);
    res.setHeader('Content-Length', String(fileRow.size));

    const fs = require('fs');
    const fileStream = fs.createReadStream(fileRow.path);
    fileStream.pipe(res);

    fileStream.on('error', (err: Error) => {
      console.error('Preview error:', err);
      if (!res.headersSent) {
        res.status(500).json({ success: false, error: 'File preview failed' });
      }
    });
  } catch (error) {
    console.error('Preview error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.get('/:id/download', verifyToken, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const fileId = req.params.id;
    const fileRow = db
      .prepare('SELECT * FROM files WHERE id = ? AND user_id = ?')
      .get(fileId, userId) as FileRow | undefined;

    if (!fileRow) {
      res.status(404).json({ success: false, error: 'File not found' });
      return;
    }

    const encodedFilename = encodeURIComponent(fileRow.name);
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedFilename}; filename="${encodedFilename}"`);
    res.setHeader('Content-Type', fileRow.type);
    res.setHeader('Content-Length', String(fileRow.size));

    const fs = require('fs');
    const fileStream = fs.createReadStream(fileRow.path);
    fileStream.pipe(res);

    fileStream.on('error', (err: Error) => {
      console.error('Download error:', err);
      if (!res.headersSent) {
        res.status(500).json({ success: false, error: 'File download failed' });
      }
    });
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.put('/:id/rename', verifyToken, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const fileId = req.params.id;
    const { name } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({ success: false, error: 'File name is required' });
      return;
    }

    const trimmedName = name.trim();

    const fileRow = db
      .prepare('SELECT * FROM files WHERE id = ? AND user_id = ?')
      .get(fileId, userId) as FileRow | undefined;

    if (!fileRow) {
      res.status(404).json({ success: false, error: 'File not found' });
      return;
    }

    if (fileRow.name === trimmedName) {
      res.status(200).json({
        success: true,
        data: formatFileResponse(fileRow),
      });
      return;
    }

    const nameExists = checkNameExists(userId, fileRow.parent_id, trimmedName, fileId);
    if (nameExists) {
      res.status(409).json({
        success: false,
        error: 'File or folder with this name already exists in this directory',
      });
      return;
    }

    db.prepare(
      'UPDATE files SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(trimmedName, fileId);

    const updatedFile = db
      .prepare('SELECT * FROM files WHERE id = ?')
      .get(fileId) as FileRow;

    res.status(200).json({
      success: true,
      message: 'File renamed successfully',
      data: formatFileResponse(updatedFile),
    });
  } catch (error) {
    console.error('Rename file error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.put('/:id/move', verifyToken, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const fileId = req.params.id;
    const { parentId } = req.body;

    const targetParentId = parentId === undefined || parentId === null ? null : (parentId as string);

    const fileRow = db
      .prepare('SELECT * FROM files WHERE id = ? AND user_id = ?')
      .get(fileId, userId) as FileRow | undefined;

    if (!fileRow) {
      res.status(404).json({ success: false, error: 'File not found' });
      return;
    }

    if (fileRow.parent_id === targetParentId) {
      res.status(200).json({
        success: true,
        data: formatFileResponse(fileRow),
      });
      return;
    }

    if (targetParentId !== null) {
      const targetFolder = db
        .prepare('SELECT * FROM folders WHERE id = ? AND user_id = ?')
        .get(targetParentId, userId) as FolderRow | undefined;

      if (!targetFolder) {
        res.status(404).json({ success: false, error: 'Target folder not found' });
        return;
      }
    }

    const nameExists = checkNameExists(userId, targetParentId, fileRow.name);
    if (nameExists) {
      res.status(409).json({
        success: false,
        error: 'File or folder with this name already exists in target directory',
      });
      return;
    }

    db.prepare(
      'UPDATE files SET parent_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(targetParentId, fileId);

    const updatedFile = db
      .prepare('SELECT * FROM files WHERE id = ?')
      .get(fileId) as FileRow;

    res.status(200).json({
      success: true,
      message: 'File moved successfully',
      data: formatFileResponse(updatedFile),
    });
  } catch (error) {
    console.error('Move file error:', error);
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

    const fileId = req.params.id;
    const fileRow = db
      .prepare('SELECT * FROM files WHERE id = ? AND user_id = ?')
      .get(fileId, userId) as FileRow | undefined;

    if (!fileRow) {
      res.status(404).json({ success: false, error: 'File not found' });
      return;
    }

    deletePhysicalFile(fileRow.path);
    db.prepare('DELETE FROM files WHERE id = ?').run(fileId);
    db.prepare('UPDATE users SET used_storage = used_storage - ? WHERE id = ?').run(
      fileRow.size,
      userId
    );

    res.status(200).json({
      success: true,
      message: 'File deleted successfully',
      data: {
        id: fileRow.id,
        name: fileRow.name,
        freedSize: fileRow.size,
      },
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;