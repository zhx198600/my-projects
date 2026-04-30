export interface HealthCheckResponse {
  status: 'ok'
  timestamp: string
  uptime: number
  environment: string
  version: string
}

export interface ApiErrorResponse {
  success: false
  error: {
    message: string
    code?: string
    details?: Record<string, unknown>
  }
}

export interface ApiSuccessResponse<T> {
  success: true
  data: T
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

export interface UploadResult {
  success: boolean
  message: string
  fileName: string
  originalName: string
  fileSize: number
  content: string
  wordCount: number
  lineCount: number
}

export interface ParseTextResult {
  success: boolean
  message: string
  content: string
  wordCount: number
  lineCount: number
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}

export interface WordParseResult {
  fileName: string
  originalName: string
  fileSize: number
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

export interface TextStructure {
  type: 'title' | 'heading1' | 'heading2' | 'heading3' | 'paragraph' | 'list-item' | 'empty'
  content: string
  level?: number
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

export interface DefaultColorScheme {
  primary: string
  primaryLight: string
  secondary: string
  accent: string
  background: string
  backgroundAlt: string
  backgroundDark: string
  textPrimary: string
  textSecondary: string
  textLight: string
  border: string
  success: string
  warning: string
  error: string
  overlay: string
}

export const DEFAULT_COLOR_SCHEME: DefaultColorScheme = {
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
}

export interface ExportOptions {
  pageSize: PageSize
  quality: 'low' | 'medium' | 'high'
  includeImages: boolean
  pageNumbers: boolean
  templateId?: string
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
