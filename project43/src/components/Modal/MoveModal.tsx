import { useState, useEffect } from 'react';
import { X, FolderOpen, ChevronRight, ChevronDown, Folder } from 'lucide-react';
import { useFileStore } from '@/store/fileStore';
import { fileApi } from '@/services/api';
import type { FileSystemItem } from '@shared/types';

interface MoveModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: FileSystemItem;
}

interface FolderTreeNode {
  id: string;
  name: string;
  parentId: string | null;
  children: FolderTreeNode[];
}

function buildFolderTree(
  allFolders: FileSystemItem[],
  parentId: string | null = null
): FolderTreeNode[] {
  return allFolders
    .filter((f) => f.parentId === parentId)
    .map((f) => ({
      id: f.id,
      name: f.name,
      parentId: f.parentId,
      children: buildFolderTree(allFolders, f.id),
    }));
}

interface TreeItemProps {
  node: FolderTreeNode;
  level: number;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  excludeId: string;
}

function TreeItem({ node, level, selectedId, onSelect, excludeId }: TreeItemProps) {
  const [expanded, setExpanded] = useState(level < 2);
  const isSelected = selectedId === node.id;
  const isExcluded = node.id === excludeId;
  const hasChildren = node.children.length > 0;

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  return (
    <div>
      <div
        className={`flex items-center gap-1 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
          isSelected
            ? 'bg-blue-100 text-blue-700'
            : isExcluded
              ? 'text-gray-400 cursor-not-allowed'
              : 'hover:bg-gray-100 text-gray-700'
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => {
          if (!isExcluded) {
            onSelect(node.id);
          }
        }}
      >
        {hasChildren ? (
          <button
            onClick={toggleExpand}
            className="p-0.5 hover:bg-gray-200 rounded"
          >
            {expanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        ) : (
          <div className="w-5 h-5" />
        )}
        <Folder className="w-4 h-4 flex-shrink-0" />
        <span className="text-sm truncate">{node.name}</span>
      </div>
      {expanded && hasChildren && (
        <div>
          {node.children.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              level={level + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              excludeId={excludeId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function MoveModal({ isOpen, onClose, item }: MoveModalProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [allFolders, setAllFolders] = useState<FileSystemItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { updateItem } = useFileStore();

  useEffect(() => {
    if (isOpen) {
      fetchAllFolders();
      setSelectedFolderId(null);
      setError('');
    }
  }, [isOpen]);

  const fetchAllFolders = async () => {
    try {
      const topLevel = await fileApi.getFolders(null);
      const all: FileSystemItem[] = [];
      const fetchChildren = async (folders: FileSystemItem[]) => {
        for (const folder of folders) {
          all.push(folder);
          const children = await fileApi.getFolders(folder.id);
          if (children.length > 0) {
            await fetchChildren(children);
          }
        }
      };
      await fetchChildren(topLevel);
      setAllFolders(all);
    } catch (err) {
      console.error('加载文件夹失败:', err);
    }
  };

  const folderTree = buildFolderTree(allFolders);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const moveApi = item.type === 'folder' ? fileApi.moveFolder : fileApi.moveFile;
      const updatedItem = await moveApi(item.id, selectedFolderId);

      updateItem(item.id, {
        parentId: updatedItem.parentId,
        updatedAt: updatedItem.updatedAt,
      });

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '移动失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setSelectedFolderId(null);
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
              <FolderOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">移动到</h3>
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
              选择目标文件夹
            </label>
            <div
              className="border border-gray-200 rounded-xl overflow-y-auto max-h-64 bg-gray-50"
            >
              <div
                className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors ${
                  selectedFolderId === null
                    ? 'bg-blue-100 text-blue-700'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
                onClick={() => setSelectedFolderId(null)}
              >
                <ChevronRight className="w-4 h-4 opacity-50" />
                <FolderOpen className="w-4 h-4" />
                <span className="text-sm">根目录</span>
              </div>
              {folderTree.length > 0 ? (
                folderTree.map((node) => (
                  <TreeItem
                    key={node.id}
                    node={node}
                    level={0}
                    selectedId={selectedFolderId}
                    onSelect={setSelectedFolderId}
                    excludeId={item.id}
                  />
                ))
              ) : (
                <div className="px-3 py-4 text-center text-gray-400 text-sm">
                  暂无文件夹
                </div>
              )}
            </div>
          </div>

          {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

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
                  移动中...
                </>
              ) : (
                '确认移动'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}