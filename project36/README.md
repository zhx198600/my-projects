# 农民工上岗登记系统

一个基于Web的农民工上岗登记管理系统，包含信息登记、安全培训、在线考核、责任书签署等功能。

## 项目结构

```
project36/
├── miniprogram/           # 微信小程序目录（可选）
│   ├── pages/
│   │   └── index/
│   └── sitemap.json
├── web/                   # H5页面目录
│   ├── css/
│   │   └── style.css     # 样式文件
│   ├── js/
│   │   └── common.js     # JavaScript工具函数
│   ├── index.html        # 首页
│   ├── register.html     # 信息登记页
│   ├── training.html     # 培训页
│   ├── exam.html         # 考核页
│   ├── agreement.html    # 责任书签署页
│   └── profile.html      # 个人中心页
├── server/                # 后端服务目录
│   ├── database/
│   │   └── init.js       # 数据库初始化脚本
│   ├── models/
│   │   ├── database.js   # 数据库连接
│   │   ├── user.js       # 用户模型
│   │   ├── agreement.js  # 责任书模型
│   │   ├── exam.js       # 考核模型
│   │   ├── training.js   # 培训模型
│   │   └── idCardPhoto.js # 身份证照片模型
│   ├── routes/
│   │   ├── users.js      # 用户相关接口
│   │   ├── idCardPhotos.js # 身份证照片接口
│   │   ├── training.js   # 培训接口
│   │   ├── exam.js       # 考核接口
│   │   └── agreement.js  # 责任书接口
│   ├── package.json      # 依赖配置
│   └── server.js         # 服务入口
└── README.md             # 项目说明
```

## 功能特性

### 1. 首页 (index.html)
- 显示用户基本信息卡片
- 展示上岗登记进度
- 四个主要功能入口（信息登记、安全培训、在线考核、责任书签署）
- 点击各功能按钮可跳转到对应页面
- 实时显示各环节完成状态

### 2. 信息登记 (register.html)
- 个人基本信息录入（姓名、身份证号、手机号等）
- 工种选择（建筑工人、钢筋工、木工、水电工、焊工等）
- 紧急联系人信息
- 身份证正反面照片上传（支持JPG、PNG格式，最大5MB）
- 表单验证（身份证号校验、手机号校验）
- 信息自动保存和更新

### 3. 安全培训 (training.html)
- 安全生产知识培训内容（5个章节）
  - 第一章：安全生产法规
  - 第二章：安全操作规程
  - 第三章：个人防护用品使用
  - 第四章：典型事故案例分析
  - 第五章：应急处理与急救知识
- 阅读进度跟踪（滚动监听）
- 章节导航快速跳转
- 培训完成确认机制
- 进度本地存储保存

### 4. 在线考核 (exam.html)
- 10道安全生产知识选择题
- 答题进度显示
- 自动评分（满分100分，70分及格）
- 答案解析展示
- 考核通过后可进入责任书签署
- 未通过可重新答题

### 5. 责任书签署 (agreement.html)
- 安全生产责任书内容展示
- 手写签名功能（支持鼠标和触摸屏）
- 签名清除功能
- 签署日期自动显示
- 签署成功弹窗提示

### 6. 个人中心 (profile.html)
- 用户基本信息展示
- 各环节完成记录
- 完成时间显示
- 考核分数展示
- 总体进度环形显示

## 技术栈

- **前端（H5）**: 原生 HTML5 + CSS3 + JavaScript
- **响应式设计**: 支持移动端（375px）、平板、桌面端
- **后端**: Node.js + Express.js
- **数据库**: SQLite3

## 快速开始

### 环境要求

- Node.js >= 14.0.0
- npm >= 6.0.0

### 安装依赖

```bash
cd server
npm install
```

### 启动服务

```bash
# 开发模式（自动重启）
npm run dev

# 生产模式
npm start
```

服务默认启动在 `http://localhost:3000`

### 访问系统

启动服务后，在浏览器中访问：

- **H5首页**: http://localhost:3000/index.html
- **API健康检查**: http://localhost:3000/api/health

## 页面访问路径

| 页面 | 路径 | 说明 |
|------|------|------|
| 首页 | /index.html | 系统首页，进度展示 |
| 信息登记 | /register.html | 个人信息录入 |
| 安全培训 | /training.html | 安全生产知识学习 |
| 在线考核 | /exam.html | 安全生产知识考核 |
| 责任书签署 | /agreement.html | 责任书在线签署 |
| 个人中心 | /profile.html | 个人信息和进度查看 |

## API接口文档

### 用户相关接口

#### 1. 用户登记
- **接口**: `POST /api/users/register`
- **参数**:
  ```json
  {
    "name": "张三",
    "idCard": "110101199001011234",
    "phone": "13800138000",
    "gender": "男",
    "birthDate": "1990-01-01",
    "workType": "建筑工人",
    "workYears": "3-5年",
    "address": "北京市朝阳区",
    "emergencyContact": "李四",
    "emergencyPhone": "13900139000"
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "message": "登记成功",
    "data": { "userId": 1 }
  }
  ```

