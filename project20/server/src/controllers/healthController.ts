import { Request, Response } from 'express'
import { HealthCheckResponse } from '../types'

const startTime = Date.now()

export const getHealth = (_req: Request, res: Response): void => {
  const uptime = (Date.now() - startTime) / 1000

  const response: HealthCheckResponse = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime,
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '0.0.0',
  }

  res.json(response)
}
