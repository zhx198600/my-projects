# 防晒衣销售数据可视化平台

一个功能完整的防晒衣销售数据可视化平台，支持数据导入、多维度分析和交互式图表展示。

## 项目简介

本项目是一个基于 Vue 3 + Express + SQLite 的全栈数据可视化应用，主要用于展示和分析防晒衣销售数据。平台提供了直观的数据导入界面、丰富的图表展示和灵活的筛选功能，帮助用户快速洞察销售趋势。

## 技术栈说明

### 前端
- **框架**: Vue 3 (Composition API)
- **路由**: Vue Router 5
- **图表库**: ECharts 6
- **HTTP 客户端**: Axios
- **构建工具**: Vite 8

### 后端
- **框架**: Express 5
- **数据库**: SQLite (sqlite + sqlite3)
- **文件上传**: Multer 2
- **CSV 解析**: csv-parser 3
- **跨域处理**: CORS

## 安装和运行步骤

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 后端启动

```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 启动服务器（默认端口 3000）
npm start
```

服务器启动后访问: http://localhost:3000

### 前端启动

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 启动开发服务器（默认端口 5173）
npm run dev
```

浏览器访问: http://localhost:5173

## API 接口说明

### 基础 URL
`http://localhost:3000/api`

### 接口列表

#### 1. 健康检查
```
GET /health
```
响应示例：
```json
{
  "status": "ok",
  "timestamp": "2024-05-25T12:00:00.000Z"
}
```

#### 2. 文件上传
```
POST /upload
Content-Type: multipart/form-data
```
请求参数：
- `file`: CSV 文件

响应示例：
```json
{
  "success": true,
  "total": 53,
  "successCount": 53,
  "failCount": 0,
  "message": "导入完成"
}
```

#### 3. 获取筛选选项
```
GET /filters/options
```
响应示例：
```json
{
  "regions": ["华东", "华北", "华南", "西南", "西北", "东北"],
  "products": ["冰丝防晒衣", "透气防晒服", "防紫外线外套", "儿童防晒衣"],
  "dateRange": {
    "minDate": "2024-03-05",
    "maxDate": "2024-08-25"
  }
}
```

#### 4. 统计概览
```
GET /stats/overview
```
查询参数（可选）：
- `startDate`: 开始日期 (YYYY-MM-DD)
- `endDate`: 结束日期 (YYYY-MM-DD)
- `regions`: 地区列表，逗号分隔
- `products`: 商品列表，逗号分隔

响应示例：
```json
{
  "totalAmount": 2856400,
  "orderCount": 53,
  "totalQuantity": 9850,
  "regionCount": 6,
  "productCount": 4
}
```

#### 5. 时间趋势统计
```
GET /stats/time
```
查询参数（可选）：
- `groupBy`: 分组方式，`day` 或 `month`，默认 `day`
- `startDate`: 开始日期
- `endDate`: 结束日期
- `regions`: 地区列表
- `products`: 商品列表

响应示例：
```json
[
  { "date": "2024-03-05", "amount": 35880 },
  { "date": "2024-03-08", "amount": 21250 }
]
```

#### 6. 地区销售统计
```
GET /stats/region
```
查询参数（可选）：
- `startDate`: 开始日期
- `endDate`: 结束日期
- `regions`: 地区列表
- `products`: 商品列表

响应示例：
```json
[
  { "region": "华东", "amount": 586400 },
  { "region": "华南", "amount": 498200 }
]
```

#### 7. 商品销量统计
```
GET /stats/product
```
查询参数（可选）：
- `startDate`: 开始日期
- `endDate`: 结束日期
- `regions`: 地区列表
- `products`: 商品列表

响应示例：
```json
[
  { "product": "冰丝防晒衣", "quantity": 2850 },
  { "product": "透气防晒服", "quantity": 2280 }
]
```

## CSV 数据格式说明

### 字段说明

| 字段名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| date | 字符串 | 是 | 日期，格式 YYYY-MM-DD | 2024-03-05 |
| region | 字符串 | 是 | 地区名称 | 华东 |
| product | 字符串 | 是 | 商品名称 | 冰丝防晒衣 |
| quantity | 整数 | 是 | 销售数量 | 120 |
| amount | 数字 | 是 | 销售金额 | 35880 |

### 示例数据

```csv
date,region,product,quantity,amount
2024-03-05,华东,冰丝防晒衣,120,35880
2024-03-08,华北,透气防晒服,85,21250
2024-03-12,华南,防紫外线外套,150,59700
2024-03-15,西南,冰丝防晒衣,95,28310
```

### 地区列表
- 华东
- 华北
- 华南
- 西南
- 西北
- 东北

### 商品列表
- 冰丝防晒衣
- 透气防晒服
- 防紫外线外套
- 儿童防晒衣

## 功能特性

### 1. 数据导入
- 支持拖拽或点击上传 CSV 文件
- 实时显示上传进度
- 导入结果统计（成功/失败条数）
- 文件格式验证

### 2. 数据看板
- 统计卡片：总销售额、订单数、商品数、地区数
- 销售金额趋势图（按日/按月）
- 地区销售占比饼图
- 商品销量排行柱状图

### 3. 数据筛选
- 按日期范围筛选
- 按地区多选筛选
- 按商品多选筛选
- 一键重置筛选条件

### 4. 用户体验
- 响应式设计，适配多端
- 加载状态动画
- 空数据友好提示
- 网络错误重试机制
- 筛选防抖优化

## 项目结构

```
project42/
├── backend/
│   ├── database/          # SQLite 数据库文件
│   ├── uploads/           # 临时上传目录
│   ├── db.js              # 数据库连接
│   ├── server.js          # 服务器入口
│   ├── sample_data.csv    # 示例数据
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/           # API 接口
│   │   ├── components/    # 组件
│   │   ├── layouts/       # 布局
│   │   ├── router/        # 路由
│   │   ├── utils/         # 工具函数
│   │   ├── views/         # 页面
│   │   └── main.js        # 入口文件
│   └── package.json
└── README.md
```

## 开发说明

### 数据库设计

**sales 表结构**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键，自增 |
| date | TEXT | 销售日期 |
| region | TEXT | 销售地区 |
| product | TEXT | 商品名称 |
| quantity | INTEGER | 销售数量 |
| amount | REAL | 销售金额 |

### 性能优化

1. **API 重试机制**：网络请求失败自动重试 3 次
2. **防抖处理**：筛选条件变更延迟 300ms 后请求
3. **数据库查询**：使用参数化查询防止 SQL 注入

## License

MIT
