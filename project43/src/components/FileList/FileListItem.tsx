import { useState } from 'react';
import { MoreHorizontal, Download, Trash2, Eye, Pencil, FolderOpen, Share2 } from 'lucide-react';
import { useFileStore } from '@/store/fileStore';
import { fileApi } from '@/services/api';
import { formatFileSize, formatDate, getFileIcon, getFileColor } from '@/utils/format';
import type { FileSystemItem } from '@shared/types';

interface FileListItemProps {
  item: FileSystemItem;
  onPreview?: (item: FileSystemItem) => void;
  onRename?: (item: FileSystemItem) => void;
  onMove?: (item: FileSystemItem) => void;
  onShare?: (item: FileSystemItem) => void;
}

export default function FileListItem({ item, onPreview, onRename, onMove, onShare }: FileListItemProps) {
  const {
    toggleSelectItem,
    selectedItems,
    setCurrentFolderId,
    setItems,
    setBreadcrumb,
    setIsLoading,
    removeItem,
  } = useFileStore();
  const [showMenu, setShowMenu] = useState(false);
  const isSelected = selectedItems.includes(item.id);
  const Icon = getFileIcon(item.type, item.mimeType);
  const iconColor = getFileColor(item.type, item.mimeType);

  const isPreviewable = (): boolean => {
    if (item.type !== 'file' || !item.mimeType) return false;
    const mimeType = item.mimeType;
    return (
      mimeType.startsWith('image/') ||
      mimeType === 'application/pdf' ||
      mimeType.startsWith('video/') ||
      mimeType.startsWith('audio/') ||
      mimeType.startsWith('text/')
    );
  };

  const handleDoubleClick = async () => {
    if (item.type === 'folder') {
      setIsLoading(true);
      try {
        setCurrentFolderId(item.id);
        const response = await fileApi.getFiles(item.id);
        setItems(response.items);
        const breadcrumb = await fileApi.getBreadcrumb(item.id);
        setBreadcrumb(breadcrumb);
      } catch (error) {
        console.error('进入文件夹失败:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    try {
      await fileApi.downloadFile(item.id);
    } catch (error) {
      console.error('下载失败:', error);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    if (confirm(`确定要删除 "${item.name}" 吗?`)) {
      try {
        await fileApi.deleteItem(item.id, item.type);
        removeItem(item.id);
      } catch (error) {
        console.error('删除失败:', error);
      }
    }
  };

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    if (item.type === 'file' && isPreviewable()) {
      onPreview?.(item);
    }
  };

  const handleRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onRename?.(item);
  };

  const handleMove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onMove?.(item);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onShare?.(item);
  };

  return (
    <div
      className={`group flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'bg-blue-50 border border-blue-200'
          : 'hover:bg-gray-50 border border-transparent'
      }`}
      onClick={() => toggleSelectItem(item.id)}
      onDoubleClick={handleDoubleClick}
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gray-50 ${iconColor}`}>
        <Icon className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-800 truncate">{item.name}</p>
        <p className="text-xs text-gray-500 truncate">
          {item.type === 'folder'
            ? '文件夹'
            : item.mimeType || '文件'}
        </p>
      </div>

      <div className="text-sm text-gray-500 w-24 text-right">
        {item.type === 'file' ? formatFileSize(item.size || 0) : '-'}
      </div>

      <div className="text-sm text-gray-500 w-40 text-right">
        {formatDate(item.updatedAt)}
      </div>

      {item.type === 'file' && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {isPreviewable() && (
            <button
              onClick={handlePreview}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <Eye className="w-4 h-4 text-gray-500" />
            </button>
          )}
          <button
            onClick={handleDownload}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <Download className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      )}

      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-gray-100 transition-all duration-200"
        >
          <MoreHorizontal className="w-4 h-4 text-gray-400" />
        </button>

        {showMenu && (
          <div
            className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50"
            onClick={(e) => e.stopPropagation()}
          >
            {item.type === 'file' && isPreviewable() && (
              <button
                onClick={handlePreview}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Eye className="w-4 h-4" />
                预览
              </button>
            )}
            {item.type === 'file' && (
              <button
                onClick={handleDownload}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Download className="w-4 h-4" />
                下载
              </button>
            )}
            <button
              onClick={handleRename}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Pencil className="w-4 h-4" />
              重命名
            </button>
            <button
              onClick={handleMove}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <FolderOpen className="w-4 h-4" />
              移动到
            </button>
            <button
              onClick={handleShare}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Share2 className="w-4 h-4" />
              分享
            </button>
            <button
              onClick={handleDelete}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
              删除
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
