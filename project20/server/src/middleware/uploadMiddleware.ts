import multer, { FileFilterCallback } from 'multer'
import { Request } from 'express'
import path from 'path'
import config from '../config'
import { AppError } from '../middleware/errorHandler'

const MAX_FILE_SIZE = 10 * 1024 * 1024
const ALLOWED_EXTENSIONS = ['.docx']
const ALLOWED_MIME_TYPES = [
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

const storage = multer.diskStorage({
  destination: (
    _req: Request,
    _file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    cb(null, config.tempDir)
  },
  filename: (
    _req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, `doc-${uniqueSuffix}${ext}`)
  },
})

const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase()
  const mimeType = file.mimetype.toLowerCase()

  const isExtensionAllowed = ALLOWED_EXTENSIONS.includes(ext)
  const isMimeTypeAllowed = ALLOWED_MIME_TYPES.includes(mimeType)

  if (isExtensionAllowed || isMimeTypeAllowed) {
    cb(null, true)
  } else {
    cb(
      new AppError('只支持 .docx 格式的 Word 文档。旧版 .doc 格式请先在 Word 中另存为 .docx 格式', 400, {
        code: 'INVALID_FILE_TYPE',
      })
    )
  }
}

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter,
})
