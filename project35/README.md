# 财务预算管理系统

基于前后端分离架构的财务预算管理系统，使用 FastAPI + React + TypeScript + Ant Design + SQLite 技术栈开发。

## 技术栈

### 后端
- **Python 3.10+**
- **FastAPI** - 现代化的 Python Web 框架
- **SQLAlchemy** - ORM 框架
- **SQLite** - 关系型数据库
- **Pydantic** - 数据验证

### 前端
- **React 18**
- **TypeScript**
- **Ant Design** - UI 组件库
- **Vite** - 构建工具
- **Axios** - HTTP 客户端

## 项目结构

```
project35/
├── backend/                 # 后端项目
│   ├── app/
│   │   ├── api/            # API 路由
│   │   ├── models/         # 数据模型
│   │   ├── schemas/        # Pydantic 模式
│   │   ├── services/       # 业务逻辑
│   │   └── core/           # 核心配置（数据库、配置等）
│   ├── requirements.txt    # Python 依赖
│   ├── pyproject.toml      # 项目配置
│   └── .env               # 环境变量
└── frontend/               # 前端项目
    ├── src/
    │   ├── components/     # React 组件
    │   ├── pages/         # 页面组件
    │   ├── services/      # API 服务
    │   ├── types/         # TypeScript 类型
    │   └── utils/         # 工具函数
    ├── package.json
    ├── tsconfig.json
    └── vite.config.ts
```

## 数据库设计

系统包含以下核心数据表：

1. **users** - 用户表
2. **roles** - 角色表
3. **user_roles** - 用户角色关联表
4. **departments** - 部门表
5. **subjects** - 科目表
6. **budget_periods** - 预算期间表
7. **budget_templates** - 预算模板表
8. **budget_data** - 预算数据表
9. **approval_records** - 审批记录表
10. **expense_applications** - 费用申请表
11. **reimbursements** - 报销单表

## 快速开始

### 后端启动

1. 进入后端目录：
```bash
cd backend
```

2. 安装依赖：
```bash
pip install -r requirements.txt
# 或使用 poetry
# poetry install
```

3. 启动服务：
```bash
python -m uvicorn app.main:app --reload --port 8000
```

后端服务将在 http://localhost:8000 启动

API 文档地址：http://localhost:8000/docs

### 前端启动

1. 进入前端目录：
```bash
cd frontend
```

2. 安装依赖：
```bash
npm install
```

3. 启动开发服务器：
```bash
npm run dev
```

前端服务将在 http://localhost:3000 启动

## API 接口

### 健康检查
- `GET /api/health` - 系统健康状态
- `GET /api/health/db` - 数据库连接状态

### 部门管理
- `GET /api/departments` - 获取部门列表
- `GET /api/departments/{id}` - 获取部门详情
- `POST /api/departments` - 创建部门
- `PUT /api/departments/{id}` - 更新部门
- `DELETE /api/departments/{id}` - 删除部门

## 开发说明

### 后端开发
- 遵循 FastAPI 最佳实践
- 使用 Pydantic 进行数据验证
- 使用 SQLAlchemy ORM 进行数据库操作
- 代码格式使用 black、isort、flake8

### 前端开发
- 使用 TypeScript 确保类型安全
- 使用 Ant Design 组件库
- 遵循 React Hooks 最佳实践
- 使用 Vite 作为构建工具

## 后续功能开发

1. **用户权限管理** - 用户登录、角色权限、JWT 认证
2. **预算编制模块** - 预算填报、模板管理
3. **预算审批流程** - 多级审批、审批记录
4. **预算执行控制** - 费用申请、报销管理、预算占用
5. **数据分析报表** - 预算执行分析、数据可视化
6. **系统管理** - 基础数据配置、操作日志
