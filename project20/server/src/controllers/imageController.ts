import { Request, Response, NextFunction } from 'express'
import { AppError } from '../middleware/errorHandler'
import {
  getImageGenerator,
  buildImageGenerationRequest,
  PlaceholderImageGenerator,
} from '../services/imageService'
import {
  ImageGenerationRequest,
  GenerateImageForSlideRequest,
  ImageGenerationResult,
} from '../types'

export const generateImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { prompt, keywords, slideTitle, slideContent, style, size } = req.body as Partial<
      ImageGenerationRequest
    >

    if (!prompt && !slideTitle) {
      return next(
        new AppError('请提供 prompt 或 slideTitle', 400, {
          code: 'MISSING_PARAMETER',
        })
      )
    }

    const request: ImageGenerationRequest = {
      prompt: prompt || slideTitle || '',
      keywords: keywords || [],
      slideTitle: slideTitle || prompt || '',
      slideContent: slideContent || '',
      style,
      size,
    }

    const generator = getImageGenerator()

    if (!generator.isAvailable()) {
      return next(
        new AppError('图像生成服务当前不可用', 503, {
          code: 'SERVICE_UNAVAILABLE',
        })
      )
    }

    const result = await generator.generate(request)

    if (!result.success) {
      return next(
        new AppError(result.error || '图像生成失败', 500, {
          code: 'GENERATION_ERROR',
        })
      )
    }

    res.status(200).json(result)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '图像生成失败'
    return next(
      new AppError(errorMessage, 500, {
        code: 'GENERATION_ERROR',
      })
    )
  }
}

export const generateImageForSlide = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { slideTitle, slideContent, keywords, style, size, count } = req.body as Partial<
      GenerateImageForSlideRequest
    >

    if (!slideTitle) {
      return next(
        new AppError('请提供 slideTitle', 400, {
          code: 'MISSING_PARAMETER',
        })
      )
    }

    const request = buildImageGenerationRequest(
      slideTitle,
      slideContent || '',
      keywords || [],
      style,
      size
    )

    const imageCount = Math.max(1, Math.min(count || 1, 5))

    const generator = getImageGenerator()

    if (!generator.isAvailable()) {
      return next(
        new AppError('图像生成服务当前不可用', 503, {
          code: 'SERVICE_UNAVAILABLE',
        })
      )
    }

    let result: ImageGenerationResult

    if (generator instanceof PlaceholderImageGenerator) {
      result = await generator.generateMultiple(request, imageCount)
    } else {
      const results: ImageGenerationResult[] = []
      for (let i = 0; i < imageCount; i++) {
        const singleResult = await generator.generate({
          ...request,
          prompt: `${request.prompt} variant ${i + 1}`,
        })
        results.push(singleResult)
      }
      result = {
        success: results.every(r => r.success),
        images: results.flatMap(r => r.images),
        error: results.find(r => r.error)?.error,
      }
    }

    if (!result.success) {
      return next(
        new AppError(result.error || '图像生成失败', 500, {
          code: 'GENERATION_ERROR',
        })
      )
    }

    res.status(200).json(result)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '图像生成失败'
    return next(
      new AppError(errorMessage, 500, {
        code: 'GENERATION_ERROR',
      })
    )
  }
}
