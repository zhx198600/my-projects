import { useState, useEffect } from 'react';
import {
  HardDrive,
  Clock,
  Image,
  FileText,
  Video,
  Music,
  Trash2,
  Folder,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { userApi } from '@/services/api';
import { formatFileSize } from '@/utils/format';
import type { StorageInfo } from '@shared/types';

interface NavItem {
  icon: typeof HardDrive;
  label: string;
  type: string | null;
}

const navItems: NavItem[] = [
  { icon: HardDrive, label: '全部文件', type: null },
  { icon: Clock, label: '最近', type: 'recent' },
  { icon: Image, label: '图片', type: 'image' },
  { icon: FileText, label: '文档', type: 'document' },
  { icon: Video, label: '视频', type: 'video' },
  { icon: Music, label: '音频', type: 'audio' },
  { icon: Trash2, label: '回收站', type: 'trash' },
];

interface SidebarProps {
  activeType: string | null;
  onTypeChange: (type: string | null) => void;
}

export default function Sidebar({ activeType, onTypeChange }: SidebarProps) {
  const { user } = useAuthStore();
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);

  useEffect(() => {
    const fetchStorage = async () => {
      try {
        const info = await userApi.getStorageInfo();
        setStorageInfo(info);
      } catch (error) {
        console.error('获取存储信息失败:', error);
      }
    };
    fetchStorage();
  }, []);

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
            <Folder className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-800">{user?.username}</h2>
            <p className="text-sm text-gray-500 truncate max-w-[140px]">
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => (
            <li key={item.label}>
              <button
                onClick={() => onTypeChange(item.type)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeType === item.type
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon
                  className={`w-5 h-5 ${
                    activeType === item.type ? 'text-blue-500' : 'text-gray-400'
                  }`}
                />
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <HardDrive className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-700">存储空间</span>
          </div>
          {storageInfo && (
            <>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(storageInfo.percentage, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500">
                {formatFileSize(storageInfo.used)} / {formatFileSize(storageInfo.total)}
              </p>
            </>
          )}
          {!storageInfo && (
            <div className="w-full h-2 bg-gray-200 rounded-full mb-2 animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
}
