import { useState } from 'react';
import { Trash2, Download, FolderOpen, X, CheckCircle } from 'lucide-react';
import { useFileStore } from '@/store/fileStore';
import { fileApi } from '@/services/api';
import type { FileSystemItem } from '@shared/types';

interface BatchToolbarProps {
  onBatchMove: (items: FileSystemItem[]) => void;
}

export default function BatchToolbar({ onBatchMove }: BatchToolbarProps) {
  const { items, selectedItems, removeItems, clearSelection } = useFileStore();
  const [isLoading, setIsLoading] = useState(false);

  const selectedItemsData = items.filter((item) => selectedItems.includes(item.id));

  const handleBatchDelete = async () => {
    if (selectedItems.length === 0) return;

    const message = `确定要删除选中的 ${selectedItems.length} 个项目吗?`;
    if (!confirm(message)) return;

    setIsLoading(true);
    try {
      const deletePromises = selectedItemsData.map((item) => fileApi.deleteItem(item.id, item.type));
      await Promise.all(deletePromises);
      removeItems(selectedItems);
      clearSelection();
    } catch (error) {
      console.error('批量删除失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBatchDownload = () => {
    selectedItemsData.forEach((item) => {
      if (item.type === 'file') {
        fileApi.downloadFile(item.id);
      }
    });
  };

  const handleBatchMove = () => {
    onBatchMove(selectedItemsData);
  };

  if (selectedItems.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">已选择 {selectedItems.length} 项</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleBatchDownload}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            批量下载
          </button>
          <button
            onClick={handleBatchMove}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
          >
            <FolderOpen className="w-4 h-4" />
            批量移动
          </button>
          <button
            onClick={handleBatchDelete}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors font-medium disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            批量删除
          </button>
          <button
            onClick={clearSelection}
            disabled={isLoading}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}