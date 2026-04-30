import type {
  ApiResponse,
  HealthResponse,
  UploadResponse,
  PaginationResult,
  ImageGenerationRequest,
  ImageGenerationResult,
  GenerateImageForSlideRequest,
  ExportRequest,
  PdfExportResult,
} from '../types'

const API_BASE_URL = '/api'

class ApiService {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: {
            message: data.message || `请求失败: ${response.status}`,
            code: data.code,
          },
        }
      }

      return {
        success: true,
        data,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '网络错误'
      return {
        success: false,
        error: {
          message: errorMessage,
          code: 'NETWORK_ERROR',
        },
      }
    }
  }

  async getHealth(): Promise<HealthResponse> {
    const response = await this.request<HealthResponse>('/health')
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || '健康检查失败')
    }
    return response.data
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  async put<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  async uploadFile(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<UploadResponse>> {
    return new Promise((resolve) => {
      const formData = new FormData()
      formData.append('file', file)

      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100)
          onProgress(progress)
        }
      })

      xhr.addEventListener('load', () => {
        try {
          const response = JSON.parse(xhr.responseText)
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve({
              success: true,
              data: response,
            })
          } else {
            resolve({
              success: false,
              error: {
                message: response.message || `上传失败: ${xhr.status}`,
                code: 'UPLOAD_ERROR',
              },
            })
          }
        } catch {
          resolve({
            success: false,
            error: {
              message: '响应解析失败',
              code: 'PARSE_ERROR',
            },
          })
        }
      })

      xhr.addEventListener('error', () => {
        resolve({
          success: false,
          error: {
            message: '网络错误，请检查网络连接',
            code: 'NETWORK_ERROR',
          },
        })
      })

      xhr.addEventListener('abort', () => {
        resolve({
          success: false,
          error: {
            message: '上传已取消',
            code: 'UPLOAD_ABORTED',
          },
        })
      })

      xhr.open('POST', `${this.baseUrl}/upload`)
      xhr.send(formData)
    })
  }

  async parseText(text: string): Promise<ApiResponse<UploadResponse>> {
    return this.post<UploadResponse>('/parse-text', { text })
  }

  async paginateContent(content: string): Promise<ApiResponse<PaginationResult>> {
    return this.post<PaginationResult>('/paginate', { content })
  }

  async generateImage(
    request: ImageGenerationRequest
  ): Promise<ApiResponse<ImageGenerationResult>> {
    return this.post<ImageGenerationResult>('/images/generate', request)
  }

  async generateImageForSlide(
    request: GenerateImageForSlideRequest
  ): Promise<ApiResponse<ImageGenerationResult>> {
    return this.post<ImageGenerationResult>('/images/generate-for-slide', request)
  }

  async exportToPdf(request: ExportRequest): Promise<ApiResponse<PdfExportResult>> {
    return this.post<PdfExportResult>('/export/pdf', request)
  }

  async exportToPptx(
    request: ExportRequest & { title?: string }
  ): Promise<ApiResponse<Blob>> {
    try {
      const response = await fetch(`${this.baseUrl}/export/pptx`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        let errorMessage = `导出失败: ${response.status}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorMessage
        } catch {
          // ignore
        }
        return {
          success: false,
          error: {
            message: errorMessage,
            code: 'EXPORT_ERROR',
          },
        }
      }

      const blob = await response.blob()
      return {
        success: true,
        data: blob,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '网络错误'
      return {
        success: false,
        error: {
          message: errorMessage,
          code: 'NETWORK_ERROR',
        },
      }
    }
  }
}

export const apiService = new ApiService()
