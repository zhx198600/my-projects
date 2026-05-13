# Web全栈关键字检索系统 - The Implementation Plan (Decomposed and Prioritized Task List)

## [x] Task 1: 项目初始化与技术选型
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 初始化项目目录结构
  - 选择后端技术栈：Node.js + Express + SQLite/MySQL
  - 选择前端技术栈：React + Ant Design
  - 配置开发环境和构建工具
- **Acceptance Criteria Addressed**: [NFR-5]
- **Test Requirements**:
  - `programmatic` TR-1.1: 项目目录结构创建完成，package.json配置正确
  - `programmatic` TR-1.2: 开发服务器可以正常启动
- **Notes**: 采用前后端分离架构，使用Monorepo管理

## [x] Task 2: 后端基础架构搭建
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 创建Express服务器基础框架
  - 配置CORS、静态文件服务
  - 设计数据库模型（文件表、分类表、管理员表）
  - 实现数据库连接和ORM配置
- **Acceptance Criteria Addressed**: [FR-1, FR-4]
- **Test Requirements**:
  - `programmatic` TR-2.1: API基础路由正常响应
  - `programmatic` TR-2.2: 数据库表结构创建成功
- **Notes**: 使用Sequelize作为ORM

## [x] Task 3: 文件上传接口实现
- **Priority**: P0
- **Depends On**: Task 2
- **Description**: 
  - 实现文件上传API接口
  - 配置multer中间件处理文件上传
  - 支持Word(.docx)、PDF、图片(JPG/PNG)格式验证
  - 文件信息保存到数据库
- **Acceptance Criteria Addressed**: [FR-1, NFR-1, NFR-3]
- **Test Requirements**:
  - `programmatic` TR-3.1: POST /api/upload 成功上传文件并返回200
  - `programmatic` TR-3.2: 不支持的文件格式上传返回400错误
  - `programmatic` TR-3.3: 超过50MB文件上传返回413错误
- **Notes**: 文件存储在本地文件系统，路径保存到数据库

## [x] Task 4: 文件内容解析与文本提取
- **Priority**: P0
- **Depends On**: Task 3
- **Description**: 
  - 集成pdf-parse库解析PDF文本
  - 集成mammoth库解析Word文档
  - 集成Tesseract.js进行图片OCR识别
  - 提取的文本内容保存到数据库用于检索
- **Acceptance Criteria Addressed**: [FR-1, FR-2, AC-6]
- **Test Requirements**:
  - `programmatic` TR-4.1: PDF文件上传后成功提取文本内容
  - `programmatic` TR-4.2: Word文件上传后成功提取文本内容
  - `programmatic` TR-4.3: 包含文字的图片上传后成功提取文本
- **Notes**: 文本提取为异步处理，避免阻塞请求

## [x] Task 5: 关键字检索接口实现
- **Priority**: P0
- **Depends On**: Task 4
- **Description**: 
  - 实现全文检索API接口
  - 使用数据库全文索引或模糊查询实现关键字匹配
  - 实现文件列表查询接口
  - 支持分页查询
- **Acceptance Criteria Addressed**: [FR-2, FR-3, NFR-2, AC-2]
- **Test Requirements**:
  - `programmatic` TR-5.1: GET /api/search?q=keyword 返回匹配的文件列表
  - `programmatic` TR-5.2: 检索响应时间小于1秒
  - `programmatic` TR-5.3: GET /api/files 返回所有文件列表
- **Notes**: 考虑使用SQLite FTS5或MySQL全文索引提升性能

## [x] Task 6: 管理员认证接口实现
- **Priority**: P0
- **Depends On**: Task 2
- **Description**: 
  - 实现管理员登录API
  - 使用JWT实现身份认证
  - 创建默认管理员账号
  - 实现接口权限验证中间件
- **Acceptance Criteria Addressed**: [FR-4, AC-3]
- **Test Requirements**:
  - `programmatic` TR-6.1: POST /api/admin/login 正确账号密码返回JWT token
  - `programmatic` TR-6.2: 错误账号密码返回401错误
  - `programmatic` TR-6.3: 管理接口不带有效token返回401错误
