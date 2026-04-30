import { useRef, useCallback } from 'react'
import type { UploadState } from '../types'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  onUpload: (file: File) => Promise<void>
  onCancel: () => void
  uploadState: UploadState
  selectedFile: File | null
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function FileUpload({ onFileSelect, onUpload, onCancel, uploadState, selectedFile }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const validateFile = (file: File): boolean => {
    const allowedTypes = ['.docx']
    const fileName = file.name.toLowerCase()
    const isValid = allowedTypes.some(type => fileName.endsWith(type))
    
    if (!isValid) {
      return false
    }
    return true
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (validateFile(file)) {
        onFileSelect(file)
      } else {
        console.error('不支持的文件格式，请上传 .doc 或 .docx 文件')
      }
    }
  }, [onFileSelect])

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      if (validateFile(file)) {
        onFileSelect(file)
      } else {
        console.error('不支持的文件格式，请上传 .doc 或 .docx 文件')
      }
    }
  }, [onFileSelect])

  const handleClick = () => {
    if (!uploadState.isUploading) {
      fileInputRef.current?.click()
    }
  }

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation()
    onCancel()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (selectedFile) {
      onUpload(selectedFile)
    }
  }

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
          uploadState.isDragging
            ? 'border-indigo-500 bg-indigo-50'
            : uploadState.error
            ? 'border-red-300 bg-red-50'
            : selectedFile
            ? 'border-green-300 bg-green-50'
            : 'border-gray-300 bg-white hover:border-indigo-400 hover:bg-gray-50'
        }`}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".docx"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={uploadState.isUploading}
        />

        {!selectedFile && !uploadState.isUploading && (
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 flex items-center justify-center bg-indigo-100 rounded-full">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-medium text-gray-700">拖拽文件到此处，或点击选择</p>
              <p className="mt-1 text-sm text-gray-500">支持 .docx 格式的 Word 文档（旧版 .doc 请另存为 .docx）</p>
            </div>
          </div>
        )}

        {selectedFile && !uploadState.isUploading && !uploadState.error && (
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 flex items-center justify-center bg-green-100 rounded-full">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-medium text-gray-700">{selectedFile.name}</p>
              <p className="mt-1 text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
            </div>
            <div className="flex justify-center space-x-3">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onUpload(selectedFile)
                }}
                className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200"
              >
                开始上传
              </button>
              <button
                onClick={handleRemoveFile}
                className="px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors duration-200"
              >
                重新选择
              </button>
            </div>
          </div>
        )}

        {uploadState.isUploading && (
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 flex items-center justify-center">
              <svg className="animate-spin w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <div>
              <p className="text-lg font-medium text-gray-700">正在上传...</p>
              <p className="mt-1 text-sm text-gray-500">{selectedFile?.name}</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadState.progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500">{uploadState.progress}%</p>
            <button
              onClick={handleRemoveFile}
              className="px-4 py-2 text-red-600 font-medium hover:text-red-700 transition-colors duration-200"
            >
              取消上传
            </button>
          </div>
        )}

        {uploadState.error && (
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 flex items-center justify-center bg-red-100 rounded-full">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-medium text-red-700">上传失败</p>
              <p className="mt-1 text-sm text-red-600">{uploadState.error}</p>
            </div>
            <div className="flex justify-center space-x-3">
              <button
                onClick={handleRetry}
                className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200"
              >
                重新上传
              </button>
              <button
                onClick={handleRemoveFile}
                className="px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors duration-200"
              >
                重新选择
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 text-center text-sm text-gray-500">
        <p>提示：文件大小建议不超过 10MB</p>
      </div>
    </div>
  )
}

export default FileUpload