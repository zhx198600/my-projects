import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CanvasEditor from '../components/CanvasEditor';
import Toolbar from '../components/Toolbar';

const API_BASE_URL = 'http://localhost:3000';

const getImageUrl = (fileId) => {
  return `${API_BASE_URL}/api/files/${fileId}`;
};

function ProcessingProgress({ progress, message }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-12">
      <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
      <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">{message}</p>
      <div className="w-64 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2">
        <div
          className="bg-purple-600 h-2.5 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{progress}%</p>
    </div>
  );
}

function NoFileMessage({ onBack }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-16">
      <div className="text-6xl mb-4">📷</div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
        未找到图片
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        请先上传一张图片再进行编辑
      </p>
      <button
        onClick={onBack}
        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
      >
        返回上传页面
      </button>
    </div>
  );
}

function Edit() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const canvasEditorRef = useRef(null);
  
  const fileId = searchParams.get('fileId');
  
  const [originalImageUrl, setOriginalImageUrl] = useState(null);
  const [processedImageUrl, setProcessedImageUrl] = useState(null);
  const [processedFileId, setProcessedFileId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [error, setError] = useState(null);
  const [hasProcessed, setHasProcessed] = useState(false);
  const [maskData, setMaskData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [tool, setTool] = useState('brush');
  const [brushSize, setBrushSize] = useState(20);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  useEffect(() => {
    if (!fileId) {
      return;
    }
    
    setOriginalImageUrl(getImageUrl(fileId));
    startRemoveBackground();
  }, [fileId]);

  const simulateProgress = useCallback(() => {
    setProcessingProgress(0);
    
    const interval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + Math.random() * 15;
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  const startRemoveBackground = async () => {
    if (!fileId) return;

    setIsProcessing(true);
    setError(null);
    setHasProcessed(false);
    
    const cleanup = simulateProgress();

    try {
      const response = await axios.post(`${API_BASE_URL}/api/remove-bg`, {
        fileId: fileId
      });

      setProcessingProgress(100);

      if (response.data && response.data.success) {
        const data = response.data.data;
        setProcessedFileId(data.processedFileId);
        setProcessedImageUrl(getImageUrl(data.processedFileId));
        setHasProcessed(true);
      } else {
        throw new Error(response.data?.message || '处理失败');
      }
    } catch (err) {
      console.error('Remove background error:', err);
      const errorMessage = err.response?.data?.message || err.message || '主体识别失败，请重试';
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMaskChange = useCallback((newMaskData) => {
    setMaskData(newMaskData);
  }, []);

  const handleSave = async () => {
    if (!maskData || !fileId) return;

    setIsSaving(true);
    setError(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/save-mask`, {
        fileId: fileId,
        maskData: maskData,
        processedFileId: processedFileId
      });

      if (response.data && response.data.success) {
        const data = response.data.data;
        setProcessedFileId(data.updatedProcessedFileId);
        setProcessedImageUrl(getImageUrl(data.updatedProcessedFileId));
        setHasProcessed(true);
        alert('保存成功！');
      } else {
        throw new Error(response.data?.message || '保存失败');
      }
    } catch (err) {
      console.error('Save mask error:', err);
      const errorMessage = err.response?.data?.message || err.message || '保存失败，请重试';
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerate3D = () => {
    if (processedFileId) {
      navigate(`/3d-preview?fileId=${fileId}&processedId=${processedFileId}`);
    } else if (fileId) {
      navigate(`/3d-preview?fileId=${fileId}`);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  if (!fileId) {
    return (
      <div className="edit-page p-6 md:p-8">
        <NoFileMessage onBack={handleBack} />
      </div>
    );
  }

  return (
    <div className="edit-page p-4 md:p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
            编辑主体
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            使用画笔和橡皮擦工具调整主体边界，完成后生成3D模型
          </p>
        </div>
        <button
          onClick={handleBack}
          className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors"
        >
          ← 返回
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center text-red-700 dark:text-red-400">
            <span className="mr-2">✗</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col gap-4 min-h-0">
        <Toolbar
          tool={tool}
          onToolChange={setTool}
          brushSize={brushSize}
          onBrushSizeChange={setBrushSize}
          onUndo={() => {}}
          onRedo={() => {}}
          canUndo={canUndo}
          canRedo={canRedo}
          onSave={handleSave}
          onGenerate3D={handleGenerate3D}
          isSaving={isSaving}
        />

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
          <div className="flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-medium text-gray-700 dark:text-gray-300 text-sm">
                原始图片
              </h3>
            </div>
            <div className="flex-1 min-h-64 p-4">
              {isProcessing ? (
                <ProcessingProgress 
                  progress={processingProgress} 
                  message="正在识别主体..." 
                />
              ) : originalImageUrl ? (
                <div 
                  className="w-full h-full flex items-center justify-center rounded-lg overflow-hidden"
                  style={{
                    backgroundImage: `
                      linear-gradient(45deg, #ccc 25%, transparent 25%),
                      linear-gradient(-45deg, #ccc 25%, transparent 25%),
                      linear-gradient(45deg, transparent 75%, #ccc 75%),
                      linear-gradient(-45deg, transparent 75%, #ccc 75%)
                    `,
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                  }}
                >
                  <img
                    src={originalImageUrl}
                    alt="Original"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                  加载中...
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-medium text-gray-700 dark:text-gray-300 text-sm">
                编辑区域 (画笔添加 | 橡皮擦移除)
              </h3>
            </div>
            <div className="flex-1 min-h-64">
              {!isProcessing && processedImageUrl ? (
                <CanvasEditor
                  ref={canvasEditorRef}
                  imageUrl={processedImageUrl}
                  initialMaskData={maskData}
                  tool={tool}
                  brushSize={brushSize}
                  scale={scale}
                  onScaleChange={setScale}
                  offset={offset}
                  onOffsetChange={setOffset}
                  onMaskChange={handleMaskChange}
                />
              ) : isProcessing ? (
                <ProcessingProgress 
                  progress={processingProgress} 
                  message="准备编辑环境..." 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                  {error || '等待处理...'}
                </div>
              )}
            </div>
          </div>
        </div>

        {hasProcessed && !isProcessing && (
          <div className="flex items-center justify-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <span className="text-green-700 dark:text-green-400">
              ✓ 主体识别完成，可以开始编辑
            </span>
            <button
              onClick={startRemoveBackground}
              className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              重新识别
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Edit;
