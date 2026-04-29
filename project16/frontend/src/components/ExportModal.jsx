import { useState, useCallback, useRef } from 'react';

const EXPORT_FORMATS = [
  { id: 'glb', name: 'GLB', description: 'Binary GLTF (推荐)', extension: '.glb' },
  { id: 'gltf', name: 'GLTF', description: 'JSON GLTF', extension: '.gltf' },
  { id: 'obj', name: 'OBJ', description: 'Wavefront OBJ', extension: '.obj' },
];

const IMAGE_FORMATS = [
  { id: 'png', name: 'PNG', description: '无损压缩', extension: '.png' },
  { id: 'jpeg', name: 'JPEG', description: '有损压缩', extension: '.jpg', quality: 0.92 },
  { id: 'webp', name: 'WebP', description: '现代格式', extension: '.webp', quality: 0.9 },
];

function ExportModal({ 
  isOpen, 
  onClose, 
  onExportModel, 
  onExportScreenshot,
  modelId = null,
  hasScreenshot = false
}) {
  const [exportType, setExportType] = useState('model');
  const [selectedModelFormat, setSelectedModelFormat] = useState('glb');
  const [selectedImageFormat, setSelectedImageFormat] = useState('png');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(async () => {
    setIsExporting(true);

    try {
      if (exportType === 'model' && onExportModel) {
        await onExportModel({
          format: selectedModelFormat,
          extension: EXPORT_FORMATS.find(f => f.id === selectedModelFormat)?.extension || '.glb'
        });
      } else if (exportType === 'screenshot' && onExportScreenshot) {
        const imageFormat = IMAGE_FORMATS.find(f => f.id === selectedImageFormat);
        await onExportScreenshot({
          format: selectedImageFormat,
          extension: imageFormat?.extension || '.png',
          quality: imageFormat?.quality
        });
      }
      onClose();
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  }, [exportType, selectedModelFormat, selectedImageFormat, onExportModel, onExportScreenshot, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              导出
            </h3>
            <button
              onClick={onClose}
              disabled={isExporting}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <span className="text-xl">✕</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setExportType('model')}
              disabled={!modelId}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                exportType === 'model'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="text-2xl mb-1">📦</div>
              <div>3D模型</div>
            </button>
            <button
              onClick={() => setExportType('screenshot')}
              disabled={!hasScreenshot}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                exportType === 'screenshot'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="text-2xl mb-1">📷</div>
              <div>截图</div>
            </button>
          </div>

          {exportType === 'model' && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                选择格式
              </label>
              <div className="grid grid-cols-3 gap-2">
                {EXPORT_FORMATS.map(format => (
                  <button
                    key={format.id}
                    onClick={() => setSelectedModelFormat(format.id)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedModelFormat === format.id
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                    }`}
                  >
                    <div className="font-medium text-gray-800 dark:text-gray-200">
                      {format.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {format.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {exportType === 'screenshot' && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                选择格式
              </label>
              <div className="grid grid-cols-3 gap-2">
                {IMAGE_FORMATS.map(format => (
                  <button
                    key={format.id}
                    onClick={() => setSelectedImageFormat(format.id)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedImageFormat === format.id
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                    }`}
                  >
                    <div className="font-medium text-gray-800 dark:text-gray-200">
                      {format.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {format.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isExporting}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            取消
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isExporting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                导出中...
              </>
            ) : (
              <>
                <span>📥</span> 导出
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function useExport({ modelId = null, glRef = null, canvasRef = null }) {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const exportModel = useCallback(async ({ format = 'glb', extension = '.glb' }) => {
    if (modelId) {
      window.open(`/api/models/${modelId}`, '_blank');
    } else if (glRef?.current) {
      console.log('Exporting model from Three.js scene');
    }
  }, [modelId, glRef]);

  const exportScreenshot = useCallback(async ({ format = 'png', extension = '.png', quality = 1 }) => {
    if (canvasRef?.current) {
      const canvas = canvasRef.current;
      const dataUrl = format === 'jpeg' 
        ? canvas.toDataURL('image/jpeg', quality)
        : format === 'webp'
        ? canvas.toDataURL('image/webp', quality)
        : canvas.toDataURL('image/png');

      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      const filename = `screenshot-${Date.now()}${extension}`;
      downloadBlob(blob, filename);
    }
  }, [canvasRef]);

  const openExportModal = useCallback(() => {
    setIsExportModalOpen(true);
  }, []);

  const closeExportModal = useCallback(() => {
    setIsExportModalOpen(false);
  }, []);

  return {
    isExportModalOpen,
    openExportModal,
    closeExportModal,
    exportModel,
    exportScreenshot,
    ExportModal: ({ onExportModel: customExportModel, onExportScreenshot: customExportScreenshot, ...props }) => (
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={closeExportModal}
        onExportModel={customExportModel || exportModel}
        onExportScreenshot={customExportScreenshot || exportScreenshot}
        modelId={modelId}
        hasScreenshot={!!canvasRef?.current || !!glRef?.current}
        {...props}
      />
    )
  };
}

export { ExportModal, useExport, downloadBlob, EXPORT_FORMATS, IMAGE_FORMATS };
export default useExport;
