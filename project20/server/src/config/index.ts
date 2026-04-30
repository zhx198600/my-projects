import dotenv from 'dotenv'
import path from 'path'

dotenv.config()

interface Config {
  env: string
  port: number
  apiPrefix: string
  corsOrigin: string
  uploadDir: string
  tempDir: string
  isDevelopment: boolean
  isProduction: boolean
}

const config: Config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  apiPrefix: process.env.API_PREFIX || '/api',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  uploadDir: process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads'),
  tempDir: process.env.TEMP_DIR || path.join(__dirname, '../../temp'),
  get isDevelopment(): boolean {
    return this.env === 'development'
  },
  get isProduction(): boolean {
    return this.env === 'production'
  },
}

export default config
