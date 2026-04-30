import express from 'express'
import config from './config'
import { configureMiddleware } from './middleware'
import { configureRoutes } from './routes'
import { errorHandler, notFoundHandler } from './middleware/errorHandler'
import fs from 'fs'
import path from 'path'

const app = express()

configureMiddleware(app)

configureRoutes(app)

app.use(notFoundHandler)
app.use(errorHandler)

const ensureDirectories = (): void => {
  const dirs = [config.uploadDir, config.tempDir]

  for (const dir of dirs) {
    const fullPath = path.resolve(dir)
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true })
      console.log(`Created directory: ${fullPath}`)
    }
  }
}

const startServer = (): void => {
  ensureDirectories()

  app.listen(config.port, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                               ║
║   🚀 PPT智能生成系统 - 后端服务已启动                          ║
║                                                               ║
║   🌐 环境: ${config.env.padEnd(51)}║
║   📡 端口: ${String(config.port).padEnd(50)}║
║   🔗 API: http://localhost:${config.port}${config.apiPrefix}               ║
║   ❤️  健康检查: http://localhost:${config.port}/health                      ║
║                                                               ║
╚═══════════════════════════════════════════════════════════╝
    `)
  })
}

startServer()
