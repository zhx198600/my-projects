# 图书借阅管理系统 - The Implementation Plan (Decomposed and Prioritized Task List)

## [x] Task 1: 项目初始化和基础架构搭建
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 创建后端项目结构（Express + SQLite）
  - 创建前端项目结构（React + TypeScript + Vite）
  - 配置项目依赖和启动脚本
  - 配置前后端联调（代理/跨域）
- **Acceptance Criteria Addressed**: 基础架构
- **Test Requirements**:
  - `programmatic` TR-1.1: 后端项目可正常启动，默认端口监听正常
  - `programmatic` TR-1.2: 前端项目可正常构建和启动
  - `programmatic` TR-1.3: 前后端可正常通信（健康检查接口）
- **Notes**: 使用npm作为包管理器，后端端口3001，前端端口5173

## [x] Task 2: 数据库设计和初始化
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 设计数据库表结构（users, books, borrow_records）
  - 编写数据库连接和初始化脚本
  - 预置管理员账户和示例图书数据
  - 编写数据库访问工具函数
- **Acceptance Criteria Addressed**: 数据层基础
- **Test Requirements**:
  - `programmatic` TR-2.1: 启动时自动创建数据库和数据表
  - `programmatic` TR-2.2: 预置管理员账户可正常登录
  - `programmatic` TR-2.3: 预置示例图书数据正确加载
- **Notes**: 预置管理员：admin/admin123

## [x] Task 3: 用户认证 API 开发
- **Priority**: P0
- **Depends On**: Task 2
- **Description**: 
  - 实现用户注册接口（POST /api/auth/register）
  - 实现用户登录接口（POST /api/auth/login）
  - 实现JWT认证中间件
  - 实现角色权限验证中间件
- **Acceptance Criteria Addressed**: AC-4, AC-5
- **Test Requirements**:
  - `programmatic` TR-3.1: 注册成功返回用户信息（不含密码）
  - `programmatic` TR-3.2: 注册时用户名或邮箱重复返回错误
  - `programmatic` TR-3.3: 登录成功返回JWT token和用户信息
  - `programmatic` TR-3.4: 用户名或密码错误返回401错误
  - `programmatic` TR-3.5: 需要认证的接口无token返回401
- **Notes**: 密码使用bcrypt加密，token有效期24小时

## [x] Task 4: 图书管理 API 开发
- **Priority**: P0
- **Depends On**: Task 3
- **Description**: 
  - 实现图书列表查询接口（GET /api/books）
  - 实现图书详情查询接口（GET /api/books/:id）
  - 实现图书录入接口（POST /api/books，仅管理员）
  - 实现图书删除接口（DELETE /api/books/:id，仅管理员）
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3
- **Test Requirements**:
  - `programmatic` TR-4.1: 图书列表接口支持分页查询
  - `programmatic` TR-4.2: 图书详情接口返回完整图书信息
  - `programmatic` TR-4.3: 非管理员调用图书录入/删除接口返回403
  - `programmatic` TR-4.4: 已被借阅的图书不能删除
- **Notes**: 图书字段：id, title, author, isbn, category, description, stock, created_at

## [x] Task 5: 借阅归还 API 开发
- **Priority**: P0
- **Depends On**: Task 4
- **Description**: 
  - 实现图书借阅接口（POST /api/borrow/:bookId，普通用户）
  - 实现图书归还接口（POST /api/return/:bookId，普通用户）
  - 实现借阅记录查询接口（GET /api/borrow-records）
- **Acceptance Criteria Addressed**: AC-6, AC-7, AC-8
- **Test Requirements**:
  - `programmatic` TR-5.1: 借阅成功后图书库存减1
  - `programmatic` TR-5.2: 库存为0时借阅失败
  - `programmatic` TR-5.3: 归还成功后图书库存加1，借阅记录标记为已归还
  - `programmatic` TR-5.4: 普通用户只能查看自己的借阅记录
  - `programmatic` TR-5.5: 管理员可以查看所有用户的借阅记录
- **Notes**: 借阅记录字段：id, user_id, book_id, borrow_date, return_date, status

## [x] Task 6: 用户管理 API 开发
- **Priority**: P1
- **Depends On**: Task 3
- **Description**: 
  - 实现用户列表查询接口（GET /api/users，仅管理员）
  - 实现当前用户信息获取接口（GET /api/users/me）
- **Acceptance Criteria Addressed**: FR-4
- **Test Requirements**:
  - `programmatic` TR-6.1: 管理员可以查看所有用户列表
  - `programmatic` TR-6.2: 普通用户访问用户列表返回403
  - `programmatic` TR-6.3: 所有登录用户可以获取自己的信息
- **Notes**: 用户列表不返回密码字段

## [x] Task 7: 前端基础框架和页面布局
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 配置React Router路由
  - 实现页面布局（导航栏、页脚、主内容区）
  - 实现导航栏根据用户角色动态显示菜单项
  - 配置Axios实例和请求拦截器（自动携带token）
  - 实现全局状态管理（用户登录状态、用户信息）
