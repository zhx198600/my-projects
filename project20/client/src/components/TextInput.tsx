import { useCallback } from 'react'

interface TextInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  isSubmitting: boolean
}

function TextInput({ value, onChange, onSubmit, isSubmitting }: TextInputProps) {
  const wordCount = value.length
  const lineCount = value ? value.split('\n').length : 0

  const handleClear = useCallback(() => {
    onChange('')
  }, [onChange])

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData('text')
    onChange(value + pastedText)
  }, [value, onChange])

  return (
    <div className="w-full space-y-4">
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onPaste={handlePaste}
          placeholder="请在此输入或粘贴您的文档内容...

例如：
第一章 项目概述
1.1 项目背景
随着人工智能技术的快速发展，企业对智能化办公工具的需求日益增长...

1.2 项目目标
- 提升办公效率
- 降低人力成本
- 实现智能化转型"
          disabled={isSubmitting}
          className="w-full h-80 p-4 border-2 border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 resize-none focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
        />
        
        {value && (
          <button
            onClick={handleClear}
            disabled={isSubmitting}
            className="absolute top-3 right-3 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="清空内容"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>字数: <span className="font-medium text-gray-700">{wordCount}</span></span>
          </div>
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <span>行数: <span className="font-medium text-gray-700">{lineCount}</span></span>
          </div>
        </div>

        <button
          onClick={onSubmit}
          disabled={isSubmitting || !value.trim()}
          className="flex items-center space-x-2 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>处理中...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span>继续</span>
            </>
          )}
        </button>
      </div>

      <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
        <h4 className="text-sm font-medium text-indigo-800 mb-2">输入提示</h4>
        <ul className="text-sm text-indigo-700 space-y-1">
          <li>• 支持直接输入或粘贴文本内容</li>
          <li>• 建议包含清晰的章节结构（如：第一章、1.1、一、等）</li>
          <li>• 内容越详细，生成的PPT效果越好</li>
        </ul>
      </div>
    </div>
  )
}

export default TextInput