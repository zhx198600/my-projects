import { Request, Response, NextFunction } from 'express'
import { ApiErrorResponse } from '../types'

export class AppError extends Error {
  public readonly statusCode: number
  public readonly code?: string
  public readonly details?: Record<string, unknown>
  public readonly isOperational: boolean

  constructor(
    message: string,
    statusCode: number = 500,
    options: { code?: string; details?: Record<string, unknown>; isOperational?: boolean } = {}
  ) {
    super(message)
    this.statusCode = statusCode
    this.code = options.code
    this.details = options.details
    this.isOperational = options.isOperational ?? true

    Error.captureStackTrace(this, this.constructor)
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  })

  const statusCode = err instanceof AppError ? err.statusCode : 500
  const message = err instanceof AppError ? err.message : 'Internal Server Error'

  const response: ApiErrorResponse = {
    success: false,
    error: {
      message,
      code: err instanceof AppError ? err.code : undefined,
      details: err instanceof AppError ? err.details : undefined,
    },
  }

  res.status(statusCode).json(response)
}

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  const error = new AppError(`Route not found: ${req.method} ${req.url}`, 404)
  next(error)
}
