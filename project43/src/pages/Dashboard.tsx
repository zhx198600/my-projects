import { useState, useEffect, useCallback } from 'react';
import { X, FolderOpen, ChevronRight, ChevronDown, Folder } from 'lucide-react';
import { useFileStore } from '@/store/fileStore';
import { fileApi } from '@/services/api';
import Sidebar from '@/components/Layout/Sidebar';
import Header from '@/components/Layout/Header';
import Breadcrumb from '@/components/Layout/Breadcrumb';
import FileList from '@/components/FileList/FileList';
import DropZone from '@/components/Upload/DropZone';
import NewFolderModal from '@/components/Modal/NewFolderModal';
import RenameModal from '@/components/Modal/RenameModal';
import MoveModal from '@/components/Modal/MoveModal';
import ShareModal from '@/components/ShareModal';
import FilePreview from '@/components/Preview/FilePreview';
import BatchToolbar from '@/components/FileList/BatchToolbar';
import type { FileSystemItem } from '@shared/types';

export default function Dashboard() {
  const [activeType, setActiveType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileSystemItem | null>(null);
  const [renameItem, setRenameItem] = useState<FileSystemItem | null>(null);
  const [moveItem, setMoveItem] = useState<FileSystemItem | null>(null);
  const [batchMoveItems, setBatchMoveItems] = useState<FileSystemItem[]>([]);
  const [shareItem, setShareItem] = useState<FileSystemItem | null>(null);
  const [showBatchMoveModal, setShowBatchMoveModal] = useState(false);
  const {
    setItems,
    setIsLoading,
    setCurrentFolderId,
    setBreadcrumb,
    currentFolderId,
    sortBy,
    sortOrder,
    selectedItems,
    clearSelection,
  } = useFileStore();

  const loadFiles = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fileApi.getFiles(
        currentFolderId,
        sortBy,
        sortOrder
      );
      setItems(response.items);

      if (currentFolderId) {
        const breadcrumb = await fileApi.getBreadcrumb(currentFolderId);
        setBreadcrumb(breadcrumb);
      } else {
        setBreadcrumb([]);
      }
    } catch (error) {
      console.error('加载文件失败:', error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentFolderId, sortBy, sortOrder, setIsLoading, setItems, setBreadcrumb]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles, activeType]);

  const handleTypeChange = (type: string | null) => {
    setActiveType(type);
    setCurrentFolderId(null);
    setBreadcrumb([]);
  };

  const handleRename = (item: FileSystemItem) => {
    setRenameItem(item);
  };

  const handleMove = (item: FileSystemItem) => {
    setMoveItem(item);
  };

  const handleShare = (item: FileSystemItem) => {
    setShareItem(item);
  };

  const handleBatchMove = (items: FileSystemItem[]) => {
    setBatchMoveItems(items);
    setShowBatchMoveModal(true);
  };

  const handleBatchMoveConfirm = async (targetFolderId: string | null) => {
    try {
      const movePromises = batchMoveItems.map((item) => {
        const moveApi = item.type === 'folder' ? fileApi.moveFolder : fileApi.moveFile;
        return moveApi(item.id, targetFolderId);
      });
      await Promise.all(movePromises);
      clearSelection();
      loadFiles();
    } catch (error) {
      console.error('批量移动失败:', error);
    }
    setShowBatchMoveModal(false);
    setBatchMoveItems([]);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeType={activeType} onTypeChange={handleTypeChange} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          onUploadClick={() => setShowUploadModal(true)}
          onNewFolderClick={() => setShowNewFolderModal(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <Breadcrumb />
        <FileList
          searchQuery={searchQuery}
          onPreviewFile={setPreviewFile}
          onRename={handleRename}
          onMove={handleMove}
          onShare={handleShare}
        />
      </div>

      <DropZone
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onPreview={setPreviewFile}
      />
      <NewFolderModal
        isOpen={showNewFolderModal}
        onClose={() => setShowNewFolderModal(false)}
      />
      {renameItem && (
        <RenameModal
          isOpen={!!renameItem}
          onClose={() => setRenameItem(null)}
          item={renameItem}
        />
      )}
      {moveItem && (
        <MoveModal
          isOpen={!!moveItem}
          onClose={() => setMoveItem(null)}
          item={moveItem}
        />
      )}
      {shareItem && (
        <ShareModal
          isOpen={!!shareItem}
          onClose={() => setShareItem(null)}
          itemId={shareItem.id}
          itemName={shareItem.name}
          itemType={shareItem.type}
        />
      )}
      {previewFile && (
        <FilePreview
          file={fileApi.getFilePreviewInfo(previewFile)}
          onClose={() => setPreviewFile(null)}
        />
      )}
      {selectedItems.length > 0 && (
        <BatchToolbar onBatchMove={handleBatchMove} />
      )}
      {showBatchMoveModal && batchMoveItems.length > 0 && (
        <BatchMoveModal
          isOpen={showBatchMoveModal}
          onClose={() => {
            setShowBatchMoveModal(false);
            setBatchMoveItems([]);
          }}
          onConfirm={handleBatchMoveConfirm}
          itemCount={batchMoveItems.length}
        />
      )}
    </div>
  );
}

interface BatchMoveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (targetFolderId: string | null) => void;
  itemCount: number;
}

function BatchMoveModal({ isOpen, onClose, onConfirm, itemCount }: BatchMoveModalProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [allFolders, setAllFolders] = useState<FileSystemItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAllFolders();
      setSelectedFolderId(null);
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

  interface FolderTreeNode {
    id: string;
    name: string;
    parentId: string | null;
    children: FolderTreeNode[];
  }

  const buildFolderTree = (
    folders: FileSystemItem[],
    parentId: string | null = null
  ): FolderTreeNode[] => {
    return folders
      .filter((f) => f.parentId === parentId)
      .map((f) => ({
        id: f.id,
        name: f.name,
        parentId: f.parentId,
        children: buildFolderTree(folders, f.id),
      }));
  };

  const folderTree = buildFolderTree(allFolders);

  interface TreeItemProps {
    node: FolderTreeNode;
    level: number;
    selectedId: string | null;
    onSelect: (id: string | null) => void;
  }

  const TreeItem = ({ node, level, selectedId, onSelect }: TreeItemProps) => {
    const [expanded, setExpanded] = useState(level < 2);
    const isSelected = selectedId === node.id;
    const hasChildren = node.children.length > 0;

    return (
      <div>
        <div
          className={`flex items-center gap-1 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
            isSelected
              ? 'bg-blue-100 text-blue-700'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => onSelect(node.id)}
        >
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
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
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await onConfirm(selectedFolderId);
    } finally {
      setIsLoading(false);
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
              <h3 className="text-lg font-semibold text-gray-800">批量移动</h3>
              <p className="text-sm text-gray-500">{itemCount} 个项目</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              选择目标文件夹
            </label>
            <div className="border border-gray-200 rounded-xl overflow-y-auto max-h-64 bg-gray-50">
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
                  />
                ))
              ) : (
                <div className="px-3 py-4 text-center text-gray-400 text-sm">
                  暂无文件夹
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2.5 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSubmit}
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
        </div>
      </div>
    </div>
  );
}