#### 2. 获取用户状态
- **接口**: `GET /api/users/status`
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "infoCompleted": true,
      "trainingCompleted": true,
      "examScore": 90,
      "agreementSigned": true
    }
  }
  ```

#### 3. 获取用户信息
- **接口**: `GET /api/users/info`
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "name": "张三",
      "id_card": "110101199001011234",
      "phone": "13800138000",
      "gender": "男",
      "birth_date": "1990-01-01",
      "work_type": "建筑工人",
      "work_years": "3-5年",
      "address": "北京市朝阳区",
      "emergency_contact": "李四",
      "emergency_phone": "13900139000"
    }
  }
  ```

#### 4. 完成培训
- **接口**: `POST /api/users/complete-training`
- **响应**:
  ```json
  {
    "success": true,
    "message": "培训完成"
  }
  ```

#### 5. 提交考核
- **接口**: `POST /api/users/submit-exam`
- **参数**:
  ```json
  {
    "score": 90
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "message": "提交成功"
  }
  ```

#### 6. 签署责任书
- **接口**: `POST /api/users/sign-agreement`
- **参数**:
  ```json
  {
    "signature": "data:image/png;base64,...",
    "signDate": "2024-01-15T10:30:00Z"
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "message": "签署成功"
  }
  ```

## 响应式设计说明

系统采用响应式设计，支持以下断点：

- **移动端（≤480px）**:
  - 单栏布局
  - 优化的字体大小
  - 增大的按钮和表单元素
  - 适合触摸操作的间距

- **平板端（≤768px）**:
  - 单栏或双栏布局
  - 适中的字体大小
  - 优化的图片展示

- **桌面端（>768px）**:
  - 多栏布局
  - 完整的功能展示
  - 更大的内容区域

## 用户体验优化

### 1. 加载提示
- 统一的加载动画
- 加载状态文字提示
- 全局加载遮罩层

### 2. 操作反馈
- 成功/失败 Toast 提示
- 按钮点击状态反馈
- 表单验证实时提示
- 操作确认弹窗

### 3. 错误处理
- 网络错误友好提示
- 表单验证错误提示
- 文件上传错误提示
- 统一的错误处理机制

### 4. 交互优化
- 按钮点击放大效果
- 图片上传成功提示
- 签名清除确认
- 平滑滚动动画
- 表单元素聚焦样式

## 数据库结构

### users表（用户表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键，自增 |
| name | TEXT | 姓名 |
| id_card | TEXT | 身份证号（唯一） |
| phone | TEXT | 手机号 |
| gender | TEXT | 性别 |
| birth_date | TEXT | 出生日期 |
| work_type | TEXT | 工种 |
| work_years | TEXT | 工作年限 |
| address | TEXT | 居住地址 |
| emergency_contact | TEXT | 紧急联系人 |
| emergency_phone | TEXT | 紧急联系电话 |
| training_completed | INTEGER | 培训是否完成（0/1） |
| exam_score | INTEGER | 考核分数 |
| agreement_signed | INTEGER | 责任书是否签署（0/1） |
| created_at | TEXT | 创建时间 |
| updated_at | TEXT | 更新时间 |

### training_records表（培训记录表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键，自增 |
| user_id | INTEGER | 用户ID |
| completed_at | TEXT | 完成时间 |

### exam_records表（考核记录表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键，自增 |
| user_id | INTEGER | 用户ID |
| score | INTEGER | 考核分数 |
| completed_at | TEXT | 完成时间 |

### agreement_records表（责任书签署记录表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键，自增 |
| user_id | INTEGER | 用户ID |
| signature | TEXT | 签名图片（base64） |
| signed_at | TEXT | 签署时间 |

### id_card_photos表（身份证照片表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键，自增 |
| user_id | INTEGER | 用户ID |
| front_photo | TEXT | 正面照片（base64） |
| back_photo | TEXT | 反面照片（base64） |
| uploaded_at | TEXT | 上传时间 |

## 部署说明

### 本地开发
1. 安装Node.js环境
2. 安装依赖并启动服务
3. 在浏览器中访问 http://localhost:3000

### 生产环境
1. 使用PM2等进程管理工具启动后端服务
   ```bash
   npm install -g pm2
   pm2 start server.js --name "migrant-worker-system"
   ```
2. 配置反向代理（如Nginx）
3. 配置HTTPS证书

## 注意事项

1. 当前版本使用模拟身份证号（110101199001011234）进行用户识别，实际应用需要接入用户认证系统
2. 数据库文件位于 `server/database/migrant_worker.db`，请定期备份
3. 图片以base64格式存储在数据库中，建议生产环境使用对象存储服务
4. 请根据实际需求修改培训内容和考核题目
5. 责任书内容请根据当地法规和公司要求进行调整

## 扩展建议

1. 接入微信小程序登录，获取用户openid
2. 添加更多工种和培训内容
3. 增加管理员后台，支持数据导出、统计分析
4. 添加消息推送功能（培训通知、考核提醒等）
5. 支持多项目、多工地管理
6. 增加数据统计和报表功能
7. 接入人脸识别验证身份
8. 支持PDF格式责任书导出

## 浏览器兼容性

- Chrome (推荐)
- Firefox
- Safari
- Edge
- 移动端浏览器（iOS Safari、Android Chrome等）

## 许可证

MIT

## 联系方式

如有问题或建议，请联系项目维护者。

---

**版本**: 1.0.0  
**更新日期**: 2024-01-15
