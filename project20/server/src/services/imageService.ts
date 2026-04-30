import crypto from 'crypto'
import {
  ImageGenerationRequest,
  ImageGenerationResult,
  GeneratedImage,
  ImageStyle,
} from '../types'

const generateId = (): string => {
  return crypto.randomUUID()
}

const IMAGE_BASE_URL = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image'

export interface ImageGenerator {
  generate(request: ImageGenerationRequest): Promise<ImageGenerationResult>
  isAvailable(): boolean
}

const STYLE_MODIFIERS: Record<ImageStyle, string> = {
  business: 'professional business, corporate style, clean modern design, office atmosphere',
  creative: 'creative design, colorful, innovative, artistic presentation',
  academic: 'academic professional, research style, educational, formal presentation',
  minimal: 'minimalist design, clean simple, elegant, professional',
}

const buildPrompt = (request: ImageGenerationRequest): string => {
  const { keywords, slideTitle, style, slideContent } = request

  let basePrompt = slideTitle
  if (keywords.length > 0) {
    basePrompt += ', ' + keywords.join(', ')
  }

  if (slideContent && slideContent.trim().length > 0) {
    const contentPreview = slideContent.substring(0, 100)
    if (contentPreview.length > 0) {
      basePrompt += ', ' + contentPreview
    }
  }

  const effectiveStyle = style || 'business'
  const styleModifier = STYLE_MODIFIERS[effectiveStyle]

  return `${basePrompt}, ${styleModifier}, high quality, detailed illustration`
}

class PlaceholderImageGenerator implements ImageGenerator {
  private readonly imageSizeMap: Record<string, string> = {
    square: 'square_hd',
    landscape: 'landscape_16_9',
    portrait: 'portrait_4_3',
  }

  isAvailable(): boolean {
    return true
  }

  async generate(request: ImageGenerationRequest): Promise<ImageGenerationResult> {
    try {
      const prompt = buildPrompt(request)
      const imageSize = this.imageSizeMap[request.size || 'square'] || 'square_hd'
      const encodedPrompt = encodeURIComponent(prompt)

      const imageUrl = `${IMAGE_BASE_URL}?prompt=${encodedPrompt}&image_size=${imageSize}`

      const image: GeneratedImage = {
        id: generateId(),
        url: imageUrl,
        prompt,
        style: request.style || 'business',
        createdAt: new Date().toISOString(),
        isPlaceholder: true,
      }

      return {
        success: true,
        images: [image],
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '图像生成失败'
      return {
        success: false,
        images: [],
        error: errorMessage,
      }
    }
  }

  async generateMultiple(
    request: ImageGenerationRequest,
    count: number
  ): Promise<ImageGenerationResult> {
    const results: GeneratedImage[] = []
    const effectiveCount = Math.max(1, Math.min(count, 5))

    for (let i = 0; i < effectiveCount; i++) {
      const result = await this.generate({
        ...request,
        prompt: `${request.prompt} variant ${i + 1}`,
      })
      if (result.success && result.images.length > 0) {
        results.push(result.images[0])
      }
    }

    if (results.length === 0) {
      return {
        success: false,
        images: [],
        error: '生成图像失败',
      }
    }

    return {
      success: true,
      images: results,
    }
  }
}

const placeholderGenerator = new PlaceholderImageGenerator()

export const getImageGenerator = (): ImageGenerator => {
  const generatorType = process.env.IMAGE_GENERATOR || 'placeholder'

  switch (generatorType) {
    case 'placeholder':
    default:
      return placeholderGenerator
  }
}

export const buildImageGenerationRequest = (
  slideTitle: string,
  slideContent: string,
  keywords: string[],
  style?: ImageStyle,
  size?: string
): ImageGenerationRequest => {
  return {
    prompt: slideTitle,
    keywords,
    slideTitle,
    slideContent,
    style,
    size: size as ImageGenerationRequest['size'],
  }
}

export { PlaceholderImageGenerator }
