import { useState, useRef, useEffect } from 'react';
import {
  Search,
  Upload,
  FolderPlus,
  User,
  LogOut,
  Settings,
  ChevronDown,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onUploadClick: () => void;
  onNewFolderClick: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function Header({
  onUploadClick,
  onNewFolderClick,
  searchQuery,
  onSearchChange,
}: HeaderProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      logout();
      navigate('/login');
    } catch (error) {
      console.error('登出失败:', error);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索文件和文件夹..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onNewFolderClick}
          className="flex items-center gap-2 px-4 py-2.5 text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 font-medium"
        >
          <FolderPlus className="w-5 h-5" />
          <span className="hidden sm:inline">新建文件夹</span>
        </button>

        <button
          onClick={onUploadClick}
          className="flex items-center gap-2 px-5 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all duration-200 font-medium shadow-sm hover:shadow-md"
        >
          <Upload className="w-5 h-5" />
          <span className="hidden sm:inline">上传</span>
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 ml-2 p-1.5 hover:bg-gray-100 rounded-xl transition-all duration-200"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              {user?.username?.charAt(0) ? (
                <span className="text-white font-semibold text-sm">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
            </div>
            <ChevronDown
              className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                showDropdown ? 'rotate-180' : ''
              }`}
            />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="font-medium text-gray-800">{user?.username}</p>
                <p className="text-sm text-gray-500 truncate">{user?.email}</p>
              </div>
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors">
                <Settings className="w-4 h-4" />
                <span className="text-sm">设置</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">退出登录</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