- **Acceptance Criteria Addressed**: 前端基础
- **Test Requirements**:
  - `programmatic` TR-7.1: 路由跳转正常，页面无刷新
  - `programmatic` TR-7.2: 未登录时导航栏不显示用户功能入口
  - `programmatic` TR-7.3: 不同角色登录时导航栏显示对应菜单项
  - `programmatic` TR-7.4: API请求自动携带Authorization header
- **Notes**: 使用React Context管理全局状态，使用Tailwind CSS进行样式开发

## [x] Task 8: 前端认证页面开发
- **Priority**: P0
- **Depends On**: Task 7
- **Description**: 
  - 实现登录页面（Login）
  - 实现注册页面（Register）
  - 实现路由守卫（未登录用户访问需要认证的页面跳转登录页）
  - 实现登录状态持久化（localStorage存储token）
- **Acceptance Criteria Addressed**: AC-4, AC-5
- **Test Requirements**:
  - `programmatic` TR-8.1: 登录成功后跳转首页，导航栏更新
  - `programmatic` TR-8.2: 注册成功后跳转登录页
  - `programmatic` TR-8.3: 表单验证（必填、密码长度等）
  - `programmatic` TR-8.4: 刷新页面后登录状态保持
- **Notes**: 表单验证使用前端验证 + 后端错误提示

## [x] Task 9: 前端图书相关页面开发
- **Priority**: P0
- **Depends On**: Task 8
- **Description**: 
  - 实现图书列表页面（Home/BookList）
  - 实现图书详情页面（BookDetail）
  - 实现图书录入页面（AddBook，仅管理员）
- **Acceptance Criteria Addressed**: AC-1, AC-3
- **Test Requirements**:
  - `programmatic` TR-9.1: 图书列表显示所有图书，支持分页
  - `programmatic` TR-9.2: 点击图书卡片进入详情页
  - `programmatic` TR-9.3: 管理员角色可以看到图书录入入口
  - `programmatic` TR-9.4: 图书录入表单验证和提交
- **Notes**: 图书列表支持搜索和分类筛选（可选增强）

## [x] Task 10: 前端借阅功能和记录页面开发
- **Priority**: P0
- **Depends On**: Task 9
- **Description**: 
  - 在图书详情页实现借阅/归还按钮
  - 实现借阅记录页面（BorrowRecords）
  - 实现操作反馈提示（成功/错误提示）
- **Acceptance Criteria Addressed**: AC-6, AC-7, AC-8
- **Test Requirements**:
  - `programmatic` TR-10.1: 登录用户可以看到借阅按钮，游客看不到
  - `programmatic` TR-10.2: 借阅成功后按钮变为归还，库存更新
  - `programmatic` TR-10.3: 归还成功后按钮变为借阅，库存更新
  - `programmatic` TR-10.4: 借阅记录页面显示当前用户的所有借阅记录
  - `programmatic` TR-10.5: 操作后有明确的成功/失败提示
- **Notes**: 借阅记录区分已借阅和已归还状态

## [x] Task 11: 前端管理员功能页面开发
- **Priority**: P1
- **Depends On**: Task 10
- **Description**: 
  - 实现用户管理页面（UserManagement，仅管理员）
  - 在图书列表页面为管理员添加删除按钮
  - 实现删除确认对话框
- **Acceptance Criteria Addressed**: AC-2, FR-4
- **Test Requirements**:
  - `programmatic` TR-11.1: 管理员可以看到用户管理菜单项
  - `programmatic` TR-11.2: 用户管理页面显示所有用户列表
  - `programmatic` TR-11.3: 管理员可以删除未被借阅的图书
  - `programmatic` TR-11.4: 删除操作有二次确认
- **Notes**: 删除图书时检查是否有未归还的借阅记录

## [x] Task 12: 权限控制和UI优化
- **Priority**: P1
- **Depends On**: Task 11
- **Description**: 
  - 完善前端路由权限控制（管理员路由保护）
  - 完善按钮级别的权限控制
  - 统一错误处理和加载状态
  - 优化UI样式和用户体验
- **Acceptance Criteria Addressed**: AC-9, AC-10, AC-11, AC-12
- **Test Requirements**:
  - `programmatic` TR-12.1: 普通用户直接访问管理员路由被重定向
  - `programmatic` TR-12.2: 无权限操作的按钮对普通用户隐藏
  - `programmatic` TR-12.3: API请求失败有统一的错误提示
  - `programmatic` TR-12.4: 数据加载时有加载动画/骨架屏
  - `human-judgment` TR-12.5: 界面美观、交互流畅、响应式布局
- **Notes**: 确保移动端访问体验良好

## [x] Task 13: 功能测试和Bug修复
- **Priority**: P0
- **Depends On**: Task 12
- **Description**: 
  - 端到端测试所有核心功能
  - 修复发现的Bug
  - 优化性能和用户体验
- **Acceptance Criteria Addressed**: 所有AC
- **Test Requirements**:
  - `programmatic` TR-13.1: 所有API接口测试通过
  - `programmatic` TR-13.2: 所有前端页面功能测试通过
  - `programmatic` TR-13.3: 权限控制验证通过
  - `human-judgment` TR-13.4: 整体用户体验符合预期
- **Notes**: 重点测试权限边界情况和异常场景
