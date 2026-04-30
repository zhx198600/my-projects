import { DEFAULT_COLOR_SCHEME } from '../types'
import type { ExportSlide, ExportOptions, DefaultColorScheme } from '../types'

const PptxGenJS = require('pptxgenjs')

const IMAGE_BASE_URL = 'https://picsum.photos'

function generateImageUrl(slide: ExportSlide): string {
  const keywords = slide.keywords?.slice(0, 1) || [slide.title.substring(0, 10)]
  const seed = encodeURIComponent(keywords.join('-').replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, ''))
  return `${IMAGE_BASE_URL}/seed/${seed}/800/600`
}

function parseContent(content: string): string[] {
  return content.split('\n').filter(line => line.trim())
}

const TEMPLATE_COLOR_SCHEMES: Record<string, DefaultColorScheme> = {
  business: {
    primary: '#1E3A5F',
    primaryLight: '#2D4A6F',
    secondary: '#4A7C9E',
    accent: '#E67E22',
    background: '#FFFFFF',
    backgroundAlt: '#F8FAFC',
    backgroundDark: '#1A2332',
    textPrimary: '#1A1A2E',
    textSecondary: '#64748B',
    textLight: '#94A3B8',
    border: '#E2E8F0',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  minimal: {
    primary: '#1A1A1A',
    primaryLight: '#333333',
    secondary: '#666666',
    accent: '#0066CC',
    background: '#FFFFFF',
    backgroundAlt: '#FAFAFA',
    backgroundDark: '#1A1A1A',
    textPrimary: '#1A1A1A',
    textSecondary: '#666666',
    textLight: '#999999',
    border: '#E5E5E5',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  academic: {
    primary: '#1A472A',
    primaryLight: '#2D5A3D',
    secondary: '#4A7C5E',
    accent: '#8B6914',
    background: '#FFFFFF',
    backgroundAlt: '#F5F7F5',
    backgroundDark: '#1A2A1F',
    textPrimary: '#1A2A1F',
    textSecondary: '#5A6A5E',
    textLight: '#8A9A8E',
    border: '#D1D5D3',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  creative: {
    primary: '#6B21A8',
    primaryLight: '#7C3AED',
    secondary: '#A855F7',
    accent: '#EC4899',
    background: '#FFFFFF',
    backgroundAlt: '#FAF5FF',
    backgroundDark: '#1A0A2E',
    textPrimary: '#1A0A2E',
    textSecondary: '#6B4A8B',
    textLight: '#9A7ACB',
    border: '#E9D5FF',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
}

const SLIDE_LAYOUTS = {
  title: 'TITLE_SLIDE',
  content: 'TITLE_AND_CONTENT',
  list: 'TITLE_AND_CONTENT',
  'image-text': 'TITLE_AND_CONTENT',
} as const

export async function exportToPptx(
  slides: ExportSlide[],
  options: ExportOptions,
  title: string = 'Presentation'
): Promise<Buffer> {
  const pptx = new PptxGenJS()
  const colors = TEMPLATE_COLOR_SCHEMES[options.templateId] || DEFAULT_COLOR_SCHEME
  
  pptx.author = 'PPT智能生成系统'
  pptx.title = title
  pptx.subject = 'Generated Presentation'
  pptx.layout = 'LAYOUT_16x9'

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i]
    const { type, title: slideTitle, content, imageUrl } = slide
    const hasContent = content && content.trim().length > 0
    const effectiveImageUrl = options.includeImages 
      ? (imageUrl || generateImageUrl(slide)) 
      : null

    const pptSlide = pptx.addSlide()
    
    if (type === 'title') {
      pptSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: 0,
        y: 0,
        w: '100%',
        h: '100%',
        fill: { color: colors.backgroundAlt },
      })

      let titleY = 2.5
      if (i === 0 && !hasContent) {
        titleY = 3
      }
      
      pptSlide.addText(slideTitle, {
        x: 0.5,
        y: titleY,
        w: 9,
        h: 2.5,
        fontSize: 48,
        fontFace: 'Arial',
        bold: true,
        color: colors.primary,
        align: 'center',
        valign: 'middle',
        paraSpaceAfter: 10,
      })

      if (hasContent) {
        const paragraphs = parseContent(content)
        const contentText = paragraphs.join('\n')
        
        pptSlide.addText(contentText, {
          x: 1,
          y: 4.8,
          w: 8,
          h: 1.5,
          fontSize: 24,
          fontFace: 'Arial',
          color: colors.textSecondary,
          align: 'center',
          valign: 'top',
          paraSpaceAfter: 8,
        })
      }
    } else if (type === 'list') {
      pptSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: 0,
        y: 0,
        w: '100%',
        h: '100%',
        fill: { color: colors.background },
      })

      pptSlide.addText(slideTitle, {
        x: 0.5,
        y: 0.5,
        w: 9,
        h: 0.8,
        fontSize: 32,
        fontFace: 'Arial',
        bold: true,
        color: colors.primary,
        valign: 'middle',
      })

      pptSlide.addShape(pptx.shapes.LINE, {
        x: 0.5,
        y: 1.3,
        w: 9,
        h: 0,
        line: { color: colors.border, width: 2 },
      })

      if (hasContent) {
        const items = parseContent(content)
        const showImage = options.includeImages && effectiveImageUrl && items.length > 0
        
        const contentX = 0.5
        const contentW = showImage ? 5.5 : 9
        const contentY = 1.6
        const contentH = 5

        const bulletText = items.map((item, idx) => ({
          text: item,
          options: {
            bullet: { type: 'bullet' },
            indentLevel: 0,
          },
        }))

        pptSlide.addText(bulletText, {
          x: contentX,
          y: contentY,
          w: contentW,
          h: contentH,
          fontSize: 22,
          fontFace: 'Arial',
          color: colors.textPrimary,
          valign: 'top',
          paraSpaceAfter: 12,
          lineSpacing: 24,
        })

        if (showImage && effectiveImageUrl) {
          try {
            pptSlide.addImage({
              path: effectiveImageUrl,
              x: 6.2,
              y: 1.6,
              w: 3.3,
              h: 4.2,
              sizing: { type: 'cover', w: 3.3, h: 4.2 },
            })
          } catch (err) {
            pptSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
              x: 6.2,
              y: 1.6,
              w: 3.3,
              h: 4.2,
              fill: { color: colors.backgroundAlt },
            })
            pptSlide.addText('插图', {
              x: 6.2,
              y: 3.2,
              w: 3.3,
              h: 1,
              fontSize: 20,
              fontFace: 'Arial',
              color: colors.textSecondary,
              align: 'center',
              valign: 'middle',
            })
          }
        }
      }
    } else {
      pptSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: 0,
        y: 0,
        w: '100%',
        h: '100%',
        fill: { color: colors.background },
      })

      pptSlide.addText(slideTitle, {
        x: 0.5,
        y: 0.5,
        w: 9,
        h: 0.8,
        fontSize: 32,
        fontFace: 'Arial',
        bold: true,
        color: colors.primary,
        valign: 'middle',
      })

      pptSlide.addShape(pptx.shapes.LINE, {
        x: 0.5,
        y: 1.3,
        w: 9,
        h: 0,
        line: { color: colors.border, width: 2 },
      })

      if (hasContent) {
        const paragraphs = parseContent(content)
        const showImage = options.includeImages && effectiveImageUrl && paragraphs.length > 0
        
        const contentX = 0.5
        const contentW = showImage ? 5.5 : 9
        const contentY = 1.6
        const contentH = 5

        const paragraphText = paragraphs.map((p, idx) => ({
          text: p + '\n',
          options: {
            paraSpaceAfter: 12,
          },
        }))

        pptSlide.addText(paragraphText, {
          x: contentX,
          y: contentY,
          w: contentW,
          h: contentH,
          fontSize: 22,
          fontFace: 'Arial',
          color: colors.textPrimary,
          valign: 'top',
          lineSpacing: 32,
        })

        if (showImage && effectiveImageUrl) {
          try {
            pptSlide.addImage({
              path: effectiveImageUrl,
              x: 6.2,
              y: 1.6,
              w: 3.3,
              h: 4.2,
              sizing: { type: 'cover', w: 3.3, h: 4.2 },
            })
          } catch (err) {
            pptSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
              x: 6.2,
              y: 1.6,
              w: 3.3,
              h: 4.2,
              fill: { color: colors.backgroundAlt },
            })
            pptSlide.addText('插图', {
              x: 6.2,
              y: 3.2,
              w: 3.3,
              h: 1,
              fontSize: 20,
              fontFace: 'Arial',
              color: colors.textSecondary,
              align: 'center',
              valign: 'middle',
            })
          }
        }
      }
    }

    if (options.pageNumbers) {
      pptSlide.addText(`${i + 1} / ${slides.length}`, {
        x: 8.5,
        y: 5.3,
        w: 1,
        h: 0.4,
        fontSize: 14,
        fontFace: 'Arial',
        color: colors.textSecondary,
        align: 'right',
        valign: 'middle',
      })
    }
  }

  const buffer = await pptx.stream()
  return Buffer.from(buffer)
}
