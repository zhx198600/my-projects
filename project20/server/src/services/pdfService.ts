import fs from 'fs'
import path from 'path'
import { PageSize, ExportOptions, ExportSlide, PdfExportResult } from '../types'
import config from '../config'

type PaperFormat = 'Letter' | 'Legal' | 'Tabloid' | 'Ledger' | 'A0' | 'A1' | 'A2' | 'A3' | 'A4' | 'A5' | 'A6'

interface PageSizeConfig {
  format?: PaperFormat
  width?: string
  height?: string
}

const PAGE_SIZES: Record<PageSize, PageSizeConfig> = {
  'A4': { format: 'A4' },
  'Letter': { format: 'Letter' },
  'Legal': { format: 'Legal' },
  '16:9': { width: '1920px', height: '1080px' },
  '4:3': { width: '1024px', height: '768px' },
}

const QUALITY_OPTIONS = {
  low: { scale: 0.5, printBackground: true },
  medium: { scale: 1, printBackground: true },
  high: { scale: 2, printBackground: true },
}

interface DefaultColorScheme {
  primary: string
  secondary: string
  accent: string
  background: string
  backgroundAlt: string
  textPrimary: string
  textSecondary: string
  border: string
}

const DEFAULT_COLOR_SCHEME: DefaultColorScheme = {
  primary: '#3B82F6',
  secondary: '#6B7280',
  accent: '#F59E0B',
  background: '#FFFFFF',
  backgroundAlt: '#F9FAFB',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
}

function getTemplateColors(_templateId?: string): DefaultColorScheme {
  return DEFAULT_COLOR_SCHEME
}

function ensureTempDir(): void {
  if (!fs.existsSync(config.tempDir)) {
    fs.mkdirSync(config.tempDir, { recursive: true })
  }
}

function generateFileName(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `ppt-export-${timestamp}-${random}.pdf`
}

const IMAGE_BASE_URL = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image'

function generateImageUrl(slide: ExportSlide): string {
  const keywords = slide.keywords?.slice(0, 3) || [slide.title]
  const prompt = encodeURIComponent(`professional business presentation illustration, ${keywords.join(', ')}, elegant design, high quality, 4k, corporate style`)
  return `${IMAGE_BASE_URL}?prompt=${prompt}&image_size=square_hd`
}

function generateSlideHtml(
  slide: ExportSlide,
  options: ExportOptions,
  colors: DefaultColorScheme,
  slideIndex: number,
  totalSlides: number
): string {
  const { includeImages, pageNumbers } = options
  const { title, content, imageUrl } = slide

  const effectiveImageUrl = includeImages ? (imageUrl || generateImageUrl(slide)) : null
  const hasImage = includeImages && effectiveImageUrl
  const hasContent = content && content.trim().length > 0

  return `
    <div class="slide" style="
      width: 100%;
      height: 100%;
      background: ${colors.background};
      padding: 40px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      page-break-after: always;
      position: relative;
    ">
      ${hasImage ? `
        <div style="
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          opacity: 0.05;
          background-image: url(${effectiveImageUrl});
          background-size: cover;
          background-position: center;
          z-index: 0;
        "></div>
      ` : ''}
      
      <div style="position: relative; z-index: 1; flex: 1; display: flex; flex-direction: column;">
        <div style="
          height: 4px;
          background: linear-gradient(90deg, ${colors.primary}, ${colors.accent});
          margin-bottom: 30px;
          border-radius: 2px;
        "></div>
        
        <h1 style="
          font-size: 36px;
          font-weight: 700;
          color: ${colors.textPrimary};
          margin: 0 0 20px 0;
          line-height: 1.3;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        ">${title}</h1>
        
        <div style="flex: 1; display: flex; gap: 30px;">
          <div style="flex: 1; display: flex; flex-direction: column; overflow: hidden;">
            <div style="
              flex: 1;
              font-size: 18px;
              line-height: 1.8;
              color: ${colors.textSecondary};
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              white-space: pre-wrap;
              overflow: visible;
            ">${content}</div>
          </div>
          
          ${hasImage && hasContent ? `
            <div style="width: 280px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
              <img 
                src="${effectiveImageUrl}" 
                alt="${title}"
                style="
                  max-width: 100%;
                  max-height: 350px;
                  border-radius: 12px;
                  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
                  object-fit: cover;
                "
                onerror="this.style.display='none'"
              />
            </div>
          ` : ''}
        </div>
        
        ${pageNumbers ? `
          <div style="
            margin-top: 20px;
            text-align: right;
            font-size: 14px;
            color: ${colors.textSecondary};
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          ">${slideIndex} / ${totalSlides}</div>
        ` : ''}
      </div>
    </div>
  `
}

function generateFullHtml(
  slides: ExportSlide[],
  options: ExportOptions,
  _templateId?: string
): string {
  const colors = getTemplateColors(_templateId)
  const totalSlides = slides.length

  const slidesHtml = slides
    .sort((a, b) => a.index - b.index)
    .map((slide) => generateSlideHtml(slide, options, colors, slide.index + 1, totalSlides))
    .join('')

  return `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>PPT Export</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        html, body {
          width: 100%;
          height: 100%;
        }
        
        @page {
          margin: 0;
          size: ${getPageSizeCss(options.pageSize)};
        }
        
        .slide {
          width: 100%;
          height: 100vh;
        }
        
        @media print {
          .slide {
            page-break-after: always;
          }
        }
      </style>
    </head>
    <body>
      ${slidesHtml}
    </body>
    </html>
  `
}

