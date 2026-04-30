# 北京化工大学实验室器材管理系统 - The Implementation Plan (Decomposed and Prioritized Task List)

## [x] Task 1: 项目初始化与基础架构搭建
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 初始化后端Node.js + Express项目结构
  - 初始化前端Vue.js 3项目结构
  - 配置项目基础依赖（package.json）
  - 建立前后端目录结构规范
- **Acceptance Criteria Addressed**: N/A (基础架构)
- **Test Requirements**:
  - `programmatic` TR-1.1: 后端项目可通过npm install安装依赖并启动
  - `programmatic` TR-1.2: 前端项目可通过npm install安装依赖并启动
  - `human-judgement` TR-1.3: 目录结构清晰，符合前后端分离架构规范
- **Notes**: 使用Vue CLI或Vite创建前端项目，使用Express Generator或手动搭建后端框架

## [x] Task 2: 数据库设计与初始化
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 设计核心数据表结构（users、roles、permissions、laboratories、equipment_categories、equipment、borrow_records、operation_logs）
  - 编写数据库初始化SQL脚本
  - 配置数据库连接池（使用mysql2或sequelize）
  - 建立数据模型层（Models）
- **Acceptance Criteria Addressed**: AC-3, AC-6, AC-7, AC-8
- **Test Requirements**:
  - `programmatic` TR-2.1: SQL脚本可在MySQL 8.x中成功执行
  - `programmatic` TR-2.2: 后端可成功连接数据库并执行简单查询
  - `human-judgement` TR-2.3: 数据表设计符合第三范式，外键关系正确
- **Notes**: 需考虑多实验室数据隔离的字段设计（laboratory_id）

## [x] Task 3: 后端API基础框架与中间件
- **Priority**: P0
- **Depends On**: Task 1, Task 2
- **Description**: 
  - 实现统一的API响应格式（success/error）
  - 实现JWT认证中间件
  - 实现权限校验中间件（RBAC）
  - 实现全局错误处理中间件
  - 实现请求日志中间件
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-9
- **Test Requirements**:
  - `programmatic` TR-3.1: 未携带Token的请求返回401错误
  - `programmatic` TR-3.2: 携带有效Token的请求可正常访问
  - `programmatic` TR-3.3: 权限不足的请求返回403错误
  - `programmatic` TR-3.4: API响应格式统一，包含code、message、data字段
- **Notes**: 使用jsonwebtoken库实现JWT功能

## [x] Task 4: 用户认证模块（后端）
- **Priority**: P0
- **Depends On**: Task 3
- **Description**: 
  - 实现用户登录API（POST /api/auth/login）
  - 实现Token刷新API（POST /api/auth/refresh）
  - 实现登出API（POST /api/auth/logout）
  - 实现密码加密（bcrypt加盐哈希）
  - 实现登录接口限流
- **Acceptance Criteria Addressed**: AC-1, AC-2
- **Test Requirements**:
  - `programmatic` TR-4.1: 正确的用户名密码登录返回200和有效JWT
  - `programmatic` TR-4.2: 错误的用户名或密码返回401错误
  - `programmatic` TR-4.3: 密码在数据库中以哈希形式存储，不可还原
  - `programmatic` TR-4.4: 登录接口存在限流保护
- **Notes**: JWT Payload应包含user_id、role、laboratory_id等信息

## [x] Task 5: 用户管理模块（后端）
- **Priority**: P0
- **Depends On**: Task 4
- **Description**: 
  - 实现用户CRUD API（GET/POST/PUT/DELETE /api/users）
  - 实现用户角色分配API
  - 实现密码重置API
  - 实现用户与实验室关联管理
  - 实现用户列表分页查询
- **Acceptance Criteria Addressed**: AC-8
- **Test Requirements**:
  - `programmatic` TR-5.1: 管理员可创建、修改、删除用户
  - `programmatic` TR-5.2: 普通用户无法修改其他用户信息
  - `programmatic` TR-5.3: 用户列表支持分页和搜索
  - `programmatic` TR-5.4: 密码重置后原密码失效
- **Notes**: 系统管理员可管理所有用户，实验室管理员仅可管理本实验室用户

## [x] Task 6: 角色权限管理模块（后端）
- **Priority**: P0
- **Depends On**: Task 5
- **Description**: 
  - 定义系统角色（系统管理员、实验室管理员、普通用户）
  - 实现角色CRUD API
  - 实现权限点定义与管理
  - 实现角色与权限关联管理
  - 实现用户角色查询API
