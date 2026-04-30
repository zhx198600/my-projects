import { useState, useEffect, useCallback } from 'react'
import SlideRenderer from './SlideRenderer'
import type { SlideContent, Template } from '../types'

interface SlidePreviewProps {
  isOpen: boolean
  onClose: () => void
  slides: SlideContent[]
  currentIndex: number
  onIndexChange: (index: number) => void
  template?: Template
}

function SlidePreview({
  isOpen,
  onClose,
  slides,
  currentIndex,
  onIndexChange,
  template,
}: SlidePreviewProps) {
  const [showControls, setShowControls] = useState(true)
  const [showThumbnails, setShowThumbnails] = useState(true)
  const [controlsTimeout, setControlsTimeout] = useState<ReturnType<typeof setTimeout> | null>(null)

  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeout) {
      clearTimeout(controlsTimeout)
    }
    setShowControls(true)
    const timeout = setTimeout(() => {
      setShowControls(false)
    }, 3000)
    setControlsTimeout(timeout)
  }, [controlsTimeout])

  useEffect(() => {
    if (isOpen) {
      resetControlsTimeout()
    }
    return () => {
      if (controlsTimeout) {
        clearTimeout(controlsTimeout)
      }
    }
  }, [isOpen, resetControlsTimeout, controlsTimeout])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault()
          onIndexChange(Math.max(0, currentIndex - 1))
          resetControlsTimeout()
          break
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
          e.preventDefault()
          onIndexChange(Math.min(slides.length - 1, currentIndex + 1))
          resetControlsTimeout()
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
        case 'Home':
          e.preventDefault()
          onIndexChange(0)
          resetControlsTimeout()
          break
        case 'End':
          e.preventDefault()
          onIndexChange(slides.length - 1)
          resetControlsTimeout()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, currentIndex, slides.length, onIndexChange, onClose, resetControlsTimeout])

  const handleMouseMove = () => {
    resetControlsTimeout()
  }

  const goToPrev = () => {
    onIndexChange(Math.max(0, currentIndex - 1))
    resetControlsTimeout()
  }

  const goToNext = () => {
    onIndexChange(Math.min(slides.length - 1, currentIndex + 1))
    resetControlsTimeout()
  }

  if (!isOpen) return null

  const currentSlide = slides[currentIndex]

  return (
    <div
      className="fixed inset-0 z-[100] bg-gradient-to-br from-gray-900 via-gray-800 to-black"
      onMouseMove={handleMouseMove}
    >
      <div
        className={`absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <h3 className="text-white text-lg font-semibold">
              幻灯片预览
            </h3>
            <span className="text-gray-400 text-sm">
              第 {currentIndex + 1} 页 / 共 {slides.length} 页
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowThumbnails(!showThumbnails)}
              className="px-3 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              title={showThumbnails ? '隐藏缩略图' : '显示缩略图'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="text-sm">退出 (ESC)</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-full">
        <div
          className={`relative h-full bg-black/40 transition-all duration-300 overflow-y-auto ${
            showThumbnails ? 'w-48' : 'w-0'
          }`}
        >
          {showThumbnails && (
            <div className="p-3 space-y-3">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  onClick={() => {
                    onIndexChange(index)
                    resetControlsTimeout()
                  }}
                  className={`w-full aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                    currentIndex === index
                      ? 'border-indigo-500 shadow-lg shadow-indigo-500/50'
                      : 'border-transparent opacity-70 hover:opacity-100 hover:border-gray-500'
                  }`}
                >
                  <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex flex-col p-2">
                    <div className="text-xs text-white/90 font-medium truncate">
                      {slide.title}
                    </div>
                    <div className="text-[10px] text-white/60 mt-1 line-clamp-2">
                      {slide.content.slice(0, 50)}...
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 flex items-center justify-center p-8 relative">
          {currentIndex > 0 && (
            <button
              onClick={goToPrev}
              className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 w-14 h-14 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all duration-300 ${
                showControls ? 'opacity-100' : 'opacity-0'
              }`}
              title="上一页 (←)"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          <div className="w-full max-w-6xl aspect-video">
            {currentSlide && (
              <SlideRenderer
                slide={currentSlide}
                template={template}
              />
            )}
          </div>

          {currentIndex < slides.length - 1 && (
            <button
              onClick={goToNext}
              className={`absolute right-4 top-1/2 -translate-y-1/2 z-10 w-14 h-14 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all duration-300 ${
                showControls ? 'opacity-100' : 'opacity-0'
              }`}
              title="下一页 (→)"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div
        className={`absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="px-6 py-4">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <button
              onClick={goToPrev}
              disabled={currentIndex === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>上一页</span>
            </button>

            <div className="flex items-center space-x-4">
              <span className="text-white/80 text-sm">
                {currentIndex + 1} / {slides.length}
              </span>
              <div className="w-64 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / slides.length) * 100}%` }}
                />
              </div>
            </div>

            <button
              onClick={goToNext}
              disabled={currentIndex === slides.length - 1}
              className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all"
            >
              <span>下一页</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <p className="text-center text-white/50 text-xs mt-3">
            键盘快捷键：← → 切换页面 | ESC 退出预览
          </p>
        </div>
      </div>
    </div>
  )
}

export default SlidePreview
