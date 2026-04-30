# 本地生活论坛网站 - 实现计划（分解和优先级任务列表）

## [x] Task 1: 项目初始化与技术栈搭建
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 初始化前后端项目结构
  - 选择技术栈：React + TypeScript（前端），Node.js + Express + TypeScript（后端），MongoDB（数据库）
  - 配置开发环境和构建工具
  - 配置ESLint、Prettier等代码规范工具
- **Acceptance Criteria Addressed**: 基础架构
- **Test Requirements**:
  - `programmatic` TR-1.1: 项目可以正常启动运行，前后端服务正常启动
  - `human-judgement` TR-1.2: 代码目录结构清晰合理，符合最佳实践
- **Notes**: 使用Vite创建React项目，使用Express Generator创建后端项目

## [ ] Task 2: 数据库设计与数据模型
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 设计用户模型（普通用户、管理员）
  - 设计帖子模型（标题、内容、分类、作者、评论状态）
  - 设计评论模型（内容、作者、父评论ID、帖子ID、层级）
  - 设计敏感词模型
  - 实现MongoDB Schema定义
- **Acceptance Criteria Addressed**: AC-2, AC-3, AC-7, AC-8, AC-10
- **Test Requirements**:
  - `programmatic` TR-2.1: 所有数据模型可以正常创建和查询
  - `programmatic` TR-2.2: 评论模型支持嵌套层级关联
  - `human-judgement` TR-2.3: 数据库索引设计合理，支持高效查询
- **Notes**: 评论使用parentId实现嵌套，支持无限层级

## [ ] Task 3: 用户认证系统
- **Priority**: P0
- **Depends On**: Task 2
- **Description**: 
  - 实现JWT用户认证中间件
  - 实现用户注册接口
  - 实现用户登录/登出接口
  - 实现管理员登录接口
  - 实现游客浏览权限控制
  - 密码使用bcrypt加密存储
- **Acceptance Criteria Addressed**: AC-1, AC-6
- **Test Requirements**:
  - `programmatic` TR-3.1: 未登录用户可以访问公开接口
  - `programmatic` TR-3.2: 注册用户可以正常登录获得JWT Token
  - `programmatic` TR-3.3: 管理员登录获得特殊权限Token
  - `programmatic` TR-3.4: 密码在数据库中是加密存储的
- **Notes**: 管理员账号需要预先在数据库中创建

## [ ] Task 4: 帖子分类浏览功能
- **Priority**: P0
- **Depends On**: Task 3
- **Description**: 
  - 实现帖子创建接口
  - 实现帖子列表查询接口（支持按分类筛选）
  - 实现帖子详情查询接口
  - 前端实现分类标签切换组件
  - 前端实现帖子列表展示
  - 四大分类：政治、经济、科技、民生
- **Acceptance Criteria Addressed**: AC-2, AC-5
- **Test Requirements**:
  - `programmatic` TR-4.1: 登录用户可以创建新帖子
  - `programmatic` TR-4.2: 按分类查询可以正确过滤帖子
  - `programmatic` TR-4.3: 切换分类标签后页面正确刷新显示
  - `human-judgement` TR-4.4: 分类标签UI清晰，交互友好
- **Notes**: 默认显示全部分类帖子

## [ ] Task 5: 多层级评论系统
- **Priority**: P0
- **Depends On**: Task 4
- **Description**: 
  - 实现评论创建接口
  - 实现评论查询接口（按帖子ID，支持层级结构）
  - 前端实现评论嵌套渲染组件
  - 实现评论回复功能
  - 支持对评论进行多次层级回复
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `programmatic` TR-5.1: 用户可以对帖子发表一级评论
  - `programmatic` TR-5.2: 用户可以对已有评论发表回复
  - `programmatic` TR-5.3: 查询接口返回正确的层级嵌套结构
  - `human-judgement` TR-5.4: 评论层级缩进显示清晰
- **Notes**: 前端评论组件递归渲染实现嵌套

## [ ] Task 6: Markdown内容渲染支持
- **Priority**: P1
- **Depends On**: Task 5
- **Description**: 
  - 后端评论内容支持Markdown文本存储
  - 前端集成Markdown渲染器
  - 实现Markdown编辑器（评论输入）
  - 支持常用Markdown语法（标题、加粗、链接、代码块等）
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `programmatic` TR-6.1: Markdown文本正确渲染为HTML
  - `programmatic` TR-6.2: XSS防护，过滤危险标签
  - `human-judgement` TR-6.3: Markdown渲染样式美观
  - `human-judgement` TR-6.4: 编辑器支持基本Markdown快捷键
- **Notes**: 使用react-markdown或类似库，配合sanitize-html做XSS防护

## [ ] Task 7: 管理员后台基础界面
- **Priority**: P1
- **Depends On**: Task 3
- **Description**: 
  - 创建后台管理登录页面
  - 创建后台管理主布局
  - 实现侧边导航菜单
  - 实现后台路由守卫
- **Acceptance Criteria Addressed**: AC-6
- **Test Requirements**:
  - `programmatic` TR-7.1: 未登录用户无法访问后台路由
  - `programmatic` TR-7.2: 管理员登录成功跳转到后台主页
  - `human-judgement` TR-7.3: 后台UI布局清晰易用
- **Notes**: 后台和前台使用不同路由前缀

## [ ] Task 8: 管理员内容管理功能
- **Priority**: P1
- **Depends On**: Task 7
- **Description**: 
  - 后台帖子管理列表
  - 实现删除帖子功能
  - 实现删除评论功能
  - 实现禁止帖子评论开关
  - 后台评论管理列表
- **Acceptance Criteria Addressed**: AC-7, AC-8, AC-9
- **Test Requirements**:
  - `programmatic` TR-8.1: 管理员删除帖子后帖子及其评论从数据库删除
  - `programmatic` TR-8.2: 管理员删除评论后评论及其子评论被删除
  - `programmatic` TR-8.3: 禁止评论后普通用户无法创建评论
  - `programmatic` TR-8.4: 普通用户无法调用管理员接口
- **Notes**: 删除操作需要二次确认

## [x] Task 9: 敏感词管理系统
- **Priority**: P1
- **Depends On**: Task 8
- **Description**: 
  - 后台敏感词管理页面
  - 实现敏感词增删改查接口
  - 实现发帖和评论时的敏感词检测
  - 敏感词检测不通过时给出提示
- **Acceptance Criteria Addressed**: AC-10
- **Test Requirements**:
  - `programmatic` TR-9.1: 管理员可以添加、删除、查询敏感词
  - `programmatic` TR-9.2: 包含敏感词的帖子/评论发布被拦截
  - `programmatic` TR-9.3: 用户看到清晰的敏感词提示
  - `human-judgement` TR-9.4: 敏感词检测响应快速
- **Notes**: 使用DFA算法或第三方库做高效敏感词检测

## [x] Task 10: 整体测试与优化
- **Priority**: P2
- **Depends On**: Task 6, Task 9
- **Description**: 
  - 全流程功能测试
  - 响应式布局适配
  - 性能优化
  - Bug修复
  - 部署准备
- **Acceptance Criteria Addressed**: 所有AC
- **Test Requirements**:
  - `programmatic` TR-10.1: 所有核心功能测试通过
  - `programmatic` TR-10.2: 页面加载时间 < 2秒
  - `human-judgement` TR-10.3: 移动端显示正常
  - `human-judgement` TR-10.4: 整体用户体验流畅
- **Notes**: 包含边界情况测试
