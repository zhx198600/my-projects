import { Request, Response, NextFunction } from 'express'
import { parseWordDocument, cleanupFile, parseTextInput } from '../services/fileService'
import { AppError } from '../middleware/errorHandler'
import { WordParseResult } from '../types'

export const uploadFile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.file) {
    return next(
      new AppError('请选择要上传的文件', 400, {
        code: 'UPLOAD_ERROR',
      })
    )
  }

  const filePath = req.file.path
  const originalName = req.file.originalname
  const fileSize = req.file.size

  try {
    const result = await parseWordDocument(filePath, originalName, fileSize)

    if (!result.content || result.content.trim().length === 0) {
      cleanupFile(filePath)
      return next(
        new AppError('文档内容为空', 400, {
          code: 'EMPTY_CONTENT',
        })
      )
    }

    cleanupFile(filePath)

    res.status(200).json(result)
  } catch (error) {
    cleanupFile(filePath)
    const errorMessage = error instanceof Error ? error.message : '文档解析失败'
    return next(
      new AppError(errorMessage, 500, {
        code: 'PARSE_ERROR',
      })
    )
  }
}

export const parseText = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { content, text } = req.body

  const inputContent = content || text

  if (!inputContent || typeof inputContent !== 'string') {
    return next(
      new AppError('请提供要解析的文本内容', 400, {
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
    const result = parseTextInput(inputContent)

    res.status(200).json(result)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '文本解析失败'
    return next(
      new AppError(errorMessage, 500, {
        code: 'PARSE_ERROR',
      })
    )
  }
}
