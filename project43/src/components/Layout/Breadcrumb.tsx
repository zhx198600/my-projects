import { ChevronRight, Home } from 'lucide-react';
import { useFileStore } from '@/store/fileStore';
import { fileApi } from '@/services/api';
import type { FolderBreadcrumb } from '@shared/types';

export default function Breadcrumb() {
  const { breadcrumb, setCurrentFolderId, setBreadcrumb, setIsLoading, setItems } =
    useFileStore();

  const handleNavigate = async (folderId: string | null, index: number) => {
    setIsLoading(true);
    try {
      setCurrentFolderId(folderId);

      if (folderId === null) {
        setBreadcrumb([]);
      } else {
        setBreadcrumb(breadcrumb.slice(0, index + 1));
      }

      const response = await fileApi.getFiles(folderId);
      setItems(response.items);

      if (folderId) {
        const newBreadcrumb = await fileApi.getBreadcrumb(folderId);
        setBreadcrumb(newBreadcrumb);
      }
    } catch (error) {
      console.error('导航失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <nav className="flex items-center gap-2 px-6 py-4 bg-white border-b border-gray-100">
      <button
        onClick={() => handleNavigate(null, -1)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
      >
        <Home className="w-4 h-4" />
        <span className="text-sm font-medium">根目录</span>
      </button>

      {breadcrumb.map((item: FolderBreadcrumb, index: number) => (
        <div key={item.id} className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-gray-300" />
          <button
            onClick={() => handleNavigate(item.id, index)}
            className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
          >
            {item.name}
          </button>
        </div>
      ))}
    </nav>
  );
}
