import { Router } from 'express'
import { generateImage, generateImageForSlide } from '../controllers/imageController'

const router = Router()

router.post('/generate', generateImage)

router.post('/generate-for-slide', generateImageForSlide)

export default router
