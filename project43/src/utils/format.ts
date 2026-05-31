import {
  Folder,
  FileText,
  Image,
  Video,
  Music,
  File,
  Archive,
  Code,
  FileSpreadsheet,
  FileQuestion,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 0) return '-';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)} 天前`;

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  if (year === now.getFullYear()) {
    return `${month}-${day} ${hours}:${minutes}`;
  }

  return `${year}-${month}-${day}`;
}

export function getFileIcon(type: string, mimeType?: string): LucideIcon {
  if (type === 'folder') {
    return Folder;
  }

  if (!mimeType) {
    return File;
  }

  if (mimeType.startsWith('image/')) {
    return Image;
  }
  if (mimeType.startsWith('video/')) {
    return Video;
  }
  if (mimeType.startsWith('audio/')) {
    return Music;
  }

  if (mimeType.includes('pdf') || mimeType.includes('document')) {
    return FileText;
  }
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
    return FileSpreadsheet;
  }
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar') || mimeType.includes('7z')) {
    return Archive;
  }
  if (
    mimeType.includes('javascript') ||
    mimeType.includes('typescript') ||
    mimeType.includes('html') ||
    mimeType.includes('css') ||
    mimeType.includes('python') ||
    mimeType.includes('java') ||
    mimeType.includes('json') ||
    mimeType.includes('xml')
  ) {
    return Code;
  }
  if (mimeType.includes('text/')) {
    return FileText;
  }

  return FileQuestion;
}

export function getFileColor(type: string, mimeType?: string): string {
  if (type === 'folder') {
    return 'text-yellow-500';
  }

  if (!mimeType) {
    return 'text-gray-500';
  }

  if (mimeType.startsWith('image/')) {
    return 'text-green-500';
  }
  if (mimeType.startsWith('video/')) {
    return 'text-purple-500';
  }
  if (mimeType.startsWith('audio/')) {
    return 'text-pink-500';
  }
  if (mimeType.includes('pdf') || mimeType.includes('document')) {
    return 'text-red-500';
  }
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
    return 'text-emerald-500';
  }
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar') || mimeType.includes('7z')) {
    return 'text-amber-500';
  }
  if (
    mimeType.includes('javascript') ||
    mimeType.includes('typescript') ||
    mimeType.includes('html') ||
    mimeType.includes('css') ||
    mimeType.includes('python') ||
    mimeType.includes('java') ||
    mimeType.includes('json') ||
    mimeType.includes('xml')
  ) {
    return 'text-blue-500';
  }
  if (mimeType.includes('text/')) {
    return 'text-gray-600';
  }

  return 'text-gray-500';
}
