import cors from 'cors'
import { Express, json, urlencoded } from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import config from '../config'

export const configureMiddleware = (app: Express): void => {
  app.use(helmet())

  app.use(
    cors({
      origin: config.corsOrigin,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  )

  app.use(json({ limit: '10mb' }))
  app.use(urlencoded({ extended: true, limit: '10mb' }))

  if (!config.isProduction) {
    app.use(morgan('dev'))
  }
}
