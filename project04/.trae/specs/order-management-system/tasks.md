# 后台订单管理系统 - The Implementation Plan (Decomposed and Prioritized Task List)

## [x] Task 1: 项目初始化与基础配置
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 使用 create-next-app 初始化 Next.js 14 + TypeScript 项目
  - 安装并配置 Tailwind CSS
  - 安装必要依赖：next-themes（主题）、next-intl（国际化）、lucide-react（图标）
  - 配置 tsconfig.json 路径别名（@/ 指向 src/）
  - 创建基础目录结构：src/app, src/components, src/lib, src/hooks, src/types, src/mock
- **Acceptance Criteria Addressed**: [NFR-3]
- **Test Requirements**:
  - `programmatic` TR-1.1: 项目可正常启动（npm run dev 无报错）
  - `programmatic` TR-1.2: 路径别名 @/ 可用
  - `programmatic` TR-1.3: Tailwind CSS 基础样式正常应用
- **Notes**: 使用 App Router 模式，src 目录结构

## [x] Task 2: TypeScript 类型定义与 Mock 数据
- **Priority**: P0
- **Depends On**: [Task 1]
- **Description**: 
  - 定义核心数据类型：User, Order, Logistics, AuthState
  - 订单状态枚举：'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled'
  - 物流状态枚举：'preparing' | 'shipped' | 'in_transit' | 'delivered'
  - 创建 Mock 数据：20 个订单、10 个物流记录、5 个系统用户
  - 创建 Mock API 服务层函数（模拟 CRUD 操作，带延迟）
- **Acceptance Criteria Addressed**: [AC-6, AC-10, AC-11]
- **Test Requirements**:
  - `programmatic` TR-2.1: TypeScript 类型定义完整，无编译错误
  - `programmatic` TR-2.2: Mock API 函数可正常调用并返回数据
  - `programmatic` TR-2.3: Mock 数据包含至少 20 条订单、10 条物流、5 个用户
- **Notes**: Mock 数据可使用 uuid 生成 ID，faker.js 生成模拟数据（可选）

## [ ] Task 3: 国际化 (i18n) 配置
- **Priority**: P0
- **Depends On**: [Task 1]
- **Description**: 
  - 配置 next-intl 与 Next.js App Router 集成
  - 创建语言包：zh (简体中文)、en (English)
  - 语言包包含：公共文本、登录页、导航、订单管理、物流管理、用户管理等模块
  - 创建 useTranslation Hook 封装
  - 配置语言持久化（localStorage）
- **Acceptance Criteria Addressed**: [AC-4, FR-2]
- **Test Requirements**:
  - `programmatic` TR-3.1: t() 函数可正常获取中英文文本
  - `programmatic` TR-3.2: 切换语言后页面文本正确更新
  - `programmatic` TR-3.3: 语言选择保存在 localStorage，刷新后保持
- **Notes**: 语言包结构按模块组织，便于维护

## [x] Task 4: 主题 (Theming) 配置
- **Priority**: P0
- **Depends On**: [Task 1]
- **Description**: 
  - 安装并配置 next-themes
  - 定义 Tailwind CSS 浅色/深色主题配色方案
  - 实现主题切换组件（按钮）
  - 配置主题持久化和系统主题跟随
  - 避免 SSR  hydration 不匹配（使用 'use client' 正确处理）
- **Acceptance Criteria Addressed**: [AC-5, FR-3]
- **Test Requirements**:
  - `human-judgement` TR-4.1: 浅色主题下背景为白色/浅灰，文字为深灰/黑色
  - `human-judgement` TR-4.2: 深色主题下背景为深灰/黑色，文字为浅灰/白色
  - `programmatic` TR-4.3: 主题选择保存在 localStorage，刷新后保持
- **Notes**: 确保所有组件正确使用 CSS 变量或 Tailwind dark: 前缀

