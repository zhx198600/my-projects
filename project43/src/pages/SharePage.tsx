import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FileText, Folder, Download, Lock, AlertTriangle, File, ChevronRight } from 'lucide-react';
import { shareApi } from '@/services/api';
import type { FileSystemItem, ShareAccessResponse } from '@shared/types';

export default function SharePage() {
  const { code } = useParams<{ code: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requirePassword, setRequirePassword] = useState(false);
  const [password, setPassword] = useState('');
  const [shareData, setShareData] = useState<ShareAccessResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadShare = async (pwd?: string) => {
    if (!code) return;
    setLoading(true);
    setError(null);
    try {
      const data = await shareApi.accessShare(code, pwd);
      setShareData(data);
      setRequirePassword(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : '加载失败';
      if (message.includes('Password required') || message.includes('password')) {
        setRequirePassword(true);
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShare();
  }, [code]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    setSubmitting(true);
    await loadShare(password);
    setSubmitting(false);
  };

  const getFileIcon = (item: FileSystemItem) => {
    if (item.type === 'folder') return <Folder className="w-8 h-8 text-yellow-500" />;
    const mimeType = item.mimeType || '';
    if (mimeType.startsWith('image/')) return <File className="w-8 h-8 text-purple-500" />;
    if (mimeType.startsWith('video/')) return <File className="w-8 h-8 text-red-500" />;
    if (mimeType.startsWith('audio/')) return <File className="w-8 h-8 text-orange-500" />;
    if (mimeType === 'application/pdf') return <File className="w-8 h-8 text-red-600" />;
    return <FileText className="w-8 h-8 text-blue-500" />;
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '-';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">无法访问</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <Link
            to="/login"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  if (requirePassword) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 text-center mb-2">需要提取码</h2>
          <p className="text-gray-500 text-center mb-6">请输入提取码以访问分享内容</p>
          <form onSubmit={handlePasswordSubmit}>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入提取码"
              autoFocus
              disabled={submitting}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center text-lg tracking-widest"
            />
            <button
              type="submit"
              disabled={submitting || !password.trim()}
              className="w-full mt-4 px-5 py-3 text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
            >
              {submitting ? '验证中...' : '确定'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!shareData) return null;

  const isFileShare = shareData.share.type === 'file' && shareData.item;
  const isFolderShare = shareData.share.type === 'folder' && shareData.items;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-blue-600">云盘</Link>
          <Link to="/login" className="text-gray-600 hover:text-gray-800">登录</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {isFileShare && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center">
                {getFileIcon(shareData.item!)}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-semibold text-gray-800 truncate">{shareData.item!.name}</h2>
                <p className="text-gray-500 text-sm">
                  {formatSize(shareData.item!.size)} · {shareData.item!.mimeType}
                </p>
              </div>
            </div>
            <button
              onClick={() => shareApi.downloadShareFile(code!, password || undefined)}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              <Download className="w-5 h-5" />
              下载文件
            </button>
          </div>
        )}

        {isFolderShare && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
                  <Folder className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    {(shareData as { folder?: { name: string } }).folder?.name || '分享文件夹'}
                  </h2>
                  <p className="text-sm text-gray-500">{shareData.items!.length} 个项目</p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {shareData.items!.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <Folder className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p>文件夹为空</p>
                </div>
              ) : (
                shareData.items!.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      {getFileIcon(item)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-800 font-medium truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        {item.type === 'folder' ? '文件夹' : `${formatSize(item.size)} · ${item.mimeType}`}
                      </p>
                    </div>
                    {item.type === 'file' && (
                      <button
                        onClick={() => shareApi.downloadFolderFile(code!, item.id, password || undefined)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex-shrink-0"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    )}
                    {item.type === 'folder' && (
                      <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}