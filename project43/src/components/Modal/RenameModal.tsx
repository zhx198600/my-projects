import { useState } from 'react';
import { X, Pencil } from 'lucide-react';
import { useFileStore } from '@/store/fileStore';
import { fileApi } from '@/services/api';
import type { FileSystemItem } from '@shared/types';

interface RenameModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: FileSystemItem;
}

export default function RenameModal({ isOpen, onClose, item }: RenameModalProps) {
  const [newName, setNewName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { updateItem } = useFileStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newName.trim()) {
      setError('请输入新名称');
      return;
    }

    if (newName.trim() === item.name) {
      setError('新名称与原名称相同');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const updatedItem = item.type === 'folder'
        ? await fileApi.renameFolder(item.id, newName.trim())
        : await fileApi.renameFile(item.id, newName.trim());

      updateItem(item.id, {
        name: updatedItem.name,
        updatedAt: updatedItem.updatedAt,
      });

      setNewName('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '重命名失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setNewName('');
      setError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Pencil className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">重命名</h3>
              <p className="text-sm text-gray-500 truncate max-w-48">{item.name}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              新名称
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
                setError('');
              }}
              placeholder={item.name}
              autoFocus
              disabled={isLoading}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
            />
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-5 py-2.5 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  重命名中...
                </>
              ) : (
                '确认'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}