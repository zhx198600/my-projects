# 在线客服聊天机器人网站 - 实现计划

## [x] Task 1: 项目初始化与目录结构
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 初始化前端 React + TypeScript + Vite 项目
  - 初始化后端 Node.js + Express + TypeScript 项目
  - 配置项目目录结构：`client/` 和 `server/`
  - 配置前后端的基础依赖（express, sqlite3, react, react-router-dom 等）
  - 配置 TypeScript 配置文件
- **Acceptance Criteria Addressed**: [AC-1, AC-5]
- **Test Requirements**:
  - `programmatic` TR-1.1: 前端项目可以启动并显示默认页面
  - `programmatic` TR-1.2: 后端项目可以启动并监听指定端口
  - `programmatic` TR-1.3: TypeScript 编译无错误
- **Notes**: 建议使用 monorepo 结构或两个独立项目，根目录统一管理

## [x] Task 2: 数据库设计与初始化
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 设计数据库模型：
    - `knowledge` 表：id, question, keywords, answer, created_at, updated_at
    - `conversation` 表：id, session_id, message, sender, timestamp
    - `session` 表：id, username, created_at, status
  - 使用 SQLite 实现数据库连接
  - 创建数据库初始化脚本（建表语句）
  - 实现基础的数据库连接池/单例模式
- **Acceptance Criteria Addressed**: [AC-10]
- **Test Requirements**:
  - `programmatic` TR-2.1: 数据库文件成功创建
  - `programmatic` TR-2.2: 三张表成功创建
  - `programmatic` TR-2.3: 可以执行基础的 INSERT/SELECT 操作
- **Notes**: 考虑添加一些初始的示例知识库数据，便于测试

## [x] Task 3: 后端 API - 知识库管理 CRUD
- **Priority**: P0
- **Depends On**: Task 2
- **Description**: 
  - 实现知识库的 RESTful API：
    - GET /api/knowledge - 获取列表（支持分页、搜索）
    - GET /api/knowledge/:id - 获取单个条目
    - POST /api/knowledge - 创建新条目
    - PUT /api/knowledge/:id - 更新条目
    - DELETE /api/knowledge/:id - 删除条目
  - 实现关键词的存储和格式（逗号分隔或数组）
  - 添加基础的输入验证
- **Acceptance Criteria Addressed**: [AC-5, AC-6, AC-7, AC-8]
- **Test Requirements**:
  - `programmatic` TR-3.1: GET /api/knowledge 返回列表数据
  - `programmatic` TR-3.2: POST /api/knowledge 成功创建新条目
  - `programmatic` TR-3.3: PUT /api/knowledge/:id 成功更新条目
  - `programmatic` TR-3.4: DELETE /api/knowledge/:id 成功删除条目
  - `programmatic` TR-3.5: 搜索关键词参数可以过滤结果
- **Notes**: 关键词建议以逗号分隔存储，便于后续匹配

## [x] Task 4: 后端 API - 对话记录
- **Priority**: P0
- **Depends On**: Task 2
- **Description**: 
  - 实现对话记录相关 API：
    - POST /api/sessions - 创建新会话
    - GET /api/sessions - 获取会话列表
    - GET /api/sessions/:id - 获取单个会话详情
    - GET /api/sessions/:id/messages - 获取会话消息列表
  - 实现消息存储逻辑
- **Acceptance Criteria Addressed**: [AC-9]
- **Test Requirements**:
  - `programmatic` TR-4.1: POST /api/sessions 成功创建会话
  - `programmatic` TR-4.2: GET /api/sessions 返回会话列表
  - `programmatic` TR-4.3: GET /api/sessions/:id/messages 返回消息列表
- **Notes**: sender 字段区分 'user' 和 'bot'

## [x] Task 5: 后端 - 意图识别与匹配逻辑
- **Priority**: P0
- **Depends On**: Task 3
- **Description**: 
  - 实现关键词匹配算法：
    - 解析用户消息，进行简单分词或关键词匹配
    - 计算消息与知识库关键词的匹配度
    - 返回匹配度最高的回复
    - 兜底回复逻辑
  - 实现消息处理服务层
  - 添加模拟思考延迟（可选，提升体验）
- **Acceptance Criteria Addressed**: [AC-2, AC-3]
- **Test Requirements**:
  - `programmatic` TR-5.1: 包含关键词的消息返回匹配的回复
  - `programmatic` TR-5.2: 不包含关键词的消息返回兜底回复
  - `programmatic` TR-5.3: 多个匹配时返回匹配度最高的
- **Notes**: 匹配策略：先精确匹配，后模糊匹配；关键词越多权重越高

## [x] Task 6: 后端 - WebSocket 实时聊天
- **Priority**: P0
- **Depends On**: Task 4, Task 5
- **Description**: 
  - 集成 WebSocket（使用 socket.io 或 ws 库）
  - 实现连接管理和会话关联
  - 实现消息收发流程：
    - 用户发送消息 → 存储 → 意图识别 → 生成回复 → 存储 → 发送给用户
  - 添加消息广播（针对当前会话）
- **Acceptance Criteria Addressed**: [AC-2, AC-3]
- **Test Requirements**:
  - `programmatic` TR-6.1: WebSocket 连接成功建立
  - `programmatic` TR-6.2: 发送消息后收到响应
  - `programmatic` TR-6.3: 消息正确存储到数据库
- **Notes**: 建议使用 socket.io，重连和错误处理更完善

