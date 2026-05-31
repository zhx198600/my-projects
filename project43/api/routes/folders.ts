import { Router, type Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db, { getFolderBreadcrumbs, getFolderWithChildren } from '../db/index.js';
import { verifyToken, type AuthRequest } from '../middleware/auth.js';

const router = Router();

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

const formatFolderTree = (row: unknown): unknown => {
  const folder = row as FolderRow & { children: unknown[] };
  return {
    id: folder.id,
    name: folder.name,
    parentId: folder.parent_id,
    children: folder.children ? folder.children.map(formatFolderTree) : [],
  };
};

const formatBreadcrumb = (row: FolderRow) => ({
  id: row.id,
  name: row.name,
  parentId: row.parent_id,
});

router.post('/', verifyToken, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const { name, parentId } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({ success: false, error: 'Folder name is required' });
      return;
    }

    const trimmedName = name.trim();

    if (parentId !== undefined && parentId !== null) {
      const parentFolder = db
        .prepare('SELECT * FROM folders WHERE id = ? AND user_id = ?')
        .get(parentId, userId) as FolderRow | undefined;

      if (!parentFolder) {
        res.status(404).json({ success: false, error: 'Parent folder not found' });
        return;
      }
    }

    const existingFolder = db
      .prepare(
        'SELECT id FROM folders WHERE name = ? AND user_id = ? AND parent_id IS ?'
      )
      .get(trimmedName, userId, parentId || null) as { id: string } | undefined;

    if (existingFolder) {
      res.status(409).json({
        success: false,
        error: 'Folder with this name already exists in this directory',
      });
      return;
    }

    const id = uuidv4();

    db.prepare(
      'INSERT INTO folders (id, name, user_id, parent_id) VALUES (?, ?, ?, ?)'
    ).run(id, trimmedName, userId, parentId || null);

    const folderRow = db
      .prepare('SELECT * FROM folders WHERE id = ?')
      .get(id) as FolderRow;

    res.status(201).json({
      success: true,
      message: 'Folder created successfully',
      data: formatFolderResponse(folderRow),
    });
  } catch (error) {
    console.error('Create folder error:', error);
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

    const { parentId } = req.query;
    const parentIdValue = parentId === undefined || parentId === 'null' ? null : parentId as string;

    if (parentIdValue !== null) {
      const parentFolder = db
        .prepare('SELECT * FROM folders WHERE id = ? AND user_id = ?')
        .get(parentIdValue, userId) as FolderRow | undefined;

      if (!parentFolder) {
        res.status(404).json({ success: false, error: 'Parent folder not found' });
        return;
      }
    }

    const folders = db
      .prepare(
        'SELECT * FROM folders WHERE user_id = ? AND parent_id IS ? ORDER BY name ASC'
      )
      .all(userId, parentIdValue) as FolderRow[];

    res.status(200).json({
      success: true,
      data: folders.map(formatFolderResponse),
    });
  } catch (error) {
    console.error('Get folders error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.get('/:id', verifyToken, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const folderId = req.params.id;
    const folderRow = db
      .prepare('SELECT * FROM folders WHERE id = ? AND user_id = ?')
      .get(folderId, userId) as FolderRow | undefined;

    if (!folderRow) {
      res.status(404).json({ success: false, error: 'Folder not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: formatFolderResponse(folderRow),
    });
  } catch (error) {
    console.error('Get folder error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.put('/:id', verifyToken, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const folderId = req.params.id;
    const { name } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({ success: false, error: 'Folder name is required' });
      return;
    }

    const trimmedName = name.trim();

    const existingFolder = db
      .prepare('SELECT * FROM folders WHERE id = ? AND user_id = ?')
      .get(folderId, userId) as FolderRow | undefined;

    if (!existingFolder) {
      res.status(404).json({ success: false, error: 'Folder not found' });
      return;
    }

    if (existingFolder.name === trimmedName) {
      res.status(200).json({
        success: true,
        data: formatFolderResponse(existingFolder),
      });
      return;
    }

    const duplicateFolder = db
      .prepare(
        'SELECT id FROM folders WHERE name = ? AND user_id = ? AND parent_id IS ? AND id != ?'
      )
      .get(trimmedName, userId, existingFolder.parent_id, folderId) as { id: string } | undefined;

    if (duplicateFolder) {
      res.status(409).json({
        success: false,
        error: 'Folder with this name already exists in this directory',
      });
      return;
    }

    db.prepare(
      'UPDATE folders SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(trimmedName, folderId);

    const updatedFolder = db
      .prepare('SELECT * FROM folders WHERE id = ?')
      .get(folderId) as FolderRow;

    res.status(200).json({
      success: true,
      message: 'Folder updated successfully',
      data: formatFolderResponse(updatedFolder),
    });
  } catch (error) {
    console.error('Update folder error:', error);
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

    const folderId = req.params.id;
    const { parentId } = req.body;

    const targetParentId = parentId === undefined || parentId === null ? null : (parentId as string);

    const existingFolder = db
      .prepare('SELECT * FROM folders WHERE id = ? AND user_id = ?')
      .get(folderId, userId) as FolderRow | undefined;

    if (!existingFolder) {
      res.status(404).json({ success: false, error: 'Folder not found' });
      return;
    }

    if (existingFolder.parent_id === targetParentId) {
      res.status(200).json({
        success: true,
        data: formatFolderResponse(existingFolder),
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

    const duplicateFolder = db
      .prepare(
        'SELECT id FROM folders WHERE name = ? AND user_id = ? AND parent_id IS ?'
      )
      .get(existingFolder.name, userId, targetParentId) as { id: string } | undefined;

    if (duplicateFolder) {
      res.status(409).json({
        success: false,
        error: 'Folder with this name already exists in target directory',
      });
      return;
    }

    db.prepare(
      'UPDATE folders SET parent_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(targetParentId, folderId);

    const updatedFolder = db
      .prepare('SELECT * FROM folders WHERE id = ?')
      .get(folderId) as FolderRow;

    res.status(200).json({
      success: true,
      message: 'Folder moved successfully',
      data: formatFolderResponse(updatedFolder),
    });
  } catch (error) {
    console.error('Move folder error:', error);
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

    const folderId = req.params.id;

    const existingFolder = db
      .prepare('SELECT * FROM folders WHERE id = ? AND user_id = ?')
      .get(folderId, userId) as FolderRow | undefined;

    if (!existingFolder) {
      res.status(404).json({ success: false, error: 'Folder not found' });
      return;
    }

    const childFolders = db
      .prepare('SELECT id FROM folders WHERE parent_id = ? AND user_id = ?')
      .all(folderId, userId) as { id: string }[];

    if (childFolders.length > 0) {
      res.status(400).json({
        success: false,
        error: 'Cannot delete folder that contains subfolders',
      });
      return;
    }

    const childFiles = db
      .prepare('SELECT id FROM files WHERE parent_id = ? AND user_id = ?')
      .all(folderId, userId) as { id: string }[];

    if (childFiles.length > 0) {
      res.status(400).json({
        success: false,
        error: 'Cannot delete folder that contains files',
      });
      return;
    }

    db.prepare('DELETE FROM folders WHERE id = ?').run(folderId);

    res.status(200).json({
      success: true,
      message: 'Folder deleted successfully',
      data: {
        id: existingFolder.id,
        name: existingFolder.name,
      },
    });
  } catch (error) {
    console.error('Delete folder error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.get('/:id/breadcrumb', verifyToken, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const folderId = req.params.id;

    const existingFolder = db
      .prepare('SELECT * FROM folders WHERE id = ? AND user_id = ?')
      .get(folderId, userId) as FolderRow | undefined;

    if (!existingFolder) {
      res.status(404).json({ success: false, error: 'Folder not found' });
      return;
    }

    const breadcrumbs = getFolderBreadcrumbs(folderId, userId);

    res.status(200).json({
      success: true,
      data: breadcrumbs.map(formatBreadcrumb),
    });
  } catch (error) {
    console.error('Get breadcrumb error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.get('/:id/tree', verifyToken, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const folderId = req.params.id;

    const existingFolder = db
      .prepare('SELECT * FROM folders WHERE id = ? AND user_id = ?')
      .get(folderId, userId) as FolderRow | undefined;

    if (!existingFolder) {
      res.status(404).json({ success: false, error: 'Folder not found' });
      return;
    }

    const breadcrumbs = getFolderBreadcrumbs(folderId, userId);
    const tree = getFolderWithChildren(folderId, userId);

    res.status(200).json({
      success: true,
      data: {
        breadcrumbs: breadcrumbs.map(formatBreadcrumb),
        tree: formatFolderTree(tree),
      },
    });
  } catch (error) {
    console.error('Get folder tree error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