## [x] Task 5: 认证上下文与路由保护
- **Priority**: P0
- **Depends On**: [Task 2]
- **Description**: 
  - 创建 AuthContext 提供登录状态
  - 实现登录逻辑（验证用户名密码，模拟 JWT 存储）
  - 实现登出逻辑（清除 Token）
  - 创建 useAuth Hook
  - 创建中间件或客户端路由保护组件
  - 定义登录用户信息类型（角色：admin / user）
- **Acceptance Criteria Addressed**: [AC-1, AC-2, AC-3, AC-13, FR-1]
- **Test Requirements**:
  - `programmatic` TR-5.1: 输入 admin/admin123 登录成功，进入首页
  - `programmatic` TR-5.2: 输入错误密码显示错误提示
  - `programmatic` TR-5.3: 未登录访问 /orders 重定向到 /login
  - `programmatic` TR-5.4: 点击登出后清除状态，返回登录页
- **Notes**: 使用 localStorage 存储 token，仅作为模拟

## [x] Task 6: 登录页面开发
- **Priority**: P0
- **Depends On**: [Task 3, Task 4, Task 5]
- **Description**: 
  - 创建登录页面 UI（居中卡片布局）
  - 用户名输入框、密码输入框（支持显示/隐藏切换）
  - 登录按钮，带加载状态
  - 错误提示区域
  - 语言切换（登录页右上角）
  - 主题切换（登录页右上角）
  - 已登录用户自动跳转首页
- **Acceptance Criteria Addressed**: [AC-1, AC-2, FR-1]
- **Test Requirements**:
  - `human-judgement` TR-6.1: 登录页居中显示，视觉整洁
  - `human-judgement` TR-6.2: 浅色/深色主题下均美观可读
  - `programmatic` TR-6.3: 点击登录按钮进入加载状态，不可重复点击
- **Notes**: 使用 Form 表单，基础的前端验证（非空）

## [x] Task 7: 系统布局组件（侧边栏 + 顶部栏）
- **Priority**: P0
- **Depends On**: [Task 3, Task 4, Task 5]
- **Description**: 
  - 创建主布局组件 (DashboardLayout)
  - 左侧导航栏：Logo、菜单（订单管理、物流管理、用户管理）、当前高亮
  - 顶部状态栏：面包屑导航、语言切换、主题切换、用户头像/名称、退出按钮
  - 响应式布局（侧边栏折叠/展开，桌面端默认展开）
  - 内容区域容器
- **Acceptance Criteria Addressed**: [FR-7, AC-4, AC-5]
- **Test Requirements**:
  - `human-judgement` TR-7.1: 侧边栏菜单高亮正确对应当前路由
  - `human-judgement` TR-7.2: 顶部显示当前登录用户名
  - `programmatic` TR-7.3: 点击菜单正确跳转对应页面
- **Notes**: 菜单文字使用 t() 函数，支持国际化

## [x] Task 8: 订单管理 - 列表页面
- **Priority**: P0
- **Depends On**: [Task 2, Task 7]
- **Description**: 
  - 创建订单列表页面 (/orders)
  - 顶部筛选区域：搜索框（订单号/客户名）、状态筛选下拉框
  - 表格展示：订单号、客户名称、订单金额、订单状态、创建时间、操作（查看详情）
  - 分页组件（模拟分页）
  - 加载状态与空状态
  - 状态标签颜色区分（pending-橙色, processing-蓝色, shipped-绿色, completed-深绿, cancelled-红色）
- **Acceptance Criteria Addressed**: [AC-6, AC-7, AC-8, FR-4]
- **Test Requirements**:
  - `programmatic` TR-8.1: 页面加载后显示订单列表表格
  - `programmatic` TR-8.2: 输入搜索关键词后列表过滤
  - `programmatic` TR-8.3: 选择状态筛选后列表过滤
  - `human-judgement` TR-8.4: 不同订单状态显示不同颜色标签
- **Notes**: 分页使用简单的客户端分页或模拟服务端分页

## [x] Task 9: 订单管理 - 详情与状态修改
- **Priority**: P0
- **Depends On**: [Task 8]
- **Description**: 
  - 创建订单详情页面 (/orders/[id]) 或详情弹窗
  - 显示订单完整信息：基本信息、商品明细（Mock）、收货信息、订单日志
  - 状态修改功能：下拉选择新状态，确认修改
  - 修改成功后返回列表并刷新数据
  - 返回按钮