- **Acceptance Criteria Addressed**: AC-8
- **Test Requirements**:
  - `programmatic` TR-6.1: 系统预设角色存在且不可删除
  - `programmatic` TR-6.2: 角色权限变更后立即生效
  - `programmatic` TR-6.3: 用户角色查询返回正确的角色信息
- **Notes**: 建议采用"用户-角色-权限"的三层RBAC模型

## [x] Task 7: 实验室管理模块（后端）
- **Priority**: P0
- **Depends On**: Task 6
- **Description**: 
  - 实现实验室CRUD API（GET/POST/PUT/DELETE /api/laboratories）
  - 实现实验室与用户关联API
  - 实现实验室数据隔离中间件（非管理员只能访问本实验室数据）
  - 实现实验室列表查询（支持分页）
- **Acceptance Criteria Addressed**: AC-7
- **Test Requirements**:
  - `programmatic` TR-7.1: 系统管理员可管理所有实验室
  - `programmatic` TR-7.2: 实验室管理员只能查看和管理本实验室
  - `programmatic` TR-7.3: 普通用户只能查看所属实验室的数据
  - `programmatic` TR-7.4: 删除实验室时需校验是否有关联数据
- **Notes**: 实验室删除需做软删除或级联校验

## [x] Task 8: 器材分类管理模块（后端）
- **Priority**: P0
- **Depends On**: Task 7
- **Description**: 
  - 实现器材分类CRUD API（GET/POST/PUT/DELETE /api/categories）
  - 实现多级分类树结构查询
  - 实现分类与实验室关联（分类可属于特定实验室或全局）
  - 实现分类使用统计（该分类下有多少器材）
- **Acceptance Criteria Addressed**: AC-6
- **Test Requirements**:
  - `programmatic` TR-8.1: 支持创建无限级分类
  - `programmatic` TR-8.2: 分类树查询返回正确的层级结构
  - `programmatic` TR-8.3: 删除有子分类或有关联器材的分类时给出提示
  - `programmatic` TR-8.4: 分类支持按实验室隔离
- **Notes**: 使用parent_id实现层级关系，查询时使用递归或闭包表

## [x] Task 9: 器材档案管理模块（后端）
- **Priority**: P0
- **Depends On**: Task 8
- **Description**: 
  - 实现器材CRUD API（GET/POST/PUT/DELETE /api/equipment）
  - 实现器材状态管理（可用、借用中、维修中、报废）
  - 实现器材借用API（POST /api/equipment/:id/borrow）
  - 实现器材归还API（POST /api/equipment/:id/return）
  - 实现器材报废API（POST /api/equipment/:id/scrap）
  - 实现器材高级搜索（多条件组合、分页）
- **Acceptance Criteria Addressed**: AC-3, AC-4, AC-5
- **Test Requirements**:
  - `programmatic` TR-9.1: 器材的增删改查功能正常
  - `programmatic` TR-9.2: 借用器材后状态变为"借用中"
  - `programmatic` TR-9.3: 归还器材后状态变为"可用"
  - `programmatic` TR-9.4: 报废器材后状态变为"报废"且不可再借用
  - `programmatic` TR-9.5: 按名称、分类、状态、实验室搜索返回正确结果
  - `programmatic` TR-9.6: 列表支持分页，page和page_size参数生效
- **Notes**: 借用和归还需记录到borrow_records表，操作需记录日志

## [x] Task 10: 操作日志模块（后端）
- **Priority**: P1
- **Depends On**: Task 9
- **Description**: 
  - 实现操作日志记录中间件（自动记录增删改操作）
  - 实现日志查询API（GET /api/logs）
  - 实现日志按操作人、操作类型、时间范围筛选
  - 实现日志分页查询
- **Acceptance Criteria Addressed**: AC-9
- **Test Requirements**:
  - `programmatic` TR-10.1: 执行增删改操作后自动生成日志记录
  - `programmatic` TR-10.2: 日志记录包含操作人、时间、类型、详情
  - `programmatic` TR-10.3: 日志查询支持多条件筛选和分页
  - `programmatic` TR-10.4: 普通用户无法查看其他用户的操作日志
- **Notes**: 使用AOP或中间件方式实现，减少业务代码侵入

## [x] Task 11: 数据导出模块（后端）
- **Priority**: P1
- **Depends On**: Task 10
- **Description**: 
  - 实现器材数据导出为Excel
  - 实现器材数据导出为CSV
  - 实现导出数据按搜索条件过滤
  - 实现导出文件流式下载