## [x] Task 7: 前端 - 客服端布局与路由
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 搭建客服端页面布局（侧边栏导航 + 主内容区）
  - 配置路由：
    - /admin/knowledge - 知识库管理
    - /admin/conversations - 对话记录
    - /admin - 首页/仪表板（可选）
  - 实现导航菜单和基础 UI 框架
- **Acceptance Criteria Addressed**: [AC-5]
- **Test Requirements**:
  - `human-judgment` TR-7.1: 页面布局清晰，导航可用
  - `programmatic` TR-7.2: 页面路由切换正常
- **Notes**: 建议使用 antd 或 mui 等 UI 库提升开发效率

## [x] Task 8: 前端 - 客服端知识库管理页面
- **Priority**: P0
- **Depends On**: Task 3, Task 7
- **Description**: 
  - 实现知识库列表页面：
    - 表格展示所有条目
    - 搜索/筛选功能
    - 分页（可选）
  - 实现添加/编辑弹窗：
    - 问题输入
    - 关键词输入（建议标签输入）
    - 回复内容输入（支持多行）
  - 实现删除确认弹窗
  - 对接后端 API
- **Acceptance Criteria Addressed**: [AC-5, AC-6, AC-7, AC-8]
- **Test Requirements**:
  - `programmatic` TR-8.1: 页面加载显示知识库列表
  - `programmatic` TR-8.2: 添加条目后列表刷新显示
  - `programmatic` TR-8.3: 编辑条目后数据更新
  - `programmatic` TR-8.4: 删除条目后从列表移除
- **Notes**: 添加加载状态和错误提示

## [x] Task 9: 前端 - 客服端对话记录页面
- **Priority**: P1
- **Depends On**: Task 4, Task 7
- **Description**: 
  - 实现会话列表页面：
    - 显示所有会话，包含用户名、创建时间、消息数量
  - 实现会话详情页面：
    - 显示对话的完整消息流
    - 区分用户消息和机器人消息
    - 显示时间戳
  - 对接后端 API
- **Acceptance Criteria Addressed**: [AC-9]
- **Test Requirements**:
  - `programmatic` TR-9.1: 页面加载显示会话列表
  - `programmatic` TR-9.2: 点击会话显示详情
  - `human-judgment` TR-9.3: 消息展示清晰，区分发送者
- **Notes**: 可以用类似聊天界面的样式展示对话详情

## [x] Task 10: 前端 - 客户端页面设计
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 实现客户端登录/开始界面：
    - 用户名输入框
    - 开始聊天按钮
  - 实现聊天界面：
    - 顶部标题栏
    - 消息展示区域（气泡样式）
    - 底部输入框和发送按钮
  - 消息样式区分（用户/机器人）
- **Acceptance Criteria Addressed**: [AC-1, AC-4]
- **Test Requirements**:
  - `human-judgment` TR-10.1: 开始界面美观清晰
  - `human-judgment` TR-10.2: 聊天界面消息气泡区分明显
  - `human-judgment` TR-10.3: 输入区域易用
- **Notes**: 消息气泡：用户在右侧，机器人在左侧

## [x] Task 11: 前端 - 客户端 WebSocket 连接与通信
- **Priority**: P0
- **Depends On**: Task 6, Task 10
- **Description**: 
  - 集成 WebSocket 客户端（socket.io-client）
  - 实现连接建立和会话创建流程
  - 实现消息发送功能
  - 实现消息接收和渲染
  - 添加"正在输入"状态（可选，机器人回复前显示）
  - 实现自动滚动到底部
- **Acceptance Criteria Addressed**: [AC-1, AC-2, AC-3, AC-4]
- **Test Requirements**:
  - `programmatic` TR-11.1: 点击开始聊天后成功建立连接
  - `programmatic` TR-11.2: 发送消息后显示在界面
  - `programmatic` TR-11.3: 收到机器人回复后显示在界面
  - `human-judgment` TR-11.4: 新消息自动滚动到底部
- **Notes**: 添加消息发送状态（发送中/已发送）

## [x] Task 12: 前后端联调与集成测试
- **Priority**: P0
- **Depends On**: Task 8, Task 9, Task 11
- **Description**: 
  - 配置 CORS 或代理，解决跨域问题
  - 测试完整流程：
    - 客服端添加知识库
    - 客户端发起对话
    - 发送消息测试匹配
    - 客服端查看对话记录
  - 修复发现的问题
  - 优化用户体验
- **Acceptance Criteria Addressed**: [AC-1, AC-2, AC-3, AC-4, AC-5, AC-6, AC-7, AC-8, AC-9, AC-10]
- **Test Requirements**:
  - `programmatic` TR-12.1: 前后端可以正常通信（无 CORS 错误）
  - `programmatic` TR-12.2: 完整流程测试通过
  - `programmatic` TR-12.3: 重启后端后数据持久化验证
- **Notes**: 建议前端配置 vite proxy 指向后端

## [x] Task 13: 项目文档与启动脚本
- **Priority**: P2
- **Depends On**: Task 12
- **Description**: 
  - 在项目根目录添加简洁的启动说明
  - 配置统一的启动脚本（可选：concurrently 同时启动前后端）
  - 添加 .gitignore 文件
  - 清理临时文件和调试代码
- **Test Requirements**:
  - `human-judgment` TR-13.1: 项目结构清晰
  - `human-judgment` TR-13.2: 启动说明易于理解
- **Notes**: 不创建完整的 README.md，仅保留必要的启动信息
