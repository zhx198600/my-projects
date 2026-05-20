# 项目搭建完成

## 项目结构

```
project33/
├── apps/
│   ├── web/                 # Next.js 14 前端 (端口: 3000)
│   │   ├── src/app/         # App Router 页面
│   │   ├── next.config.js
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── server/              # NestJS 后端 (端口: 3001)
│       ├── src/
│       │   ├── main.ts
│       │   ├── app.module.ts
│       │   ├── prisma/      # Prisma 模块
│       │   └── user/        # 用户 CRUD 模块
│       ├── prisma/
│       │   └── schema.prisma
│       ├── nest-cli.json
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   └── shared/              # 共享类型包
│       ├── src/
│       │   ├── index.ts     # 导出类型
│       │   └── types.ts
│       ├── tsconfig.json
│       └── package.json
│
├── .eslintrc.js             # ESLint 配置
├── .prettierrc              # Prettier 配置
├── .gitignore
└── package.json
```

## 前置要求

1. **Node.js 18+**
2. **PostgreSQL 数据库**

## 安装步骤

### 1. 安装依赖
```bash
npm install
```

### 2. 配置数据库
编辑 `apps/server/.env` 文件，修改 PostgreSQL 连接信息：
```env
DATABASE_URL="postgresql://username:password@localhost:5432/project33_db?schema=public"
```

### 3. 初始化数据库
```bash
# 生成 Prisma Client
npm run prisma:generate

# 运行数据库迁移
npm run prisma:migrate:dev
```

### 4. 构建共享类型包
```bash
cd packages/shared
npm run build
```

## 启动项目

### 方式一：分别启动

**终端 1 - 后端 (NestJS):**
```bash
npm run dev:server
```

**终端 2 - 前端 (Next.js):**
```bash
npm run dev:web
```

### 方式二：并行启动
```bash
npm run dev
```

## 访问地址

- 前端: http://localhost:3000
- 后端 API: http://localhost:3001/api
- API 示例: http://localhost:3001/api/users

## 常用命令

```bash
# 代码格式化
npm run format

# 代码检查
npm run lint

# Prisma Studio (数据库可视化)
npm run prisma:studio

# 构建所有项目
npm run build
```

## 技术栈

- **前端**: Next.js 14 (App Router) + TypeScript
- **后端**: NestJS + TypeScript
- **ORM**: Prisma
- **数据库**: PostgreSQL
- **代码规范**: ESLint + Prettier
- **包管理**: npm workspaces (Monorepo)
