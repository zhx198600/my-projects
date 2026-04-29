import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const API_BASE_URL = 'http://localhost:3000';

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function ProgressBar({ progress }) {
  return (
    <div className="w-full mt-4">
      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
        <span>上传中...</span>
        <span>{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
        <div
          className="bg-purple-600 h-2.5 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}

function Home() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const validateFile = (file) => {
    if (!file) {
      return { valid: false, message: '请选择要上传的图片' };
    }

    if (file.size > MAX_FILE_SIZE) {
      return { 
        valid: false, 
        message: `文件大小超过限制。最大支持 10MB，当前文件: ${formatFileSize(file.size)}` 
      };
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return { 
        valid: false, 
        message: '不支持的文件格式。仅支持 JPG、PNG、WebP 格式。' 
      };
    }

    const fileName = file.name.toLowerCase();
    const hasValidExtension = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext));
    if (!hasValidExtension) {
      return { 
        valid: false, 
        message: '不支持的文件格式。仅支持 JPG、PNG、WebP 格式。' 
      };
    }

    return { valid: true };
  };

  const resetUploadState = useCallback(() => {
    setUploading(false);
    setUploadProgress(0);
    setError(null);
    setSuccessMessage(null);
  }, []);

  const handleFileSelect = useCallback((file) => {
    resetUploadState();
    
    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.message);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);

    uploadFileToServer(file);
  }, [resetUploadState]);

  const uploadFileToServer = async (file) => {
    setUploading(true);
    setUploadProgress(0);
    setError(null);
    setSuccessMessage(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          }
        },
      });

      if (response.data && response.data.success) {
        setUploadedFile(response.data.data);
        setSuccessMessage(response.data.message || '文件上传成功');
      } else {
        throw new Error(response.data?.message || '上传失败');
      }
    } catch (err) {
      console.error('Upload error:', err);
      const errorMessage = err.response?.data?.message || err.message || '上传失败，请重试';
      setError(errorMessage);
      setImagePreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleInputChange = (e) => {
    const files = e.target?.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRetry = () => {
    resetUploadState();
    setImagePreview(null);
    setUploadedFile(null);
  };

  const handleContinueToEdit = () => {
    if (uploadedFile?.fileId) {
      navigate(`/edit?fileId=${uploadedFile.fileId}`);
    }
  };

  return (
    <div className="home-page p-6 md:p-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800 dark:text-gray-100">
        上传图片
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        将平面图片上传，开始转换为3D模型
      </p>

      {!imagePreview ? (
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`upload-area border-2 border-dashed rounded-lg p-8 md:p-12 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-900/10'
          }`}
          onClick={handleButtonClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            onChange={handleInputChange}
            className="hidden"
            disabled={uploading}
          />
          
          <div className="upload-icon text-6xl mb-4">
            {isDragging ? '📥' : '📁'}
          </div>
          
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-2">
            {isDragging ? '释放鼠标以上传' : '点击或拖拽图片到此处上传'}
          </p>
          
          <p className="text-sm text-gray-500 dark:text-gray-400">
            支持 JPG、PNG、WebP 格式，最大 10MB
          </p>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleButtonClick();
            }}
            disabled={uploading}
            className="mt-6 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            {uploading ? '上传中...' : '选择文件'}
          </button>
        </div>
      ) : (
        <div className="upload-result bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <div className="preview-container">
            <img
              src={imagePreview}
              alt="预览"
              className="max-w-full max-h-96 mx-auto rounded-lg shadow-md"
            />
          </div>

          {uploading && (
            <ProgressBar progress={uploadProgress} />
          )}

          {successMessage && !uploading && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center text-green-700 dark:text-green-400">
                <span className="mr-2">✓</span>
                <span>{successMessage}</span>
              </div>
              {uploadedFile && (
                <div className="mt-2 text-sm text-green-600 dark:text-green-500">
                  <p>文件名: {uploadedFile.filename}</p>
                  <p>大小: {formatFileSize(uploadedFile.size)}</p>
                </div>
              )}
            </div>
          )}

          {error && !uploading && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center text-red-700 dark:text-red-400">
                <span className="mr-2">✗</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-4 justify-center">
            {successMessage && uploadedFile && (
              <button
                type="button"
                onClick={handleContinueToEdit}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                继续编辑
              </button>
            )}
            
            {error && (
              <button
                type="button"
                onClick={handleRetry}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                重新上传
              </button>
            )}
            
            {successMessage && (
              <button
                type="button"
                onClick={handleRetry}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors"
              >
                上传新图片
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