function getPageSizeCss(pageSize: PageSize): string {
  switch (pageSize) {
    case 'A4':
      return 'A4'
    case 'Letter':
      return 'Letter'
    case 'Legal':
      return 'Legal'
    case '16:9':
      return '1920px 1080px'
    case '4:3':
      return '1024px 768px'
    default:
      return 'A4'
  }
}

interface GeneratePdfResult {
  fileName: string
  filePath: string
  fileSize: number
  totalPages: number
  downloadUrl: string
}

async function generatePdfWithPuppeteer(
  slides: ExportSlide[],
  options: ExportOptions,
  templateId?: string
): Promise<GeneratePdfResult> {
  let puppeteer: typeof import('puppeteer')
  
  try {
    puppeteer = await import('puppeteer')
  } catch {
    throw new Error('Puppeteer 未安装，请运行 npm install puppeteer')
  }

  const html = generateFullHtml(slides, options, templateId)
  const pageSizeConfig = PAGE_SIZES[options.pageSize]
  const qualityConfig = QUALITY_OPTIONS[options.quality]

  ensureTempDir()
  const fileName = generateFileName()
  const filePath = path.join(config.tempDir, fileName)

  const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || undefined
  const timeout = parseInt(process.env.PDF_EXPORT_TIMEOUT || '30000', 10)

  const browser = await puppeteer.launch({
    headless: true,
    executablePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    const page = await browser.newPage()
    
    await page.setContent(html, {
      waitUntil: 'networkidle0',
      timeout,
    })

    const pdfOptions: Parameters<typeof page.pdf>[0] = {
      path: filePath,
      printBackground: qualityConfig.printBackground,
      scale: qualityConfig.scale,
      margin: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
    }

    if (pageSizeConfig.format) {
      pdfOptions.format = pageSizeConfig.format
    } else if (pageSizeConfig.width && pageSizeConfig.height) {
      pdfOptions.width = pageSizeConfig.width
      pdfOptions.height = pageSizeConfig.height
    }

    await page.pdf(pdfOptions)

    const stats = fs.statSync(filePath)
    const downloadUrl = `${config.apiPrefix}/export/download/${fileName}`

    return {
      fileName,
      filePath,
      fileSize: stats.size,
      totalPages: slides.length,
      downloadUrl,
    }
  } finally {
    await browser.close()
  }
}

async function generatePdfSimple(
  slides: ExportSlide[],
  options: ExportOptions,
  templateId?: string
): Promise<GeneratePdfResult> {
  const html = generateFullHtml(slides, options, templateId)
  
  ensureTempDir()
  const fileName = generateFileName().replace('.pdf', '.html')
  const filePath = path.join(config.tempDir, fileName)

  fs.writeFileSync(filePath, html, 'utf-8')

  const stats = fs.statSync(filePath)
  const downloadUrl = `${config.apiPrefix}/export/download/${fileName}`

  return {
    fileName,
    filePath,
    fileSize: stats.size,
    totalPages: slides.length,
    downloadUrl,
  }
}

export async function generatePdf(
  slides: ExportSlide[],
  options: ExportOptions,
  templateId?: string
): Promise<PdfExportResult> {
  if (!slides || slides.length === 0) {
    return {
      success: false,
      error: '幻灯片列表不能为空',
    }
  }

  try {
    let result: GeneratePdfResult
    
    try {
      result = await generatePdfWithPuppeteer(slides, options, templateId)
    } catch (error) {
      console.warn('Puppeteer 不可用，使用简单 HTML 导出:', error instanceof Error ? error.message : error)
      result = await generatePdfSimple(slides, options, templateId)
    }

    return {
      success: true,
      fileName: result.fileName,
      fileSize: result.fileSize,
      totalPages: result.totalPages,
      downloadUrl: result.downloadUrl,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'PDF 生成失败'
    return {
      success: false,
      error: errorMessage,
    }
  }
}

export function getDownloadFilePath(fileName: string): string | null {
  const filePath = path.join(config.tempDir, fileName)
  
  if (fs.existsSync(filePath)) {
    return filePath
  }
  
  return null
}

export function cleanupOldFiles(maxAgeMs: number = 3600000): void {
  if (!fs.existsSync(config.tempDir)) {
    return
  }

  const files = fs.readdirSync(config.tempDir)
  const now = Date.now()

  files.forEach((file) => {
    const filePath = path.join(config.tempDir, file)
    try {
      const stats = fs.statSync(filePath)
      if (now - stats.mtimeMs > maxAgeMs) {
        fs.unlinkSync(filePath)
        console.log(`已清理过期文件: ${file}`)
      }
    } catch (error) {
      console.error(`清理文件失败 ${file}:`, error)
    }
  })
}
