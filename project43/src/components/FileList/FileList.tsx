import { useState, useMemo } from 'react';
import { List, Grid, ArrowUpDown, FolderOpen } from 'lucide-react';
import { useFileStore } from '@/store/fileStore';
import FileListItem from './FileListItem';
import FileGridItem from './FileGridItem';
import type { FileSystemItem } from '@shared/types';

interface FileListProps {
  searchQuery: string;
  onPreviewFile?: (item: FileSystemItem) => void;
  onRename?: (item: FileSystemItem) => void;
  onMove?: (item: FileSystemItem) => void;
  onShare?: (item: FileSystemItem) => void;
}

type SortOption = 'name' | 'created_at' | 'size';

export default function FileList({ searchQuery, onPreviewFile, onRename, onMove, onShare }: FileListProps) {
  const {
    items,
    viewMode,
    sortBy,
    sortOrder,
    setViewMode,
    setSortBy,
    setSortOrder,
    isLoading,
    selectAll,
    selectedItems,
    clearSelection,
  } = useFileStore();
  const [showSortMenu, setShowSortMenu] = useState(false);

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'name', label: '名称' },
    { value: 'created_at', label: '修改时间' },
    { value: 'size', label: '大小' },
  ];

  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((item) =>
        item.name.toLowerCase().includes(query)
      );
    }

    result.sort((a, b) => {
      if (a.type === 'folder' && b.type !== 'folder') return -1;
      if (a.type !== 'folder' && b.type === 'folder') return 1;

      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'created_at':
          comparison =
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case 'size':
          comparison = (a.size || 0) - (b.size || 0);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [items, searchQuery, sortBy, sortOrder]);

  const handleSortChange = (option: SortOption) => {
    if (sortBy === option) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(option);
      setSortOrder('asc');
    }
    setShowSortMenu(false);
  };

  const isAllSelected =
    items.length > 0 && selectedItems.length === items.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      clearSelection();
    } else {
      selectAll();
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (filteredAndSortedItems.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
        <FolderOpen className="w-20 h-20 mb-4" />
        <p className="text-lg font-medium">暂无文件</p>
        <p className="text-sm mt-1">上传文件或创建文件夹开始使用</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-100">
        <div className="flex items-center gap-4">
          {viewMode === 'list' && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={handleSelectAll}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">
                {selectedItems.length > 0
                  ? `已选择 ${selectedItems.length} 项`
                  : '全选'}
              </span>
            </label>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowUpDown className="w-4 h-4" />
              <span>
                排序: {sortOptions.find((o) => o.value === sortBy)?.label}
                {sortOrder === 'asc' ? ' ↑' : ' ↓'}
              </span>
            </button>

            {showSortMenu && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      sortBy === option.value
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {option.label}
                    {sortBy === option.value && (
                      <span className="ml-2">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {viewMode === 'list' ? (
          <div className="space-y-1">
            <div className="flex items-center gap-4 px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="w-10"></div>
              <div className="flex-1">名称</div>
              <div className="w-24 text-right">大小</div>
              <div className="w-40 text-right">修改时间</div>
              <div className="w-10"></div>
            </div>
            {filteredAndSortedItems.map((item: FileSystemItem) => (
              <FileListItem key={item.id} item={item} onPreview={onPreviewFile} onRename={onRename} onMove={onMove} onShare={onShare} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredAndSortedItems.map((item: FileSystemItem) => (
              <FileGridItem key={item.id} item={item} onPreview={onPreviewFile} onRename={onRename} onMove={onMove} onShare={onShare} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
