import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ThreeDViewer from '../components/ThreeDViewer';
import RenderStyleSelector, { RENDER_STYLES } from '../components/RenderStyleSelector';
import { ExportModal } from '../components/ExportModal';

const API_BASE_URL = 'http://localhost:3000';

function ConversionProgress({ progress, message }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative w-40 h-40 mb-6">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
            className="dark:stroke-gray-700"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#9333ea"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${progress * 2.83} 283`}
            className="transition-all duration-500 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-bold text-gray-800 dark:text-gray-200">
            {progress}%
          </span>
        </div>
      </div>
      
      <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
        {message || '正在处理...'}
      </p>
      
      <div className="w-64 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2">
        <div
          className="bg-purple-600 h-2.5 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      <div className="mt-8 grid grid-cols-1 gap-3 w-full max-w-md">
        {[
          { stage: '分析图片特征', minProgress: 10 },
          { stage: '提取主体轮廓', minProgress: 25 },
          { stage: '生成深度信息', minProgress: 40 },
          { stage: '构建3D网格', minProgress: 55 },
          { stage: '生成纹理贴图', minProgress: 70 },
          { stage: '优化模型结构', minProgress: 85 },
          { stage: '完成', minProgress: 100 }
        ].map((item, index) => (
          <div 
            key={index}
            className={`flex items-center gap-3 p-2 rounded-lg ${
              progress >= item.minProgress 
                ? 'bg-purple-50 dark:bg-purple-900/20' 
                : 'bg-gray-50 dark:bg-gray-800'
            }`}
          >
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
              progress >= item.minProgress 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
            }`}>
              {progress >= item.minProgress ? '✓' : index + 1}
            </div>
            <span className={`text-sm ${
              progress >= item.minProgress 
                ? 'text-purple-700 dark:text-purple-400 font-medium' 
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              {item.stage}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ModelPreview({ modelId, onDownload, onBack, isMock = false }) {
  const [selectedStyle, setSelectedStyle] = useState(RENDER_STYLES[0]);
  const [isRendering, setIsRendering] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const handleApplyStyle = () => {
    setIsRendering(true);
    setTimeout(() => {
      setIsRendering(false);
    }, 500);
  };

  const handleStyleChange = (style) => {
    setSelectedStyle(style);
  };

  const handleExportModel = async ({ format, extension }) => {
    if (modelId) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/models/${modelId}`);
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          if (data && data.isMock) {
            alert(`当前处于演示模式：\n\n${data.message}\n\n建议使用"截图"功能导出当前视图。`);
          } else {
            alert('模型导出失败，请重试或使用截图功能。');
          }
        } else if (contentType && contentType.includes('model/gltf-binary')) {
          window.open(`${API_BASE_URL}/api/models/${modelId}`, '_blank');
        } else {
          window.open(`${API_BASE_URL}/api/models/${modelId}`, '_blank');
        }
      } catch (error) {
        console.error('Export model error:', error);
        window.open(`${API_BASE_URL}/api/models/${modelId}`, '_blank');
      }
    }
  };

  const handleExportScreenshot = ({ format, extension, quality }) => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const dataUrl = format === 'jpeg' 
        ? canvas.toDataURL('image/jpeg', quality || 0.92)
        : format === 'webp'
        ? canvas.toDataURL('image/webp', quality || 0.9)
        : canvas.toDataURL('image/png');
      
      const link = document.createElement('a');
      link.download = `screenshot-${Date.now()}${extension}`;
      link.href = dataUrl;
      link.click();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
            {isMock ? '🎮 3D演示模式' : '🎉 3D模型生成成功！'}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {isMock 
              ? '当前为演示模式，显示的是示例模型。真实模型需要 Tripo3D API 连接成功。'
              : '您的2D图片已成功转换为3D模型'}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleApplyStyle}
            disabled={isRendering}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              isRendering 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-purple-600 hover:bg-purple-700 hover:shadow-lg'
            } text-white`}
          >
            {isRendering ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                渲染中...
              </>
            ) : (
              <>
                <span>✨</span> 一键渲染
              </>
            )}
          </button>
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <span>📤</span> 导出
          </button>
          {!isMock && (
            <button
              onClick={onDownload}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <span>📥</span> 下载模型
            </button>
          )}
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-colors"
          >
            返回编辑
          </button>
        </div>
      </div>
      
      {isMock && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 px-4 py-2">
          <div className="flex items-center gap-2 text-sm text-yellow-700 dark:text-yellow-400">
            <span className="text-lg">⚠️</span>
            <span>
              <strong>演示模式</strong>：当前显示的是示例模型，不是基于您上传图片生成的。
              这是因为 Tripo3D API 暂时无法连接（网络超时）。
              您可以使用"截图"功能保存当前视图，或稍后重试。
            </span>
          </div>
        </div>
      )}
      
      <div className="flex flex-1 flex-col lg:flex-row min-h-0">
        <div className="flex-1 p-4 min-h-[400px]">
          <ThreeDViewer 
            modelId={modelId}
            renderStyle={selectedStyle.name}
            styleConfig={selectedStyle.config}
            styleId={selectedStyle.id}
          />
        </div>
        
        <div className="lg:w-80 p-4 bg-gray-50 dark:bg-gray-800/50 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-700">
          <RenderStyleSelector 
            selectedStyle={selectedStyle}
            onStyleChange={handleStyleChange}
          />
          
          <div className="mt-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              模型信息
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">模型ID:</span>
                <span className="text-gray-800 dark:text-gray-200 font-mono text-xs">
                  {modelId?.substring(0, 16)}...
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">格式:</span>
                <span className="text-gray-800 dark:text-gray-200">GLB (Binary GLTF)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">当前风格:</span>
                <span className="text-gray-800 dark:text-gray-200 flex items-center gap-1">
                  <span>{selectedStyle.icon}</span>
                  {selectedStyle.name}
                </span>
              </div>
              {isMock && (
                <div className="flex justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-gray-500 dark:text-gray-400">模式:</span>
                  <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                    🎮 演示模式
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {isMock && (
            <div className="mt-4 p-4 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <h4 className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-2">
                💡 使用提示
              </h4>
              <ul className="text-xs text-blue-600 dark:text-blue-300 space-y-1">
                <li>• 使用「截图」功能保存当前视图</li>
                <li>• 点击「一键渲染」切换不同风格</li>
                <li>• 左键拖动旋转，滚轮缩放</li>
              </ul>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <span className="text-lg">🖱️</span>
            <span>左键拖动旋转模型</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🔍</span>
            <span>滚轮缩放视图</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">✋</span>
            <span>右键拖动平移</span>
          </div>
        </div>
      </div>

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExportModel={handleExportModel}
        onExportScreenshot={handleExportScreenshot}
        modelId={modelId}
        hasScreenshot={true}
      />
    </div>
  );
}

function NoFileMessage({ onBack }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="text-6xl mb-4">📷</div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
        未找到图片
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        请先上传并编辑图片，然后再进行3D转换
      </p>
      <button
        onClick={onBack}
        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
      >
        返回首页
      </button>
    </div>
  );
}

function Preview3D() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const fileId = searchParams.get('fileId');
  const processedId = searchParams.get('processedId');
  
  const [jobId, setJobId] = useState(null);
  const [conversionStatus, setConversionStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('准备转换...');
  const [modelId, setModelId] = useState(null);
  const [error, setError] = useState(null);
  const [isMock, setIsMock] = useState(false);
  
  const pollIntervalRef = useRef(null);

  const startConversion = useCallback(async () => {
    if (!fileId) return;

    setConversionStatus('processing');
    setProgress(0);
    setMessage('正在启动转换...');
    setError(null);
    setIsMock(false);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/convert-to-3d`, {
        fileId: fileId,
        processedFileId: processedId
      });

      if (response.data && response.data.success) {
        const data = response.data.data;
        setJobId(data.jobId);
        setProgress(data.progress);
        if (data.isMock !== undefined) {
          setIsMock(data.isMock);
        }
      } else {
        throw new Error(response.data?.message || '创建转换任务失败');
      }
    } catch (err) {
      console.error('Start conversion error:', err);
      const errorMessage = err.response?.data?.message || err.message || '启动转换失败，请重试';
      setError(errorMessage);
      setConversionStatus('error');
    }
  }, [fileId, processedId]);

  const pollStatus = useCallback(async () => {
    if (!jobId) return;

    try {
      const response = await axios.get(`${API_BASE_URL}/api/convert-status/${jobId}`);
      
      if (response.data && response.data.success) {
        const job = response.data.data;
        
        setProgress(job.progress);
        setMessage(job.message);
        if (job.isMock !== undefined) {
          setIsMock(job.isMock);
        }
        
        if (job.status === 'completed') {
          setConversionStatus('completed');
          setModelId(job.modelId);
          
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
        } else if (job.status === 'failed') {
          setError('转换失败，请重试');
          setConversionStatus('error');
          
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
        }
      }
    } catch (err) {
      console.error('Poll status error:', err);
    }
  }, [jobId]);

  useEffect(() => {
    if (!fileId) {
      return;
    }

    startConversion();
  }, [fileId, startConversion]);

  useEffect(() => {
    if (jobId && conversionStatus === 'processing') {
      pollStatus();
      
      pollIntervalRef.current = setInterval(pollStatus, 1000);
      
      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      };
    }
  }, [jobId, conversionStatus, pollStatus]);

  const handleDownload = () => {
    if (modelId) {
      window.open(`${API_BASE_URL}/api/models/${modelId}`, '_blank');
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleRetry = () => {
    startConversion();
  };

  return (
    <div className="preview-3d-page p-4 md:p-8 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
            3D模型转换
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            将您的2D图片转换为3D模型，并点击"一键渲染"应用美化效果
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
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-red-700 dark:text-red-400">
              <span className="mr-2">✗</span>
              <span>{error}</span>
            </div>
            <button
              onClick={handleRetry}
              className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
            >
              重试
            </button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm min-h-[500px]">
        {!fileId && (
          <NoFileMessage onBack={handleBack} />
        )}

        {fileId && conversionStatus === 'processing' && (
          <ConversionProgress progress={progress} message={message} />
        )}

        {fileId && conversionStatus === 'completed' && (
          <ModelPreview 
            modelId={modelId}
            onDownload={handleDownload}
            onBack={() => navigate('/edit')}
            isMock={isMock}
          />
        )}

        {fileId && conversionStatus === 'idle' && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              准备转换...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Preview3D;
