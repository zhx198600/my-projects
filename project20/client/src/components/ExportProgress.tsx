export type ExportFormat = 'pdf' | 'pptx'

interface ExportProgressProps {
  isOpen: boolean
  onClose: () => void
  progress: number
  status: 'idle' | 'preparing' | 'generating' | 'complete' | 'error'
  message: string
  downloadUrl?: string
  hasBlob?: boolean
  format: ExportFormat
  onDownload: () => void
}

function ExportProgress({
  isOpen,
  onClose,
  progress,
  status,
  message,
  downloadUrl,
  hasBlob,
  format,
  onDownload,
}: ExportProgressProps) {
  if (!isOpen) return null

  const formatLabel = format === 'pptx' ? 'PPTX' : 'PDF'

  const getStatusIcon = () => {
    switch (status) {
      case 'preparing':
      case 'generating':
        return (
          <div className="w-16 h-16 flex items-center justify-center">
            <svg className="animate-spin w-12 h-12 text-indigo-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )
      case 'complete':
        return (
          <div className="w-16 h-16 flex items-center justify-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        )
      case 'error':
        return (
          <div className="w-16 h-16 flex items-center justify-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'preparing':
        return '准备中'
      case 'generating':
        return '生成中'
      case 'complete':
        return '完成'
      case 'error':
        return '错误'
      default:
        return ''
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'complete':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-indigo-600'
    }
  }

  const canDownload = downloadUrl || hasBlob

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={status !== 'preparing' && status !== 'generating' ? onClose : undefined}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-fadeIn">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">导出进度</h3>
                <p className="text-sm text-indigo-100">{formatLabel} 导出状态</p>
              </div>
            </div>
            {status !== 'preparing' && status !== 'generating' && (
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-col items-center text-center mb-6">
            {getStatusIcon()}
            <div className="mt-4">
              <span className={`text-lg font-semibold ${getStatusColor()}`}>
                {getStatusText()}
              </span>
              <p className="text-gray-600 mt-1">{message}</p>
            </div>
          </div>

          {(status === 'preparing' || status === 'generating') && (
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>进度</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {status === 'complete' && canDownload && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="text-sm font-semibold text-green-800">导出成功</h4>
                  <p className="text-sm text-green-700 mt-1">
                    您的 {formatLabel} 文件已准备好下载
                  </p>
                </div>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="text-sm font-semibold text-red-800">导出失败</h4>
                  <p className="text-sm text-red-700 mt-1">
                    {message}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {status === 'complete' && canDownload && (
              <button
                onClick={onDownload}
                className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/30"
              >
                <span className="flex items-center justify-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>下载 {formatLabel}</span>
                </span>
              </button>
            )}

            {status === 'error' && (
              <button
                onClick={onClose}
                className="w-full px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-all"
              >
                关闭
              </button>
            )}

            {status === 'complete' && (
              <button
                onClick={onClose}
                className="w-full px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-all"
              >
                稍后下载
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExportProgress
