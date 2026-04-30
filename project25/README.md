# 论坛社区系统

一个基于 React + TypeScript + Node.js + Express + MongoDB 的全栈论坛系统。

## ✨ 功能特性

### 用户功能
- 🔐 用户注册/登录
- 📝 发布帖子（支持 Markdown 编辑）
- 📂 按分类浏览帖子
- 💬 发布评论、回复评论、删除自己的评论
- 🛡️ Markdown 渲染与 XSS 防护
- 🔍 敏感词自动检测

### 管理员功能
- 🔑 管理员登录
- 🗑️ 删除违规帖子/评论
- ⛔ 禁止帖子评论功能
- 🔒 敏感词管理（添加/删除）

## 🚀 快速开始

### 环境要求

- Node.js >= 18.x
- MongoDB >= 6.x
- npm >= 9.x

### 1. 启动 MongoDB

#### 方式一：本地安装 MongoDB (推荐)

**macOS:**
```bash
# 使用 Homebrew 安装
brew tap mongodb/brew
brew install mongodb-community

# 启动 MongoDB 服务
brew services start mongodb-community

# 验证启动
mongosh --eval "db.version()"
```

**Windows:**
1. 下载 [MongoDB Community Server](https://www.mongodb.com/try/download/community)
2. 安装并选择 "Run MongoDB as a service"

**Linux:**
```bash
# Ubuntu/Debian
sudo apt install mongodb
sudo systemctl start mongodb
```

#### 方式二：使用 Docker

```bash
# 启动 MongoDB 容器
docker run -d \
  --name forum-mongodb \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  mongo:latest
```

### 2. 初始化数据库（创建管理员和默认敏感词）

```bash
cd server

# 安装依赖（如果尚未安装）
npm install

# 构建项目
npm run build

# 初始化数据库（创建管理员账号和默认敏感词）
npm run init-db
```

**默认管理员账号：**
- 用户名：`admin`
- 密码：`admin123`
- 邮箱：`admin@forum.com`

### 3. 启动后端服务

```bash
cd server

# 开发模式（带热重载）
npm run dev

# 或生产模式
npm run build && npm start
```

后端服务将运行在 `http://localhost:5000`

**健康检查：** `http://localhost:5000/api/health`

### 4. 启动前端服务

```bash
cd client

# 安装依赖（如果尚未安装）
npm install

# 启动开发服务器
npm run dev
```

前端服务将运行在 `http://localhost:5173`

## 📁 项目结构

```
project25/
├── client/                 # 前端 React 应用
│   ├── src/
│   │   ├── components/    # 公共组件
│   │   ├── pages/         # 页面组件
│   │   │   ├── admin/     # 管理后台页面
│   │   └── utils/         # 工具函数
│   ├── package.json
│   └── vite.config.ts
├── server/                 # 后端 Express API
│   ├── src/
│   │   ├── config/        # 配置文件
│   │   ├── controllers/   # 控制器
│   │   ├── middleware/    # 中间件
│   │   ├── models/        # MongoDB 数据模型
│   │   ├── routes/        # API 路由
│   │   ├── scripts/       # 脚本（数据库初始化）
│   │   └── utils/         # 工具函数
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## 🔌 API 接口

### 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/admin/login` - 管理员登录
- `GET /api/auth/me` - 获取当前用户信息

### 帖子接口
- `GET /api/posts` - 获取帖子列表（支持分类筛选）
- `GET /api/posts/:id` - 获取帖子详情
- `POST /api/posts` - 发布帖子（需登录）
- `GET /api/posts/:id/comments` - 获取评论列表
- `POST /api/posts/:id/comments` - 发布评论（需登录）
- `DELETE /api/posts/:id/comments/:commentId` - 删除评论（需作者权限）

### 管理员接口（需管理员权限）
- `DELETE /api/admin/posts/:id` - 删除帖子
- `DELETE /api/admin/comments/:id` - 删除评论
- `PATCH /api/admin/posts/:id/comments-status` - 开启/关闭帖子评论
- `GET /api/admin/posts` - 获取所有帖子列表
- `GET /api/admin/comments` - 获取所有评论列表
- `GET /api/admin/sensitive-words` - 获取敏感词列表
- `POST /api/admin/sensitive-words` - 添加敏感词
- `DELETE /api/admin/sensitive-words/:id` - 删除敏感词

## 🛡️ 安全特性

### XSS 防护
- 使用 `DOMPurify` 净化用户输入内容
- 使用 `rehype-sanitize` 在 Markdown 渲染时进行安全过滤
- 禁用危险的 HTML 标签和属性

### 敏感词检测
- 使用 DFA 算法构建敏感词树
- 发布帖子和评论时自动检测敏感词
- 支持管理员动态添加/删除敏感词，实时生效

### 认证授权
- 使用 JWT (JSON Web Token) 进行身份认证
- 密码使用 bcrypt 加密存储
- 中间件验证用户权限和管理员权限

## 📱 响应式设计

- ✅ 移动端导航栏（汉堡菜单）
- ✅ 帖子列表适配小屏幕
- ✅ 评论区适配
- ✅ 后台管理侧边栏响应式
- ✅ 表单和模态框适配

## 🔧 开发命令

### 后端命令
```bash
cd server
npm run dev          # 开发模式
npm run build        # 构建
npm start            # 生产模式启动
npm run lint         # ESLint 检查
npm run format       # Prettier 格式化
npm run init-db      # 初始化数据库
```

### 前端命令
```bash
cd client
npm run dev          # 开发模式
npm run build        # 构建
npm run lint         # ESLint 检查
npm run format       # Prettier 格式化
npm run preview      # 预览构建结果
```

## 🎯 核心技术栈

**前端：**
- React 19 + TypeScript
- Vite 构建工具
- React Router 路由
- React Markdown (Markdown 渲染)
- DOMPurify (XSS 防护)
- Rehype Sanitize

**后端：**
- Node.js + Express
- TypeScript
- MongoDB + Mongoose ODM
- JWT 认证
- bcrypt 密码加密
- CORS 跨域处理

## 📝 默认敏感词

系统初始化时会自动添加以下敏感词：
- 暴力
- 色情
- 赌博
- 毒品

管理员可以在后台添加更多敏感词。

## 🐛 常见问题

**Q: MongoDB 连接失败怎么办？**
- 确认 MongoDB 服务已启动
- 检查端口 27017 是否被占用
- 可以在 `server/.env` 中自定义 `MONGODB_URI`

**Q: 管理员账号无法登录？**
- 确认运行了 `npm run init-db` 创建了管理员账号
- 默认账号密码：admin / admin123
- 检查数据库中是否存在 user 集合

**Q: 前端请求后端出现 CORS 错误？**
- 确认后端服务运行在 5000 端口
- 前端 API_BASE 配置是否正确
- 后端已配置 CORS 中间件允许跨域

## 📄 License

MIT License
