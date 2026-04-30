import { Router } from 'express'
import { uploadFile, parseText } from '../controllers/uploadController'
import { uploadMiddleware } from '../middleware/uploadMiddleware'

const router = Router()

router.post('/upload', uploadMiddleware.single('file'), uploadFile)

router.post('/parse-text', parseText)

export default router
