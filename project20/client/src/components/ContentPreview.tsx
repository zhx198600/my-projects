import type { ContentPreview as ContentPreviewType } from '../types'

interface ContentPreviewProps {
  preview: ContentPreviewType
  onConfirm: () => void
  onReset: () => void
  isGenerating: boolean
}

function ContentPreviewComponent({ preview, onConfirm, onReset, isGenerating }: ContentPreviewProps) {
  return (
    <div className="w-full space-y-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">内容解析完成</h3>
                <p className="text-sm text-indigo-100">以下是解析后的内容预览</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-white/20 rounded-full">
              <svg className="w-4 h-4 text-green-200" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-white">内容已保护</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-indigo-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-indigo-600">{preview.wordCount}</p>
              <p className="text-sm text-gray-600">总字数</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">{preview.lineCount}</p>
              <p className="text-sm text-gray-600">行数</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{Math.ceil(preview.wordCount / 300)}</p>
              <p className="text-sm text-gray-600">预估页数</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-orange-600">{preview.preview.length < preview.originalContent.length ? '部分' : '完整'}</p>
              <p className="text-sm text-gray-600">预览状态</p>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">内容预览</h4>
            <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto border border-gray-200">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                {preview.preview}
                {preview.preview.length < preview.originalContent.length && (
                  <span className="text-gray-400">...</span>
                )}
              </pre>
            </div>
            {preview.preview.length < preview.originalContent.length && (
              <p className="mt-2 text-sm text-gray-500">
                注：仅显示前 500 字符预览，完整内容将用于生成 PPT
              </p>
            )}
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-sm font-semibold text-yellow-800">隐私保护提示</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  您的内容仅用于本次 PPT 生成，不会被存储或用于其他用途。生成完成后，所有临时数据将被立即清除。
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onReset}
              disabled={isGenerating}
              className="w-full sm:w-auto px-8 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <span className="flex items-center justify-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>重新输入</span>
              </span>
            </button>
            <button
              onClick={onConfirm}
              disabled={isGenerating}
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-indigo-500/30"
            >
              <span className="flex items-center justify-center space-x-2">
                {isGenerating ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>生成中...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                    <span>确认并生成PPT</span>
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

export default ContentPreviewComponent