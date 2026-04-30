import { Router } from 'express'
import { exportToPdf, downloadPdf, triggerCleanup, exportToPptx } from '../controllers/exportController'

const router = Router()

router.post('/export/pdf', exportToPdf)
router.post('/export/pptx', exportToPptx)
router.get('/export/download/:fileName', downloadPdf)
router.post('/export/cleanup', triggerCleanup)

export default router