- **Acceptance Criteria Addressed**: AC-11
- **Test Requirements**:
  - `programmatic` TR-11.1: 导出的Excel文件可正常打开，数据完整
  - `programmatic` TR-11.2: 导出的CSV文件编码正确，无乱码
  - `programmatic` TR-11.3: 导出数据与当前搜索条件一致
  - `programmatic` TR-11.4: 大数量导出不导致内存溢出
- **Notes**: 使用exceljs或xlsx库实现Excel导出

## [x] Task 12: 前端基础框架与路由配置
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 配置Vue Router路由
  - 实现路由守卫（登录校验、权限校验）
  - 配置全局状态管理（Pinia或Vuex）
  - 实现HTTP请求封装（axios拦截器）
  - 实现统一的错误提示和加载状态
- **Acceptance Criteria Addressed**: AC-1, AC-2
- **Test Requirements**:
  - `programmatic` TR-12.1: 未登录状态访问需登录页面自动跳转登录页
  - `programmatic` TR-12.2: 权限不足的路由无法访问
  - `programmatic` TR-12.3: API请求自动携带Token
  - `programmatic` TR-12.4: Token过期自动刷新或跳转登录
- **Notes**: 路由元信息（meta）定义所需权限

## [x] Task 13: 前端登录与认证页面
- **Priority**: P0
- **Depends On**: Task 12, Task 4
- **Description**: 
  - 实现登录页面UI（用户名、密码输入框，登录按钮）
  - 实现登录表单验证
  - 实现登录成功后Token存储
  - 实现登出功能
  - 实现登录错误提示
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `human-judgement` TR-13.1: 登录页面布局美观，表单元素对齐
  - `programmatic` TR-13.2: 空表单提交提示必填项
  - `programmatic` TR-13.3: 登录成功后跳转首页
  - `programmatic` TR-13.4: Token存储在localStorage或cookie中
- **Notes**: 使用Element Plus或Ant Design Vue组件库

## [x] Task 14: 前端主布局与导航
- **Priority**: P0
- **Depends On**: Task 13
- **Description**: 
  - 实现主布局（侧边栏导航、顶部栏、内容区域）
  - 实现根据用户权限动态生成菜单
  - 实现面包屑导航
  - 实现用户信息展示与设置入口
  - 实现响应式布局适配
- **Acceptance Criteria Addressed**: AC-10
- **Test Requirements**:
  - `human-judgement` TR-14.1: 布局清晰，导航层级明确
  - `programmatic` TR-14.2: 不同角色用户看到不同的菜单项
  - `programmatic` TR-14.3: 面包屑与当前路由对应
  - `human-judgement` TR-14.4: 窗口缩小时布局自适应
- **Notes**: 侧边栏菜单可折叠

## [x] Task 15: 前端用户管理页面
- **Priority**: P0
- **Depends On**: Task 14, Task 5
- **Description**: 
  - 实现用户列表页面（表格、分页、搜索）
  - 实现新增/编辑用户弹窗
  - 实现角色分配功能
  - 实现密码重置功能
  - 实现用户删除确认
- **Acceptance Criteria Addressed**: AC-8
- **Test Requirements**:
  - `human-judgement` TR-15.1: 用户列表展示清晰，操作按钮位置合理
  - `programmatic` TR-15.2: 搜索和分页功能正常
  - `programmatic` TR-15.3: 新增用户表单验证完整
  - `programmatic` TR-15.4: 密码重置有二次确认
  - `programmatic` TR-15.5: 删除用户有二次确认
- **Notes**: 表格使用可排序、可筛选的组件

## [x] Task 16: 前端实验室管理页面
- **Priority**: P0
- **Depends On**: Task 14, Task 7
- **Description**: 
  - 实现实验室列表页面
  - 实现新增/编辑实验室弹窗
  - 实现实验室关联用户管理
  - 实现实验室删除功能
- **Acceptance Criteria Addressed**: AC-7
- **Test Requirements**:
  - `human-judgement` TR-16.1: 实验室信息展示完整
  - `programmatic` TR-16.2: 实验室增删改功能正常
  - `programmatic` TR-16.3: 关联用户列表可正常查看和管理
  - `programmatic` TR-16.4: 实验室管理员只能编辑本实验室信息
- **Notes**: 系统管理员可见所有实验室，其他角色仅见所属实验室

## [x] Task 17: 前端器材分类管理页面
- **Priority**: P0
- **Depends On**: Task 14, Task 8
- **Description**: 
  - 实现分类树形展示（树组件）
  - 实现新增/编辑分类弹窗
  - 实现分类删除功能
  - 实现分类使用数量展示
