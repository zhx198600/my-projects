import { useState } from 'react'
import type { PageSize, ExportOptions as ExportOptionsType } from '../types'

export type ExportFormat = 'pdf' | 'pptx'

interface ExportOptionsProps {
  isOpen: boolean
  onClose: () => void
  onExport: (options: ExportOptionsType, format: ExportFormat) => void
  isExporting: boolean
}

const exportFormatOptions: { value: ExportFormat; label: string; description: string; icon: string }[] = [
  { value: 'pptx', label: 'PPTX (PowerPoint)', description: '可编辑的演示文稿，推荐使用', icon: '📊' },
  { value: 'pdf', label: 'PDF', description: '不可编辑但兼容性好的文档格式', icon: '📄' },
]

const pageSizeOptions: { value: PageSize; label: string; description: string }[] = [
  { value: '16:9', label: '16:9 (PPT标准)', description: '推荐，适合现代屏幕' },
  { value: '4:3', label: '4:3 (传统)', description: '传统投影屏幕' },
  { value: 'A4', label: 'A4 (打印)', description: '标准打印尺寸' },
  { value: 'Letter', label: 'Letter', description: '美国标准信纸' },
  { value: 'Legal', label: 'Legal', description: '法律文件尺寸' },
]

const qualityOptions: { value: ExportOptionsType['quality']; label: string; description: string }[] = [
  { value: 'high', label: '高质量 (High)', description: '2x 缩放，清晰，文件较大' },
  { value: 'medium', label: '标准 (Medium)', description: '1x 缩放，平衡，推荐' },
  { value: 'low', label: '快速 (Low)', description: '0.5x 缩放，小文件' },
]

function ExportOptions({ isOpen, onClose, onExport, isExporting }: ExportOptionsProps) {
  const [exportFormat, setExportFormat] = useState<ExportFormat>('pptx')
  const [selectedPageSize, setSelectedPageSize] = useState<PageSize>('16:9')
  const [selectedQuality, setSelectedQuality] = useState<ExportOptionsType['quality']>('medium')
  const [includeImages, setIncludeImages] = useState(true)
  const [pageNumbers, setPageNumbers] = useState(false)

  const handleExport = () => {
    onExport(
      {
        pageSize: selectedPageSize,
        quality: selectedQuality,
        includeImages,
        pageNumbers,
      },
      exportFormat
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fadeIn flex flex-col" style={{ maxHeight: '90vh' }}>
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">导出演示文稿</h3>
                <p className="text-sm text-indigo-100">选择导出格式和配置选项</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isExporting}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              导出格式
            </label>
            <div className="space-y-2">
              {exportFormatOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                    exportFormat === option.value
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="exportFormat"
                    value={option.value}
                    checked={exportFormat === option.value}
                    onChange={() => setExportFormat(option.value)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  />
                  <div className="ml-3 flex items-center space-x-2">
                    <span className="text-lg">{option.icon}</span>
                    <div>
                      <span className="text-sm font-medium text-gray-900">
                        {option.label}
                      </span>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {exportFormat === 'pdf' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  页面大小
                </label>
                <div className="space-y-2">
                  {pageSizeOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedPageSize === option.value
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="pageSize"
                        value={option.value}
                        checked={selectedPageSize === option.value}
                        onChange={() => setSelectedPageSize(option.value)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                      />
                      <div className="ml-3">
                        <span className="text-sm font-medium text-gray-900">
                          {option.label}
                        </span>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {option.description}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  导出质量
                </label>
                <div className="space-y-2">
                  {qualityOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedQuality === option.value
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="quality"
                        value={option.value}
                        checked={selectedQuality === option.value}
                        onChange={() => setSelectedQuality(option.value)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                      />
                      <div className="ml-3">
                        <span className="text-sm font-medium text-gray-900">
                          {option.label}
                        </span>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {option.description}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              选项
            </label>
            <div className="space-y-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeImages}
                  onChange={(e) => setIncludeImages(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="ml-3 text-sm text-gray-700">
                  包含图片
                </span>
                <span className="ml-2 text-xs text-gray-400">
                  (默认勾选)
                </span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={pageNumbers}
                  onChange={(e) => setPageNumbers(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="ml-3 text-sm text-gray-700">
                  显示页码
                </span>
                <span className="ml-2 text-xs text-gray-400">
                  (默认不勾选)
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex-shrink-0">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              disabled={isExporting}
              className="flex-1 px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              取消
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/30"
            >
              <span className="flex items-center justify-center space-x-2">
                {isExporting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>导出中...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>导出 {exportFormat === 'pptx' ? 'PPTX' : 'PDF'}</span>
                  </>
                )}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExportOptions
