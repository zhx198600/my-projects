import { Express, Router } from 'express'
import config from '../config'
import healthRoutes from './healthRoutes'
import uploadRoutes from './uploadRoutes'
import paginationRoutes from './paginationRoutes'
import imageRoutes from './imageRoutes'
import exportRoutes from './exportRoutes'

const apiRouter = Router()

apiRouter.use('/', healthRoutes)
apiRouter.use('/', uploadRoutes)
apiRouter.use('/', paginationRoutes)
apiRouter.use('/images', imageRoutes)
apiRouter.use('/', exportRoutes)

export const configureRoutes = (app: Express): void => {
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    })
  })

  app.use(config.apiPrefix, apiRouter)
}
