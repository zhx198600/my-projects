import { Request, Response, NextFunction } from 'express'
import { paginateContent, verifyPaginationResult } from '../services/contentService'
import { AppError } from '../middleware/errorHandler'
import { PaginationResult } from '../types'

export const paginateText = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { content, text } = req.body

  const inputContent = content || text

  if (!inputContent || typeof inputContent !== 'string') {
    return next(
      new AppError('请提供要分析的文本内容', 400, {
        code: 'EMPTY_CONTENT',
      })
    )
  }

  if (inputContent.trim().length === 0) {
    return next(
      new AppError('内容为空', 400, {
        code: 'EMPTY_CONTENT',
      })
    )
  }

  try {
    const result: PaginationResult = paginateContent(inputContent)

    const isVerified = verifyPaginationResult(result)
    if (!isVerified) {
      console.warn('分页结果完整性验证失败')
    }

    res.status(200).json(result)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '内容分析失败'
    return next(
      new AppError(errorMessage, 500, {
        code: 'PAGINATION_ERROR',
      })
    )
  }
}
