type InputMethod = 'file' | 'text'

interface InputMethodSwitchProps {
  activeMethod: InputMethod
  onSwitch: (method: InputMethod) => void
}

function InputMethodSwitch({ activeMethod, onSwitch }: InputMethodSwitchProps) {
  return (
    <div className="w-full">
      <div className="flex bg-gray-100 p-1 rounded-xl">
        <button
          onClick={() => onSwitch('file')}
          className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
            activeMethod === 'file'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>上传文档</span>
        </button>
        <button
          onClick={() => onSwitch('text')}
          className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
            activeMethod === 'text'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span>输入文本</span>
        </button>
      </div>
      
      <div className="mt-2 text-center">
        {activeMethod === 'file' ? (
          <p className="text-sm text-gray-500">上传 .doc 或 .docx 格式的 Word 文档</p>
        ) : (
          <p className="text-sm text-gray-500">直接输入或粘贴您的文档内容</p>
        )}
      </div>
    </div>
  )
}

export default InputMethodSwitch