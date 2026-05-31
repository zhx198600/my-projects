import { useState, useEffect, useCallback } from 'react';
import { X, Download, FileText, File, AlertCircle } from 'lucide-react';
import { fileApi } from '@/services/api';
import { formatFileSize } from '@/utils/format';
import type { FilePreviewInfo } from '@shared/types';

interface FilePreviewProps {
  file: FilePreviewInfo;
  onClose: () => void;
}

export default function FilePreview({ file, onClose }: FilePreviewProps) {
  const [textContent, setTextContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (file.previewType === 'text') {
      setLoading(true);
      setError(null);
      fileApi
        .getFileContent(file.id)
        .then((content) => {
          setTextContent(content);
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : '加载失败');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [file.id, file.previewType]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleDownload = () => {
    fileApi.downloadFile(file.id, file.name);
  };

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  const renderPreview = () => {
    switch (file.previewType) {
      case 'image':
        return (
          <div className="flex items-center justify-center h-full">
            <img
              src={file.previewUrl}
              alt={file.name}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        );

      case 'pdf':
        return (
          <iframe
            src={file.previewUrl}
            title={file.name}
            className="w-full h-full border-0"
          />
        );

      case 'text':
        if (loading) {
          return (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
            </div>
          );
        }
        if (error) {
          return (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <AlertCircle className="w-12 h-12 mb-4" />
              <p>{error}</p>
            </div>
          );
        }
        return (
          <div className="h-full overflow-auto bg-gray-50 p-4">
            <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 leading-relaxed">
              {textContent}
            </pre>
          </div>
        );

      case 'video':
        return (
          <div className="flex items-center justify-center h-full bg-black">
            <video
              src={file.previewUrl}
              controls
              autoPlay
              className="max-w-full max-h-full"
            />
          </div>
        );

      case 'audio':
        return (
          <div className="flex flex-col items-center justify-center h-full bg-gray-100 p-8">
            <FileText className="w-20 h-20 text-gray-400 mb-6" />
            <audio
              src={file.previewUrl}
              controls
              autoPlay
              className="w-full max-w-md"
            />
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <File className="w-20 h-20 text-gray-300 mb-6" />
            <p className="text-lg font-medium mb-2">无法预览此文件</p>
            <p className="text-sm mb-6">{file.mimeType}</p>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              下载文件
            </button>
          </div>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden max-w-5xl max-h-[90vh] w-[90vw]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-800 truncate">{file.name}</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {file.mimeType} · {formatFileSize(file.size)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              下载
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden min-h-[400px]">{renderPreview()}</div>
      </div>
    </div>
  );
}