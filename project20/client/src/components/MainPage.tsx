import { useState, useCallback } from 'react'
import FileUpload from './FileUpload'
import TextInput from './TextInput'
import InputMethodSwitch from './InputMethodSwitch'
import ContentPreviewComponent from './ContentPreview'
import SlideRenderer from './SlideRenderer'
import SlidePreview from './SlidePreview'
import SimpleTemplateSelector from './SimpleTemplateSelector'
import ExportOptions from './ExportOptions'
import ExportProgress from './ExportProgress'
import { apiService } from '../services/api'
import { templateService } from '../services/templateService'
import type { UploadState, ContentPreview, PaginationResult, Template, ExportOptions as ExportOptionsType } from '../types'
import type { ExportFormat } from './ExportOptions'

type InputMethod = 'file' | 'text'
type PageState = 'input' | 'preview' | 'generating' | 'slides'

function MainPage() {
  const [activeMethod, setActiveMethod] = useState<InputMethod>('file')
  const [pageState, setPageState] = useState<PageState>('input')
  
  const [uploadState, setUploadState] = useState<UploadState>({
    isDragging: false,
    isUploading: false,
    progress: 0,
    error: null,
  })
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [textInput, setTextInput] = useState('')
  const [isTextSubmitting, setIsTextSubmitting] = useState(false)
  
  const [contentPreview, setContentPreview] = useState<ContentPreview | null>(null)
  const [paginationResult, setPaginationResult] = useState<PaginationResult | null>(null)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(templateService.getDefaultTemplate())
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  const [isExportOptionsOpen, setIsExportOptionsOpen] = useState(false)
  const [isExportProgressOpen, setIsExportProgressOpen] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [exportStatus, setExportStatus] = useState<'idle' | 'preparing' | 'generating' | 'complete' | 'error'>('idle')
  const [exportMessage, setExportMessage] = useState('')
  const [exportDownloadUrl, setExportDownloadUrl] = useState<string | undefined>()
  const [exportBlob, setExportBlob] = useState<Blob | undefined>()
  const [exportFormat, setExportFormat] = useState<ExportFormat>('pdf')

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file)
    setUploadState(prev => ({
      ...prev,
      error: null,
      progress: 0,
    }))
  }, [])

  const handleFileUpload = useCallback(async (file: File) => {
    setUploadState(prev => ({
      ...prev,
      isUploading: true,
      progress: 0,
      error: null,
    }))

    try {
      const response = await apiService.uploadFile(file, (progress) => {
        setUploadState(prev => ({ ...prev, progress }))
      })

      if (response.success && response.data) {
        const preview: ContentPreview = {
          originalContent: response.data.content,
          wordCount: response.data.wordCount,
          lineCount: response.data.lineCount,
          preview: response.data.content.slice(0, 500),
        }
        setContentPreview(preview)
        setPageState('preview')
      } else {
        setUploadState(prev => ({
          ...prev,
          error: response.error?.message || '上传失败',
        }))
      }
    } catch (error) {
      setUploadState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '上传失败',
      }))
    } finally {
      setUploadState(prev => ({
        ...prev,
        isUploading: false,
      }))
    }
  }, [])

  const handleFileCancel = useCallback(() => {
    setSelectedFile(null)
    setUploadState({
      isDragging: false,
      isUploading: false,
      progress: 0,
      error: null,
    })
  }, [])

  const handleTextSubmit = useCallback(async () => {
    if (!textInput.trim()) return

    setIsTextSubmitting(true)

    try {
      const response = await apiService.parseText(textInput)

      if (response.success && response.data) {
        const preview: ContentPreview = {
          originalContent: response.data.content,
          wordCount: response.data.wordCount,
          lineCount: response.data.lineCount,
          preview: response.data.content.slice(0, 500),
        }
        setContentPreview(preview)
        setPageState('preview')
      } else {
        console.error('文本解析失败:', response.error?.message)
      }
    } catch (error) {
      console.error('文本解析失败:', error)
    } finally {
      setIsTextSubmitting(false)
    }
  }, [textInput])

  const handleReset = useCallback(() => {
    setPageState('input')
    setContentPreview(null)
    setPaginationResult(null)
    setCurrentSlideIndex(0)
    handleFileCancel()
    setTextInput('')
  }, [handleFileCancel])

  const handleGeneratePPT = useCallback(async () => {
    if (!contentPreview) return

    setPageState('generating')

    try {
      const response = await apiService.paginateContent(contentPreview.originalContent)

      if (response.success && response.data) {
        setPaginationResult(response.data)
        setCurrentSlideIndex(0)
        setPageState('slides')
      } else {
        console.error('分页失败:', response.error?.message)
        alert('分页失败: ' + (response.error?.message || '未知错误'))
        setPageState('preview')
      }
    } catch (error) {
      console.error('分页失败:', error)
      alert('分页失败: ' + (error instanceof Error ? error.message : '未知错误'))
      setPageState('preview')
    }
  }, [contentPreview])

  const handleExport = useCallback(async (options: ExportOptionsType, format: ExportFormat) => {
    if (!paginationResult) return

    setIsExportOptionsOpen(false)
    setIsExportProgressOpen(true)
    setExportStatus('preparing')
    setExportProgress(10)
    setExportFormat(format)
    setExportBlob(undefined)
    setExportDownloadUrl(undefined)
    setExportMessage('正在准备导出...')

    try {
      const exportSlides = paginationResult.slides.map((slide) => ({
        index: slide.index,
        title: slide.title,
        content: slide.content,
        keywords: slide.keywords,
      }))

      setExportStatus('generating')
      setExportProgress(30)
      setExportMessage(`正在生成 ${format === 'pptx' ? 'PPTX' : 'PDF'}...`)

      if (format === 'pptx') {
        const response = await apiService.exportToPptx({
          slides: exportSlides,
          options,
          templateId: selectedTemplate?.id,
          title: paginationResult.slides[0]?.title || 'Presentation',
        })

        if (response.success && response.data) {
          setExportStatus('complete')
          setExportProgress(100)
          setExportMessage('PPTX 生成完成！')
          setExportBlob(response.data)
        } else {
          throw new Error(response.error?.message || '导出失败')
        }
      } else {
        const response = await apiService.exportToPdf({
          slides: exportSlides,
          options,
          templateId: selectedTemplate?.id,
        })

        if (response.success && response.data) {
          setExportStatus('complete')
          setExportProgress(100)
          setExportMessage('PDF 生成完成！')
          setExportDownloadUrl(response.data.downloadUrl)
        } else {
          throw new Error(response.error?.message || '导出失败')
        }
      }
    } catch (error) {
      setExportStatus('error')
      setExportMessage(error instanceof Error ? error.message : '导出失败')
    }
  }, [paginationResult, selectedTemplate])

  const handleDownload = useCallback(() => {
    if (exportBlob) {
      const link = document.createElement('a')
      const url = URL.createObjectURL(exportBlob)
      link.href = url
      link.download = `presentation-${Date.now()}.pptx`
      link.click()
      URL.revokeObjectURL(url)
    } else if (exportDownloadUrl) {
      const link = document.createElement('a')
      link.href = exportDownloadUrl
      link.download = `presentation-${Date.now()}.pdf`
      link.click()
    }
  }, [exportBlob, exportDownloadUrl])

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          开始创建您的 PPT
        </h2>
        <p className="text-lg text-gray-600">
          上传文档或输入文本，AI 将智能分析并生成专业 PPT
        </p>
      </div>

      {pageState === 'input' && (
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <div className="mb-8">
            <InputMethodSwitch
              activeMethod={activeMethod}
              onSwitch={(method) => setActiveMethod(method)}
            />
          </div>

          <div className="transition-all duration-300">
            {activeMethod === 'file' ? (
              <FileUpload
                onFileSelect={handleFileSelect}
                onUpload={handleFileUpload}
                onCancel={handleFileCancel}
                uploadState={uploadState}
                selectedFile={selectedFile}
              />
            ) : (
              <TextInput
                value={textInput}
                onChange={setTextInput}
                onSubmit={handleTextSubmit}
                isSubmitting={isTextSubmitting}
              />
            )}
          </div>
        </div>
      )}

      {pageState === 'preview' && contentPreview && (
        <div className="animate-fadeIn">
          <ContentPreviewComponent
            preview={contentPreview}
            onConfirm={handleGeneratePPT}
            onReset={handleReset}
            isGenerating={false}
          />
        </div>
      )}

      {pageState === 'generating' && contentPreview && (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="mx-auto w-20 h-20 flex items-center justify-center mb-6">
            <svg className="animate-spin w-12 h-12 text-indigo-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">正在生成 PPT</h3>
          <p className="text-gray-600 mb-4">AI 正在分析您的内容并设计幻灯片布局...</p>
          <div className="max-w-md mx-auto">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2.5 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
            <p className="mt-2 text-sm text-gray-500">预计需要 10-30 秒</p>
          </div>
        </div>
      )}

      {pageState === 'slides' && paginationResult && (
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                PPT 幻灯片预览
              </h3>
              <p className="text-gray-600 mt-1">
                共 {paginationResult.totalSlides} 页 · {paginationResult.totalWords} 字
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <SimpleTemplateSelector
                selectedTemplate={selectedTemplate}
                onTemplateChange={setSelectedTemplate}
              />
              <button
                onClick={() => setIsPreviewMode(true)}
                className="px-4 py-2 bg-white text-indigo-600 border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 transition-all shadow-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                全屏预览
              </button>
              <button
                onClick={() => setIsExportOptionsOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md shadow-indigo-500/30 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                导出 PDF
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                重新开始
              </button>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {paginationResult.slides.map((slide, index) => (
                <button
                  key={slide.id}
                  onClick={() => setCurrentSlideIndex(index)}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-all ${
                    currentSlideIndex === index
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  第 {index + 1} 页
                  <span className="block text-xs opacity-70 mt-0.5">
                    {slide.type === 'title' ? '标题' : 
                     slide.type === 'list' ? '列表' : 
                     slide.type === 'image-text' ? '图文' : '内容'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gray-100 rounded-xl p-6 md:p-8">
            {paginationResult.slides[currentSlideIndex] && (
              <SlideRenderer
                slide={paginationResult.slides[currentSlideIndex]}
                template={selectedTemplate}
              />
            )}
          </div>

          {paginationResult.slides[currentSlideIndex]?.keywords && 
           paginationResult.slides[currentSlideIndex].keywords.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-2">关键词（用于AI插图生成）：</p>
              <div className="flex flex-wrap gap-2">
                {paginationResult.slides[currentSlideIndex].keywords.map((keyword, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => setCurrentSlideIndex(prev => Math.max(0, prev - 1))}
              disabled={currentSlideIndex === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                currentSlideIndex === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              上一页
            </button>

            <span className="text-gray-600">
              第 {currentSlideIndex + 1} 页 / 共 {paginationResult.totalSlides} 页
            </span>

            <button
              onClick={() => setCurrentSlideIndex(prev => Math.min(paginationResult.totalSlides - 1, prev + 1))}
              disabled={currentSlideIndex === paginationResult.totalSlides - 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                currentSlideIndex === paginationResult.totalSlides - 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              下一页
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              内容哈希验证：{paginationResult.contentHash.substring(0, 20)}... （用于验证内容完整性）
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <div className="mx-auto w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">快速生成</h3>
          <p className="text-sm text-gray-600">上传文档或粘贴文本，AI 自动分析内容结构</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <div className="mx-auto w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">专业模板</h3>
          <p className="text-sm text-gray-600">多种商务风格模板，满足不同场景需求</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <div className="mx-auto w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">隐私保护</h3>
          <p className="text-sm text-gray-600">内容仅用于本次生成，不会被存储或泄露</p>
        </div>
      </div>

      <ExportOptions
        isOpen={isExportOptionsOpen}
        onClose={() => setIsExportOptionsOpen(false)}
        onExport={handleExport}
        isExporting={exportStatus === 'preparing' || exportStatus === 'generating'}
      />

      <ExportProgress
        isOpen={isExportProgressOpen}
        onClose={() => setIsExportProgressOpen(false)}
        progress={exportProgress}
        status={exportStatus}
        message={exportMessage}
        downloadUrl={exportDownloadUrl}
        hasBlob={!!exportBlob}
        format={exportFormat}
        onDownload={handleDownload}
      />

      {paginationResult && (
        <SlidePreview
          isOpen={isPreviewMode}
          onClose={() => setIsPreviewMode(false)}
          slides={paginationResult.slides}
          currentIndex={currentSlideIndex}
          onIndexChange={setCurrentSlideIndex}
          template={selectedTemplate}
        />
      )}
    </div>
  )
}

export default MainPage