- **Acceptance Criteria Addressed**: [AC-9, FR-4]
- **Test Requirements**:
  - `programmatic` TR-9.1: 点击订单操作"详情"打开详情页
  - `programmatic` TR-9.2: 修改订单状态后，列表中该订单状态更新
  - `programmatic` TR-9.3: 修改成功显示成功提示
- **Notes**: 状态修改后同步更新本地 mock 数据

## [x] Task 10: 物流管理模块
- **Priority**: P1
- **Depends On**: [Task 2, Task 7]
- **Description**: 
  - 创建物流列表页面 (/logistics)
  - 表格展示：物流单号、关联订单号、当前状态、最后更新时间、操作（查看）
  - 物流详情弹窗/页面
  - 物流状态标签颜色
  - 支持搜索（物流单号/订单号）
- **Acceptance Criteria Addressed**: [AC-10, FR-5]
- **Test Requirements**:
  - `programmatic` TR-10.1: 物流页面显示物流列表
  - `programmatic` TR-10.2: 点击查看显示物流详情
  - `human-judgement` TR-10.3: 关联订单号可点击跳转订单详情
- **Notes**: 物流数据与订单通过 orderId 关联

## [ ] Task 11: 用户管理模块
- **Priority**: P1
- **Depends On**: [Task 2, Task 5, Task 7]
- **Description**: 
  - 创建用户列表页面 (/users)
  - 表格展示：用户名、角色（Admin/User）、状态（启用/禁用）、最后登录时间、操作
  - 启用/禁用切换按钮
  - 搜索框（按用户名搜索）
  - 角色标识颜色区分
- **Acceptance Criteria Addressed**: [AC-11, AC-12, FR-6]
- **Test Requirements**:
  - `programmatic` TR-11.1: 用户页面显示系统用户列表
  - `programmatic` TR-11.2: 点击"禁用"后用户状态变为禁用
  - `programmatic` TR-11.3: 输入用户名搜索正确过滤
- **Notes**: 禁用功能仅修改本地状态，不影响当前登录用户

## [x] Task 12: 通用组件与反馈优化
- **Priority**: P1
- **Depends On**: [Task 7]
- **Description**: 
  - 创建 Toast 提示组件（成功/错误/信息）
  - 创建 Loading 组件与页面加载状态
  - 创建确认弹窗 ConfirmDialog
  - 创建空状态 EmptyState 组件
  - 创建 StatusBadge 状态标签组件（统一各模块状态颜色）
  - 统一按钮样式（Primary/Secondary/Danger）
- **Acceptance Criteria Addressed**: [NFR-4]
- **Test Requirements**:
  - `human-judgement` TR-12.1: 操作成功后右上角出现绿色成功提示
  - `human-judgement` TR-12.2: 加载时显示 loading 动画，按钮 disabled
  - `human-judgement` TR-12.3: 危险操作（如取消订单）前有确认弹窗
- **Notes**: 使用 React Context 管理 Toast 队列

## [ ] Task 13: 整体测试与修复
- **Priority**: P2
- **Depends On**: [Task 6, Task 8, Task 9, Task 10, Task 11, Task 12]
- **Description**: 
  - 端到端功能走查
  - 路由跳转正确性验证
  - 语言切换在所有页面生效验证
  - 主题切换在所有页面生效验证
  - 登录状态刷新页面保持验证
  - 响应式布局检查（窗口缩放）
  - 控制台无报错检查
- **Acceptance Criteria Addressed**: [All ACs]
- **Test Requirements**:
  - `programmatic` TR-13.1: npm run build 无 TypeScript 错误
  - `programmatic` TR-13.2: 刷新任意页面保持登录状态（若已登录）
  - `human-judgement` TR-13.3: 浏览器控制台无红色错误输出
- **Notes**: 建议在 Chrome/Firefox 两个浏览器下快速验证
