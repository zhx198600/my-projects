export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface HealthCheckResponse {
  server: boolean;
  database: boolean;
  timestamp: string;
  uptime: number;
  version: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  storageQuota: number;
  usedStorage: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  storageQuota: number;
  usedStorage: number;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface RegisterResponse {
  token: string;
  user: AuthUser;
}

export interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  path: string;
  userId: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Folder {
  id: string;
  name: string;
  userId: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  path: string;
  userId: string;
  parentId: string | null;
}

export interface FileUploadResponse {
  files: UploadedFile[];
  totalSize: number;
  count: number;
}

export interface FileDownloadInfo {
  id: string;
  name: string;
  size: number;
  type: string;
  path: string;
  userId: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FolderWithChildren extends Folder {
  children: FolderWithChildren[];
}

export interface FolderTree {
  id: string;
  name: string;
  parentId: string | null;
  children: FolderTree[];
}

export interface FolderBreadcrumb {
  id: string;
  name: string;
  parentId: string | null;
}

export interface FileSystemItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  mimeType?: string;
  path?: string;
  userId: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FileListQuery {
  parentId?: string | null;
  sortBy?: 'name' | 'created_at' | 'size' | 'type';
  sortOrder?: 'asc' | 'desc';
  type?: string;
}

export interface FileListResponse {
  items: FileSystemItem[];
  total: number;
  parentId: string | null;
}

export interface StorageInfo {
  total: number;
  used: number;
  available: number;
  percentage: number;
  formatted: string;
}

export interface StorageCheckResult {
  sufficient: boolean;
  available: number;
  required: number;
  message: string;
}

export type PreviewType = 'image' | 'pdf' | 'text' | 'video' | 'audio' | 'unsupported';

export interface FilePreviewInfo {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  previewType: PreviewType;
  previewUrl: string;
}

export interface Share {
  id: string;
  shareCode: string;
  userId: string;
  fileId: string | null;
  folderId: string | null;
  type: 'file' | 'folder';
  password: string | null;
  expireAt: string | null;
  createdAt: string;
}

export interface ShareCreateRequest {
  itemId: string;
  itemType: 'file' | 'folder';
  password?: string;
  expireDays?: number;
}

export interface ShareAccessRequest {
  password?: string;
}

export interface ShareAccessResponse {
  share: Share;
  item?: FileSystemItem;
  items?: FileSystemItem[];
  downloadUrl?: string;
}

export interface RenameRequest {
  name: string;
}

export interface MoveRequest {
  parentId: string | null;
}