- **Notes**: 密码使用bcrypt加密存储

## [x] Task 7: 管理端文件CRUD接口实现
- **Priority**: P1
- **Depends On**: Task 6
- **Description**: 
  - 实现文件列表查询接口（管理端）
  - 实现文件删除接口
  - 实现文件信息修改接口
  - 实现文件分类分配接口
- **Acceptance Criteria Addressed**: [FR-6, AC-5]
- **Test Requirements**:
  - `programmatic` TR-7.1: GET /api/admin/files 返回带分页的文件列表
  - `programmatic` TR-7.2: DELETE /api/admin/files/:id 成功删除文件
  - `programmatic` TR-7.3: PUT /api/admin/files/:id 成功更新文件信息
- **Notes**: 所有接口需要管理员权限验证

## [x] Task 8: 文件分类与统计接口实现
- **Priority**: P1
- **Depends On**: Task 7
- **Description**: 
  - 实现分类的增删改查接口
  - 实现文件统计接口（按分类、按类型、按时间）
  - 统计数据聚合查询优化
- **Acceptance Criteria Addressed**: [FR-5, FR-7, AC-4]
- **Test Requirements**:
  - `programmatic` TR-8.1: GET /api/admin/categories 返回分类列表
  - `programmatic` TR-8.2: GET /api/admin/stats 返回正确的统计数据
  - `human-judgement` TR-8.3: 统计数据展示直观清晰
- **Notes**: 统计接口数据做缓存处理

## [x] Task 9: 用户端前端页面开发
- **Priority**: P1
- **Depends On**: Task 5
- **Description**: 
  - 创建用户端主页面
  - 实现文件上传组件，支持拖拽上传
  - 实现搜索框和搜索结果展示
  - 实现文件列表展示页面
  - 响应式布局适配
- **Acceptance Criteria Addressed**: [FR-1, FR-2, FR-3, AC-1, AC-7]
- **Test Requirements**:
  - `human-judgement` TR-9.1: 文件上传界面友好，有进度提示
  - `programmatic` TR-9.2: 搜索功能正确展示匹配结果
  - `human-judgement` TR-9.3: 不同屏幕尺寸下页面布局正常
- **Notes**: 使用Ant Design组件库，上传组件显示进度条

## [x] Task 10: 管理端前端页面开发
- **Priority**: P1
- **Depends On**: Task 8
- **Description**: 
  - 实现管理员登录页面
  - 实现管理端主布局（侧边栏+顶部导航）
  - 实现文件管理页面（表格展示、增删改查）
  - 实现分类管理页面
  - 实现数据统计仪表盘页面
- **Acceptance Criteria Addressed**: [FR-4, FR-5, FR-6, FR-7, AC-3, AC-4, AC-5]
- **Test Requirements**:
  - `programmatic` TR-10.1: 登录成功后跳转管理后台
  - `human-judgement` TR-10.2: 统计仪表盘数据展示清晰美观
  - `programmatic` TR-10.3: 文件增删改查操作正常工作
- **Notes**: 管理端使用独立路由，未登录自动跳转登录页

## [x] Task 11: 系统集成与测试
- **Priority**: P2
- **Depends On**: Task 9, Task 10
- **Description**: 
  - 前后端联调测试
  - 性能测试（上传、检索响应时间）
  - 兼容性测试（主流浏览器）
  - Bug修复和优化
- **Acceptance Criteria Addressed**: [NFR-1, NFR-2, NFR-4, NFR-5]
- **Test Requirements**:
  - `programmatic` TR-11.1: 完整流程测试：上传->解析->检索->管理
  - `programmatic` TR-11.2: 1000个文件下检索性能达标
  - `human-judgement` TR-11.3: 主流浏览器页面显示和功能正常
- **Notes**: 编写自动化测试用例覆盖核心功能
