# PPT智能生成系统

一个智能PPT生成系统，用户可通过上传Word文档或直接输入文本内容，系统将自动分析内容结构、智能排版、自动生成匹配的精美插图，最终生成可在线预览和导出为PDF格式的演示文稿。

## 核心原则

**不修改用户原始文字内容，仅调整排版布局**

## 技术栈

### 前端
- React 18
- TypeScript
- Vite
- Tailwind CSS

### 后端
- Node.js
- Express
- TypeScript

### 代码规范
- ESLint
- Prettier

## 项目结构

```
project20/
├── client/                    # 前端React项目
│   ├── src/
│   │   ├── components/       # React组件
│   │   ├── contexts/         # Context API
│   │   ├── hooks/            # 自定义Hooks
│   │   ├── services/         # API服务
│   │   ├── types/            # TypeScript类型
│   │   ├── utils/            # 工具函数
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── .eslintrc.cjs
│   └── .prettierrc
│
├── server/                    # 后端Node.js项目
│   ├── src/
│   │   ├── controllers/      # 控制器
│   │   ├── routes/           # 路由
│   │   ├── middleware/       # 中间件
│   │   ├── services/         # 业务逻辑
│   │   ├── types/            # TypeScript类型
│   │   ├── utils/            # 工具函数
│   │   ├── config/           # 配置
│   │   └── index.ts          # 入口文件
│   ├── uploads/              # 上传文件目录
│   ├── temp/                 # 临时文件目录
│   ├── package.json
│   ├── tsconfig.json
│   ├── .eslintrc.js
│   └── .prettierrc
│
├── .gitignore
└── README.md
```

## 快速开始

### 环境要求
- Node.js >= 18.0.0
- npm 或 pnpm

### 安装依赖

```bash
# 安装前端依赖
cd client
npm install

# 安装后端依赖
cd ../server
npm install
```

### 启动开发服务器

```bash
# 启动后端 (端口 3001)
cd server
npm run dev

# 启动前端 (端口 5173)
cd client
npm run dev
```

### 访问应用
- 前端: http://localhost:5173
- 后端: http://localhost:3001
- 健康检查: http://localhost:3001/health
- API健康检查: http://localhost:3001/api/health

## 功能特性

### 已实现
- [x] 前后端项目基础架构
- [x] TypeScript 配置
- [x] ESLint + Prettier 代码规范
- [x] 健康检查接口
- [x] CORS 中间件
- [x] 错误处理中间件
- [x] 前端API服务模块
- [x] 前端代理配置

### 待实现
- [ ] Word文档上传与解析
- [ ] 内容分析与智能分页
- [ ] 排版布局引擎
- [ ] AI插图生成
- [ ] 在线预览功能
- [ ] PDF导出功能

## API 接口

### 健康检查
- `GET /health` - 服务健康检查
- `GET /api/health` - API健康检查

## 开发指南

### 代码规范
- 使用 TypeScript 严格模式
- 遵循 ESLint + Prettier 配置
- 组件使用 PascalCase 命名
- 文件使用 kebab-case 命名

### 环境变量

#### 前端 (client/.env)
```
VITE_API_URL=/api
VITE_APP_TITLE=PPT智能生成系统
```

#### 后端 (server/.env)
```
NODE_ENV=development
PORT=3001
API_PREFIX=/api
CORS_ORIGIN=http://localhost:5173
UPLOAD_DIR=./uploads
TEMP_DIR=./temp
```

## 许可证

MIT License
