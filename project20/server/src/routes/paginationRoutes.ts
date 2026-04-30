import { Router } from 'express'
import { paginateText } from '../controllers/paginationController'

const router = Router()

router.post('/paginate', paginateText)

export default router
