import { useState } from 'react';
import { X, Share2, Copy, Check, Link, Clock, Lock } from 'lucide-react';
import { shareApi } from '@/services/api';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  itemName: string;
  itemType: 'file' | 'folder';
}

export default function ShareModal({ isOpen, onClose, itemId, itemName, itemType }: ShareModalProps) {
  const [password, setPassword] = useState('');
  const [expireDays, setExpireDays] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [shareResult, setShareResult] = useState<{ shareCode: string; shareLink: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setShareResult(null);

    try {
      const result = await shareApi.createShare({
        itemId,
        itemType,
        password: password || undefined,
        expireDays: expireDays || undefined,
      });
      setShareResult({
        shareCode: result.shareCode,
        shareLink: result.shareLink,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建分享失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (shareResult) {
      const fullUrl = `${window.location.origin}${shareResult.shareLink}`;
      navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setPassword('');
      setExpireDays(0);
      setError('');
      setShareResult(null);
      setCopied(false);
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
              <Share2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">分享</h3>
              <p className="text-sm text-gray-500 truncate max-w-48">{itemName}</p>
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

        {shareResult ? (
          <div className="p-6">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2 text-green-700 mb-2">
                <Check className="w-5 h-5" />
                <span className="font-medium">分享链接已创建</span>
              </div>
              <div className="flex items-center gap-2 bg-white rounded-lg p-3 border border-green-200">
                <Link className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-700 flex-1 truncate font-mono">
                  {window.location.origin}{shareResult.shareLink}
                </span>
                <button
                  onClick={handleCopy}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={handleClose}
                className="px-5 py-2.5 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                关闭
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-4">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4" />
                有效期
              </label>
              <select
                value={expireDays}
                onChange={(e) => setExpireDays(Number(e.target.value))}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value={0}>永不过期</option>
                <option value={1}>1 天</option>
                <option value={7}>7 天</option>
                <option value={30}>30 天</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Lock className="w-4 h-4" />
                提取码（可选）
              </label>
              <input
                type="text"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="留空表示无密码"
                disabled={isLoading}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
              />
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
                    创建中...
                  </>
                ) : (
                  '创建分享'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}