import { useMemo, useState, useCallback } from 'react'
import type { SlideContent, Template, TemplateLayout } from '../types'
import { templateService } from '../services/templateService'

interface SlideRendererProps {
  slide: SlideContent
  template?: Template
  layout?: TemplateLayout
  imageUrl?: string
}

function SlideRenderer({ 
  slide, 
  template,
  layout,
  imageUrl 
}: SlideRendererProps) {
  const effectiveTemplate = template || templateService.getDefaultTemplate()
  const effectiveLayout = layout || templateService.recommendLayout(
    effectiveTemplate, 
    slide.type
  ) || effectiveTemplate.layouts.find(l => l.id === effectiveTemplate.defaultLayout)!

  const { colorScheme, fonts } = effectiveTemplate
  const [imageErrorCount, setImageErrorCount] = useState(0)
  const [currentImageSrc, setCurrentImageSrc] = useState<string | null>(null)

  const primaryImageUrl = useMemo(() => {
    if (imageUrl) return imageUrl
    const keywords = slide.keywords?.slice(0, 3) || [slide.title]
    const prompt = encodeURIComponent(`professional business presentation illustration, ${keywords.join(', ')}, elegant design, high quality, 4k, corporate style`)
    return `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${prompt}&image_size=square_hd`
  }, [imageUrl, slide.keywords, slide.title])

  const fallbackImageUrl = useMemo(() => {
    const keywords = slide.keywords?.slice(0, 1) || [slide.title.substring(0, 10)]
    const seed = encodeURIComponent(keywords.join('-').replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, ''))
    return `https://picsum.photos/seed/${seed}/400/300`
  }, [slide.keywords, slide.title])

  const effectiveImageSrc = useMemo(() => {
    if (currentImageSrc) return currentImageSrc
    if (imageErrorCount === 0) return primaryImageUrl
    if (imageErrorCount === 1) return fallbackImageUrl
    return null
  }, [currentImageSrc, imageErrorCount, primaryImageUrl, fallbackImageUrl])

  const handleImageError = useCallback(() => {
    if (imageErrorCount < 2) {
      setImageErrorCount(prev => prev + 1)
    }
  }, [imageErrorCount])

  const parseContent = (content: string): string[] => {
    return content.split('\n').filter(line => line.trim())
  }

  const calculateFontSize = (text: string, baseSize: string, type: 'title' | 'content'): string => {
    const length = text.length
    const baseNum = parseFloat(baseSize)
    
    if (type === 'title') {
      if (length > 40) return `${baseNum * 0.6}rem`
      if (length > 30) return `${baseNum * 0.7}rem`
      if (length > 20) return `${baseNum * 0.8}rem`
      if (length > 15) return `${baseNum * 0.9}rem`
    } else {
      const lines = text.split('\n').length
      if (lines > 10) return `${baseNum * 0.7}rem`
      if (lines > 7) return `${baseNum * 0.8}rem`
      if (lines > 5) return `${baseNum * 0.85}rem`
      
      if (length > 300) return `${baseNum * 0.75}rem`
      if (length > 200) return `${baseNum * 0.85}rem`
      if (length > 150) return `${baseNum * 0.9}rem`
    }
    
    return baseSize
  }

  const titleFontSize = useMemo(() => {
    const baseSize = effectiveLayout.type === 'title' ? '3rem' : fonts.title.size
    return calculateFontSize(slide.title, baseSize, 'title')
  }, [slide.title, fonts.title.size, effectiveLayout.type])

  const contentFontSize = useMemo(() => {
    return calculateFontSize(slide.content, fonts.body.size, 'content')
  }, [slide.content, fonts.body.size])

  const ImagePlaceholder = ({ className = '' }: { className?: string }) => (
    <div 
      className={`rounded-lg overflow-hidden flex items-center justify-center ${className}`}
      style={{
        backgroundColor: colorScheme.backgroundAlt,
        border: `1px solid ${colorScheme.border}`,
      }}
    >
      {effectiveImageSrc ? (
        <img
          src={effectiveImageSrc}
          alt={slide.title}
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-center p-4 h-full">
          <svg 
            className="w-16 h-16 mb-3" 
            style={{ color: colorScheme.textSecondary }} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="1.5" 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
          <p 
            style={{ 
              color: colorScheme.textSecondary, 
              fontFamily: fonts.caption.family, 
              fontSize: fonts.caption.size 
            }}
          >
            插图加载中...
          </p>
        </div>
      )}
    </div>
  )

  const renderTitleLayout = () => (
    <div 
      className="h-full w-full flex flex-col justify-center items-center text-center p-8"
      style={{
        backgroundColor: colorScheme.backgroundAlt,
      }}
    >
      <h2
        className="mb-6 px-4"
        style={{
          fontFamily: fonts.title.family,
          fontSize: titleFontSize,
          fontWeight: fonts.title.weight,
          lineHeight: fonts.title.lineHeight,
          letterSpacing: fonts.title.letterSpacing,
          color: colorScheme.primary,
          maxWidth: '90%',
        }}
      >
        {slide.title}
      </h2>
      {slide.content && (
        <div
          className="px-6 max-w-3xl overflow-y-auto"
          style={{
            fontFamily: fonts.subtitle.family,
            fontSize: contentFontSize,
            fontWeight: fonts.subtitle.weight,
            lineHeight: fonts.subtitle.lineHeight,
            color: colorScheme.textSecondary,
            maxHeight: '40%',
          }}
        >
          {parseContent(slide.content).map((line, idx) => (
            <p key={idx} className="mb-2 last:mb-0">
              {line}
            </p>
          ))}
        </div>
      )}
    </div>
  )

  const renderContentLayout = () => {
    const paragraphs = parseContent(slide.content)
    const hasContent = slide.content && slide.content.trim().length > 0
    const showImage = hasContent && effectiveLayout.type !== 'title'
    
    return (
      <div 
        className="h-full w-full flex flex-col p-8"
        style={{
          backgroundColor: colorScheme.background,
        }}
      >
        <h2
          className="mb-4 pb-3 border-b flex-shrink-0"
          style={{
            fontFamily: fonts.title.family,
            fontSize: titleFontSize,
            fontWeight: fonts.title.weight,
            lineHeight: fonts.title.lineHeight,
            letterSpacing: fonts.title.letterSpacing,
            color: colorScheme.primary,
            borderColor: colorScheme.border,
          }}
        >
          {slide.title}
        </h2>
        
        {showImage ? (
          <div className="flex flex-1 min-h-0 gap-6">
            <div
              className="flex-1 overflow-y-auto"
              style={{
                fontFamily: fonts.body.family,
                fontSize: contentFontSize,
                fontWeight: fonts.body.weight,
                lineHeight: fonts.body.lineHeight,
                color: colorScheme.textPrimary,
              }}
            >
              {paragraphs.map((paragraph, idx) => (
                <p key={idx} className="mb-3 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
            <div className="w-1/3 flex-shrink-0">
              <ImagePlaceholder className="w-full h-full" />
            </div>
          </div>
        ) : (
          <div
            className="flex-1 overflow-y-auto"
            style={{
              fontFamily: fonts.body.family,
              fontSize: contentFontSize,
              fontWeight: fonts.body.weight,
              lineHeight: fonts.body.lineHeight,
              color: colorScheme.textPrimary,
            }}
          >
            {paragraphs.map((paragraph, idx) => (
              <p key={idx} className="mb-3 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>
        )}
      </div>
    )
  }

  const renderListLayout = () => {
    const items = parseContent(slide.content)
    const hasContent = items.length > 0
    
    return (
      <div 
        className="h-full w-full flex flex-col p-8"
        style={{
          backgroundColor: colorScheme.background,
        }}
      >
        <h2
          className="mb-4 pb-3 border-b flex-shrink-0"
          style={{
            fontFamily: fonts.title.family,
            fontSize: titleFontSize,
            fontWeight: fonts.title.weight,
            lineHeight: fonts.title.lineHeight,
            letterSpacing: fonts.title.letterSpacing,
            color: colorScheme.primary,
            borderColor: colorScheme.border,
          }}
        >
          {slide.title}
        </h2>
        
        {hasContent ? (
          <div className="flex flex-1 min-h-0 gap-6">
            <ul
              className="flex-1 overflow-y-auto pl-6"
              style={{
                fontFamily: fonts.body.family,
                fontSize: contentFontSize,
                fontWeight: fonts.body.weight,
                lineHeight: fonts.body.lineHeight,
                color: colorScheme.textPrimary,
              }}
            >
              {items.map((item, idx) => (
                <li 
                  key={idx} 
                  className="mb-3 last:mb-0 list-disc"
                  style={{ paddingLeft: '0.5rem' }}
                >
                  {item}
                </li>
              ))}
            </ul>
            <div className="w-1/3 flex-shrink-0">
              <ImagePlaceholder className="w-full h-full" />
            </div>
          </div>
        ) : (
          <ul
            className="flex-1 overflow-y-auto pl-6"
            style={{
              fontFamily: fonts.body.family,
              fontSize: contentFontSize,
              fontWeight: fonts.body.weight,
              lineHeight: fonts.body.lineHeight,
              color: colorScheme.textPrimary,
            }}
          >
            {items.map((item, idx) => (
              <li 
                key={idx} 
                className="mb-3 last:mb-0 list-disc"
                style={{ paddingLeft: '0.5rem' }}
              >
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }

  const renderImageTextLayout = () => {
    const paragraphs = parseContent(slide.content)
    
    return (
      <div 
        className="h-full w-full flex p-8"
        style={{
          backgroundColor: colorScheme.background,
        }}
      >
        <div className="w-2/5 flex-shrink-0 mr-8">
          <ImagePlaceholder className="w-full h-full" />
        </div>
        
        <div className="flex-1 flex flex-col min-w-0">
          <h2
            className="mb-4 pb-3 border-b flex-shrink-0"
            style={{
              fontFamily: fonts.title.family,
              fontSize: titleFontSize,
              fontWeight: fonts.title.weight,
              lineHeight: fonts.title.lineHeight,
              letterSpacing: fonts.title.letterSpacing,
              color: colorScheme.primary,
              borderColor: colorScheme.border,
            }}
          >
            {slide.title}
          </h2>
          <div
            className="flex-1 overflow-y-auto"
            style={{
              fontFamily: fonts.body.family,
              fontSize: contentFontSize,
              fontWeight: fonts.body.weight,
              lineHeight: fonts.body.lineHeight,
              color: colorScheme.textPrimary,
            }}
          >
            {paragraphs.map((paragraph, idx) => (
              <p key={idx} className="mb-3 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderLayout = () => {
    switch (effectiveLayout.type) {
      case 'title':
        return renderTitleLayout()
      case 'list':
        return renderListLayout()
      case 'image-text':
        return renderImageTextLayout()
      case 'content':
      default:
        return renderContentLayout()
    }
  }

  return (
    <div 
      className="w-full h-full rounded-xl overflow-hidden shadow-xl"
      style={{
        aspectRatio: '16/9',
        border: `2px solid ${colorScheme.border}`,
      }}
    >
      {renderLayout()}
    </div>
  )
}

export default SlideRenderer
