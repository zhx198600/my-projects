import { useState, useRef } from 'react';
import { Upload, FileUp, X, Eye, Download } from 'lucide-react';
import { useFileStore } from '@/store/fileStore';
import { fileApi } from '@/services/api';
import { formatFileSize } from '@/utils/format';
import type { FileSystemItem } from '@shared/types';

interface DropZoneProps {
  isOpen: boolean;
  onClose: () => void;
  onPreview?: (item: FileSystemItem) => void;
}

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
  fileId?: string;
  mimeType?: string;
}

export default function DropZone({ isOpen, onClose, onPreview }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { currentFolderId, addItem } = useFileStore();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    uploadFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      uploadFiles(files);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadFiles = async (files: File[]) => {
    const newUploadingFiles: UploadingFile[] = files.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      progress: 0,
      status: 'uploading' as const,
    }));

    setUploadingFiles((prev) => [...prev, ...newUploadingFiles]);

    for (const uploadingFile of newUploadingFiles) {
      try {
        const response = await fileApi.uploadFile(
          uploadingFile.file,
          currentFolderId,
          (progress) => {
            setUploadingFiles((prev) =>
              prev.map((f) =>
                f.id === uploadingFile.id ? { ...f, progress } : f
              )
            );
          }
        );

        setUploadingFiles((prev) =>
          prev.map((f) =>
            f.id === uploadingFile.id ? { 
              ...f, 
              status: 'success',
              fileId: response.id,
              mimeType: response.type
            } : f
          )
        );

        addItem({
          id: response.id,
          name: response.name,
          type: 'file',
          size: response.size,
          mimeType: response.type,
          path: response.path,
          userId: response.userId,
          parentId: response.parentId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } catch (error) {
        setUploadingFiles((prev) =>
          prev.map((f) =>
            f.id === uploadingFile.id
              ? {
                  ...f,
                  status: 'error',
                  error: error instanceof Error ? error.message : '上传失败',
                }
              : f
          )
        );
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  const hasActiveUploads = uploadingFiles.some(
    (f) => f.status === 'uploading'
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">上传文件</h3>
          <button
            onClick={onClose}
            disabled={hasActiveUploads}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
            className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
              isDragging
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="flex flex-col items-center">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${
                  isDragging ? 'bg-blue-100' : 'bg-gray-100'
                }`}
              >
                {isDragging ? (
                  <FileUp className="w-8 h-8 text-blue-500" />
                ) : (
                  <Upload className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <p className="text-gray-700 font-medium mb-1">
                {isDragging ? '释放文件开始上传' : '拖拽文件到此处'}
              </p>
              <p className="text-sm text-gray-500">
                或 <span className="text-blue-500 hover:underline">点击选择文件</span>
              </p>
            </div>
          </div>

          {uploadingFiles.length > 0 && (
            <div className="mt-6 space-y-3 max-h-60 overflow-y-auto">
              {uploadingFiles.map((uploadingFile) => {
                const isPreviewable = uploadingFile.status === 'success' && 
                  uploadingFile.mimeType &&
                  (uploadingFile.mimeType.startsWith('image/') || 
                   uploadingFile.mimeType.startsWith('video/') ||
                   uploadingFile.mimeType === 'application/pdf' ||
                   uploadingFile.mimeType.startsWith('audio/') ||
                   uploadingFile.mimeType.startsWith('text/'));
                
                return (
                <div
                  key={uploadingFile.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {uploadingFile.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(uploadingFile.file.size)}
                    </p>
                    {uploadingFile.status === 'uploading' && (
                      <div className="w-full h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-300"
                          style={{ width: `${uploadingFile.progress}%` }}
                        />
                      </div>
                    )}
                    {uploadingFile.status === 'error' && (
                      <p className="text-xs text-red-500 mt-1">
                        {uploadingFile.error}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {uploadingFile.status === 'success' && isPreviewable && (
                      <button
                        onClick={() => {
                          if (uploadingFile.fileId && onPreview) {
                            const fileItem: FileSystemItem = {
                              id: uploadingFile.fileId,
                              name: uploadingFile.file.name,
                              size: uploadingFile.file.size,
                              mimeType: uploadingFile.mimeType,
                              type: 'file',
                              userId: '',
                              parentId: null,
                              path: '',
                              createdAt: new Date().toISOString(),
                              updatedAt: new Date().toISOString(),
                            };
                            onPreview(fileItem);
                          }
                        }}
                        className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                        title="预览"
                      >
                        <Eye className="w-4 h-4 text-gray-500" />
                      </button>
                    )}
                    {uploadingFile.status === 'success' && (
                      <button
                        onClick={() => {
                          if (uploadingFile.fileId) {
                            fileApi.downloadFile(uploadingFile.fileId, uploadingFile.file.name);
                          }
                        }}
                        className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                        title="下载"
                      >
                        <Download className="w-4 h-4 text-gray-500" />
                      </button>
                    )}
                    {uploadingFile.status === 'uploading' && (
                      <span className="text-blue-500 font-medium">
                        {uploadingFile.progress}%
                      </span>
                    )}
                    {uploadingFile.status === 'success' && (
                      <span className="text-green-500 font-medium">完成</span>
                    )}
                    {uploadingFile.status === 'error' && (
                      <span className="text-red-500 font-medium">失败</span>
                    )}
                  </div>
                </div>
              )})}
            </div>
          )}
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={hasActiveUploads}
            className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {hasActiveUploads ? '上传中...' : '关闭'}
          </button>
        </div>
      </div>
    </div>
  );
}
