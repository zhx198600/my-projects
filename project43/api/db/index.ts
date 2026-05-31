import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'cloud-drive.db');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

console.log('Connected to SQLite database');

export const initDatabase = (): void => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      storage_quota INTEGER NOT NULL DEFAULT 10737418240,
      used_storage INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('Users table created or already exists');

  db.exec(`
    CREATE TABLE IF NOT EXISTS folders (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      user_id TEXT NOT NULL,
      parent_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (parent_id) REFERENCES folders (id)
    )
  `);
  console.log('Folders table created or already exists');

  db.exec(`
    CREATE TABLE IF NOT EXISTS files (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      size INTEGER NOT NULL,
      type TEXT NOT NULL,
      path TEXT NOT NULL,
      user_id TEXT NOT NULL,
      parent_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (parent_id) REFERENCES folders (id)
    )
  `);
  console.log('Files table created or already exists');

  db.exec(`
    CREATE TABLE IF NOT EXISTS shares (
      id TEXT PRIMARY KEY,
      share_code TEXT UNIQUE NOT NULL,
      user_id TEXT NOT NULL,
      file_id TEXT,
      folder_id TEXT,
      type TEXT NOT NULL CHECK (type IN ('file', 'folder')),
      password TEXT,
      expire_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (file_id) REFERENCES files (id),
      FOREIGN KEY (folder_id) REFERENCES folders (id)
    )
  `);
  console.log('Shares table created or already exists');
};

export const checkDatabaseConnection = (): boolean => {
  try {
    db.prepare('SELECT 1 as status').get();
    return true;
  } catch {
    return false;
  }
};

interface FolderRow {
  id: string;
  name: string;
  user_id: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

export const getFolderTree = (folderId: string, userId: string): FolderRow | null => {
  const folder = db
    .prepare('SELECT * FROM folders WHERE id = ? AND user_id = ?')
    .get(folderId, userId) as FolderRow | undefined;

  if (!folder) return null;

  return folder;
};

export const getFolderBreadcrumbs = (folderId: string, userId: string): FolderRow[] => {
  const breadcrumbs: FolderRow[] = [];
  let currentId: string | null = folderId;

  while (currentId) {
    const folder = db
      .prepare('SELECT * FROM folders WHERE id = ? AND user_id = ?')
      .get(currentId, userId) as FolderRow | undefined;

    if (!folder) break;

    breadcrumbs.unshift(folder);
    currentId = folder.parent_id;
  }

  return breadcrumbs;
};

export const getFolderWithChildren = (folderId: string, userId: string): unknown => {
  const folder = db
    .prepare('SELECT * FROM folders WHERE id = ? AND user_id = ?')
    .get(folderId, userId) as FolderRow | undefined;

  if (!folder) return null;

  const children = db
    .prepare('SELECT * FROM folders WHERE parent_id = ? AND user_id = ?')
    .all(folderId, userId) as FolderRow[];

  return {
    ...folder,
    children: children.map((child) => getFolderWithChildren(child.id, userId)),
  };
};

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

export interface DirectoryContents {
  folders: FolderRow[];
  files: FileRow[];
}

export const getDirectoryContents = (userId: string, parentId: string | null): DirectoryContents => {
  const folders = db
    .prepare('SELECT * FROM folders WHERE user_id = ? AND parent_id IS ?')
    .all(userId, parentId) as FolderRow[];

  const files = db
    .prepare('SELECT * FROM files WHERE user_id = ? AND parent_id IS ?')
    .all(userId, parentId) as FileRow[];

  return { folders, files };
};

export const checkNameExists = (
  userId: string,
  parentId: string | null,
  name: string,
  excludeId?: string
): boolean => {
  const folderStmt = db.prepare(
    `SELECT id FROM folders WHERE user_id = ? AND parent_id IS ? AND name = ? ${excludeId ? 'AND id != ?' : ''}`
  );

  const fileStmt = db.prepare(
    `SELECT id FROM files WHERE user_id = ? AND parent_id IS ? AND name = ? ${excludeId ? 'AND id != ?' : ''}`
  );

  const folderParams = excludeId ? [userId, parentId, name, excludeId] : [userId, parentId, name];
  const fileParams = excludeId ? [userId, parentId, name, excludeId] : [userId, parentId, name];

  const existingFolder = folderStmt.get(...folderParams) as { id: string } | undefined;
  const existingFile = fileStmt.get(...fileParams) as { id: string } | undefined;

  return !!(existingFolder || existingFile);
};

export default db;
