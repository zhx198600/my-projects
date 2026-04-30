export interface HealthResponse {
  status: string
  timestamp: string
  uptime: number
  environment: string
  version: string
}

export interface ApiError {
  message: string
  code?: string
  details?: Record<string, unknown>
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: ApiError
}

export interface ContentInput {
  type: 'file' | 'text'
  fileName?: string
  fileSize?: number
  text?: string
}

export interface UploadState {
  isDragging: boolean
  isUploading: boolean
  progress: number
  error: string | null
}

export interface ContentPreview {
  originalContent: string
  wordCount: number
  lineCount: number
  preview: string
}

export interface UploadResponse {
  success: boolean
  message: string
  content: string
  wordCount: number
  lineCount: number
}

export interface SlideContent {
  id: string
  index: number
  title: string
  content: string
  keywords: string[]
  wordCount: number
  type: 'title' | 'content' | 'list' | 'image-text'
}

export interface PaginationResult {
  originalContent: string
  contentHash: string
  slides: SlideContent[]
  totalSlides: number
  totalWords: number
  totalLines: number
}

export type ImageStyle = 'business' | 'creative' | 'academic' | 'minimal'

export type ImageSize = 'square' | 'landscape' | 'portrait'

export interface ImageGenerationRequest {
  prompt: string
  keywords: string[]
  slideTitle: string
  slideContent: string
  style?: ImageStyle
  size?: ImageSize
}

export interface GeneratedImage {
  id: string
  url: string
  prompt: string
  style: string
  createdAt: string
  isPlaceholder: boolean
}

export interface ImageGenerationResult {
  success: boolean
  images: GeneratedImage[]
  error?: string
}

export interface GenerateImageForSlideRequest {
  slideTitle: string
  slideContent: string
  keywords: string[]
  style?: ImageStyle
  size?: ImageSize
  count?: number
}

export type PageSize = 'A4' | 'Letter' | 'Legal' | '16:9' | '4:3'

export interface ExportOptions {
  pageSize: PageSize
  quality: 'low' | 'medium' | 'high'
  includeImages: boolean
  pageNumbers: boolean
}

export interface PdfExportResult {
  success: boolean
  fileName?: string
  fileSize?: number
  totalPages?: number
  downloadUrl?: string
  error?: string
}

export interface ExportSlide {
  index: number
  title: string
  content: string
  keywords: string[]
  imageUrl?: string
}

export interface ExportRequest {
  slides: ExportSlide[]
  options: ExportOptions
  templateId?: string
}

export type {
  ColorScheme,
  FontSpec,
  TemplateFonts,
  TemplateLayout,
  Template
} from './templates'