- **Acceptance Criteria Addressed**: AC-6
- **Test Requirements**:
  - `human-judgement` TR-17.1: 树形结构展示清晰，层级明确
  - `programmatic` TR-17.2: 支持新增子分类
  - `programmatic` TR-17.3: 删除有子分类的分类时给出提示
  - `programmatic` TR-17.4: 分类下器材数量显示正确
- **Notes**: 使用树形组件，支持展开/折叠

## [x] Task 18: 前端器材档案管理页面
- **Priority**: P0
- **Depends On**: Task 14, Task 9
- **Description**: 
  - 实现器材列表页面（高级搜索、表格、分页）
  - 实现器材详情查看页面
  - 实现新增/编辑器材弹窗
  - 实现器材借用功能
  - 实现器材归还功能
  - 实现器材报废功能
  - 实现器材导出功能
- **Acceptance Criteria Addressed**: AC-3, AC-4, AC-5, AC-11
- **Test Requirements**:
  - `human-judgement` TR-18.1: 器材列表信息展示完整，搜索区域布局合理
  - `programmatic` TR-18.2: 多条件组合搜索返回正确结果
  - `programmatic` TR-18.3: 器材详情可查看完整信息
  - `programmatic` TR-18.4: 借用器材后状态变为"借用中"
  - `programmatic` TR-18.5: 归还器材后状态变为"可用"
  - `programmatic` TR-18.6: 报废器材后状态变为"报废"且操作按钮禁用
  - `programmatic` TR-18.7: 导出功能可正常下载文件
- **Notes**: 借用/归还/报废操作需要记录操作人信息

## [x] Task 19: 前端操作日志页面
- **Priority**: P1
- **Depends On**: Task 14, Task 10
- **Description**: 
  - 实现操作日志列表页面
  - 实现日志筛选（操作人、操作类型、时间范围）
  - 实现日志详情查看
  - 实现日志分页
- **Acceptance Criteria Addressed**: AC-9
- **Test Requirements**:
  - `human-judgement` TR-19.1: 日志列表展示清晰，时间倒序排列
  - `programmatic` TR-19.2: 多条件筛选功能正常
  - `programmatic` TR-19.3: 日志详情展示完整操作信息
  - `programmatic` TR-19.4: 分页功能正常
- **Notes**: 系统管理员可查看所有日志，其他角色仅查看自身操作

## [x] Task 20: 前端UI优化与响应式适配
- **Priority**: P1
- **Depends On**: Task 15, Task 16, Task 17, Task 18, Task 19
- **Description**: 
  - 实现全局loading状态
  - 实现统一的成功/错误提示
  - 优化表单交互体验
  - 实现移动端响应式适配
  - 统一按钮、表格、弹窗样式
- **Acceptance Criteria Addressed**: AC-10
- **Test Requirements**:
  - `human-judgement` TR-20.1: 加载状态提示明显，不阻塞操作
  - `human-judgement` TR-20.2: 提示信息位置合理，自动消失
  - `human-judgement` TR-20.3: 表单有输入提示和错误提示
  - `human-judgement` TR-20.4: 移动端界面布局合理，操作方便
- **Notes**: 使用组件库的Message/Notification组件

## [x] Task 21: 系统测试与Bug修复
- **Priority**: P0
- **Depends On**: Task 11, Task 20
- **Description**: 
  - 执行API接口测试
  - 执行前端功能测试
  - 执行权限控制测试
  - 执行数据隔离测试
  - 修复发现的Bug
- **Acceptance Criteria Addressed**: All ACs
- **Test Requirements**:
  - `programmatic` TR-21.1: 所有API接口返回正确的状态码和数据
  - `programmatic` TR-21.2: 前端页面无JavaScript错误
  - `programmatic` TR-21.3: 权限控制严格，无越权操作
  - `programmatic` TR-21.4: 实验室数据隔离正确，无跨实验室数据泄露
- **Notes**: 建议使用Postman或类似工具进行API测试

## [x] Task 22: 基础数据初始化脚本
- **Priority**: P1
- **Depends On**: Task 21
- **Description**: 
  - 创建默认系统管理员账户
  - 初始化预设角色和权限
  - 创建示例实验室数据
  - 创建示例器材分类和器材数据
- **Acceptance Criteria Addressed**: N/A (数据初始化)
- **Test Requirements**:
  - `programmatic` TR-22.1: 初始化脚本可成功执行
  - `programmatic` TR-22.2: 系统管理员账户可正常登录
  - `programmatic` TR-22.3: 预设角色和权限正确创建
  - `human-judgement` TR-22.4: 示例数据完整，可用于演示
- **Notes**: 默认管理员密码需在文档中说明，并提示首次登录后修改
