import { Request, Response, NextFunction } from 'express'
import { generatePdf, getDownloadFilePath, cleanupOldFiles } from '../services/pdfService'
import { exportToPptx as generatePptx } from '../services/pptService'
import { AppError } from '../middleware/errorHandler'
import { ExportRequest, PdfExportResult } from '../types'

export const exportToPdf = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { slides, options, templateId }: ExportRequest = req.body

  if (!slides || !Array.isArray(slides) || slides.length === 0) {
    return next(
      new AppError('请提供要导出的幻灯片列表', 400, {
        code: 'INVALID_REQUEST',
      })
    )
  }

  if (!options) {
    return next(
      new AppError('请提供导出选项', 400, {
        code: 'INVALID_REQUEST',
      })
    )
  }

  const validPageSizes: string[] = ['A4', 'Letter', 'Legal', '16:9', '4:3']
  const validQualities: string[] = ['low', 'medium', 'high']

  if (!validPageSizes.includes(options.pageSize)) {
    return next(
      new AppError(`无效的页面大小，有效值为: ${validPageSizes.join(', ')}`, 400, {
        code: 'INVALID_PAGE_SIZE',
      })
    )
  }

  if (!validQualities.includes(options.quality)) {
    return next(
      new AppError(`无效的质量选项，有效值为: ${validQualities.join(', ')}`, 400, {
        code: 'INVALID_QUALITY',
      })
    )
  }

  for (const slide of slides) {
    if (typeof slide.index !== 'number') {
      return next(
        new AppError('每个幻灯片必须包含数字类型的 index', 400, {
          code: 'INVALID_SLIDE',
        })
      )
    }
    if (!slide.title || typeof slide.title !== 'string') {
      return next(
        new AppError('每个幻灯片必须包含标题', 400, {
          code: 'INVALID_SLIDE',
        })
      )
    }
    if (!slide.content || typeof slide.content !== 'string') {
      return next(
        new AppError('每个幻灯片必须包含内容', 400, {
          code: 'INVALID_SLIDE',
        })
      )
    }
  }

  try {
    const result: PdfExportResult = await generatePdf(slides, options, templateId)

    if (!result.success) {
      return next(
        new AppError(result.error || 'PDF 生成失败', 500, {
          code: 'GENERATION_ERROR',
        })
      )
    }

    res.status(200).json(result)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'PDF 导出失败'
    return next(
      new AppError(errorMessage, 500, {
        code: 'EXPORT_ERROR',
      })
    )
  }
}

export const downloadPdf = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { fileName } = req.params

  if (!fileName) {
    return next(
      new AppError('请提供文件名', 400, {
        code: 'INVALID_REQUEST',
      })
    )
  }

  const allowedExtensions = ['.pdf', '.html']
  const hasValidExtension = allowedExtensions.some((ext) => fileName.endsWith(ext))

  if (!hasValidExtension) {
    return next(
      new AppError('无效的文件类型', 400, {
        code: 'INVALID_FILE_TYPE',
      })
    )
  }

  const filePath = getDownloadFilePath(fileName)

  if (!filePath) {
    return next(
      new AppError('文件不存在或已过期', 404, {
        code: 'FILE_NOT_FOUND',
      })
    )
  }

  res.download(filePath, fileName, (error) => {
    if (error) {
      next(
        new AppError('文件下载失败', 500, {
          code: 'DOWNLOAD_ERROR',
        })
      )
    }
  })
}

export const triggerCleanup = (
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  cleanupOldFiles()

  res.status(200).json({
    success: true,
    message: '已触发临时文件清理',
  })
}

export const exportToPptx = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { slides, options, title, templateId }: ExportRequest & { title?: string } = req.body

  if (!slides || !Array.isArray(slides) || slides.length === 0) {
    return next(
      new AppError('请提供要导出的幻灯片列表', 400, {
        code: 'INVALID_REQUEST',
      })
    )
  }

  if (!options) {
    return next(
      new AppError('请提供导出选项', 400, {
        code: 'INVALID_REQUEST',
      })
    )
  }

  for (const slide of slides) {
    if (typeof slide.index !== 'number') {
      return next(
        new AppError('每个幻灯片必须包含数字类型的 index', 400, {
          code: 'INVALID_SLIDE',
        })
      )
    }
    if (!slide.title || typeof slide.title !== 'string') {
      return next(
        new AppError('每个幻灯片必须包含标题', 400, {
          code: 'INVALID_SLIDE',
        })
      )
    }
    if (slide.content === undefined || slide.content === null) {
      return next(
        new AppError('每个幻灯片必须包含内容', 400, {
          code: 'INVALID_SLIDE',
        })
      )
    }
  }

  try {
    const effectiveOptions = {
      ...options,
      templateId: templateId || 'business',
    }

    const pptBuffer = await generatePptx(slides, effectiveOptions, title || 'Presentation')

    const fileName = `presentation_${Date.now()}.pptx`

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation')
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
    res.setHeader('Content-Length', pptBuffer.length)

    res.status(200).send(pptBuffer)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'PPT 导出失败'
    return next(
      new AppError(errorMessage, 500, {
        code: 'EXPORT_ERROR',
      })
    )
  }
}
