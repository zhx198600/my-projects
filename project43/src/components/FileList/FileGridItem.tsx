import { useState } from 'react';
import { MoreHorizontal, Download, Trash2, Eye, Pencil, FolderOpen, Share2 } from 'lucide-react';
import { useFileStore } from '@/store/fileStore';
import { fileApi } from '@/services/api';
import { formatFileSize, getFileIcon, getFileColor } from '@/utils/format';
import type { FileSystemItem } from '@shared/types';

interface FileGridItemProps {
  item: FileSystemItem;
  onPreview?: (item: FileSystemItem) => void;
  onRename?: (item: FileSystemItem) => void;
  onMove?: (item: FileSystemItem) => void;
  onShare?: (item: FileSystemItem) => void;
}

export default function FileGridItem({ item, onPreview, onRename, onMove, onShare }: FileGridItemProps) {
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

  const isImage = item.type === 'file' && item.mimeType?.startsWith('image/');
  const isVideo = item.type === 'file' && item.mimeType?.startsWith('video/');
  const isMedia = isImage || isVideo;

  const handleThumbnailClick = (e: React.MouseEvent) => {
    if (isMedia) {
      e.stopPropagation();
      onPreview?.(item);
    }
  };

  const handleQuickPreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPreview?.(item);
  };

  const handleQuickDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fileApi.downloadFile(item.id);
    } catch (error) {
      console.error('下载失败:', error);
    }
  };

  return (
    <div
      className={`group relative rounded-xl cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'ring-2 ring-blue-500 bg-blue-50'
          : 'hover:shadow-lg bg-white border border-gray-100'
      }`}
      onClick={() => toggleSelectItem(item.id)}
      onDoubleClick={handleDoubleClick}
    >
      <div
        className={`relative aspect-square bg-gray-50 rounded-t-xl overflow-hidden ${
          isMedia ? 'cursor-zoom-in' : ''
        }`}
        onClick={handleThumbnailClick}
      >
        {isImage ? (
          <img
            src={`/api/files/${item.id}/download`}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : isVideo ? (
          <div className="w-full h-full bg-black flex items-center justify-center">
            <video
              src={`/api/files/${item.id}/download`}
              className="w-full h-full object-cover"
              muted
              playsInline
              preload="metadata"
            />
          </div>
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${iconColor}`}>
            <Icon className="w-16 h-16" />
          </div>
        )}

        {item.type === 'file' && (
          <div
            className="absolute top-2 left-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {isPreviewable() && (
              <button
                onClick={handleQuickPreview}
                className="p-1.5 bg-white/80 backdrop-blur-sm rounded-lg hover:bg-white transition-all duration-200 shadow-sm"
              >
                <Eye className="w-4 h-4 text-gray-600" />
              </button>
            )}
            <button
              onClick={handleQuickDownload}
              className="p-1.5 bg-white/80 backdrop-blur-sm rounded-lg hover:bg-white transition-all duration-200 shadow-sm"
            >
              <Download className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white transition-all duration-200 shadow-sm"
        >
          <MoreHorizontal className="w-4 h-4 text-gray-600" />
        </button>

        {showMenu && (
          <div
            className="absolute right-2 top-10 w-36 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50"
            onClick={(e) => e.stopPropagation()}
          >
            {isPreviewable() && (
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

      <div className="p-3">
        <p className="font-medium text-gray-800 truncate text-sm">{item.name}</p>
        <p className="text-xs text-gray-500 mt-1">
          {item.type === 'file' ? formatFileSize(item.size || 0) : '文件夹'}
        </p>
      </div>
    </div>
  );
}
