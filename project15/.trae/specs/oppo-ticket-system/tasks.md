# OPPO 工单管理系统 - The Implementation Plan (Decomposed and Prioritized Task List)

## [x] Task 1: Django 项目初始化
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 创建 Django 项目结构
  - 配置项目设置（数据库、静态文件、模板路径等）
  - 创建 `tickets` Django App 用于工单管理
  - 配置 URL 路由基础结构
- **Acceptance Criteria Addressed**: [AC-1]
- **Test Requirements**:
  - `programmatic` TR-1.1: Django 项目可成功启动（runserver 无错误）
  - `programmatic` TR-1.2: 项目配置文件 settings.py 包含 SQLite 数据库配置
  - `programmatic` TR-1.3: tickets app 已注册到 INSTALLED_APPS
- **Notes**: 使用 Django 4.2 LTS 版本

## [x] Task 2: 数据模型设计与迁移
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 设计并创建以下数据模型：
    1. **TicketType** - 工单类型（投诉、故障返修等7类）
    2. **CustomField** - 自定义字段配置（字段名、控件类型、选项等）
    3. **Ticket** - 工单主表（公共字段）
    4. **TicketFieldValue** - 工单自定义字段值存储
    5. **TransferRecord** - 转派记录
    6. **EditHistory** - 编辑历史记录
  - 定义模型字段类型和关系
  - 生成并执行数据库迁移
- **Acceptance Criteria Addressed**: [AC-2, AC-3, AC-4]
- **Test Requirements**:
  - `programmatic` TR-2.1: 数据库迁移成功执行（migrate 无错误）
  - `programmatic` TR-2.2: 7种工单类型数据已初始化
  - `programmatic` TR-2.3: Ticket 模型包含所有公共字段
  - `programmatic` TR-2.4: CustomField 模型支持 input/select/textarea 三种控件类型
- **Notes**: 工单编号使用自增主键或 UUID，建议用格式如 OPPO-YYYYMMDD-XXXX

## [/] Task 3: 用户认证与登录系统
- **Priority**: P0
- **Depends On**: Task 1, Task 2
- **Description**: 
  - 创建登录页面，展示"超级管理员"角色选择
  - 实现简单的会话登录机制（无需用户密码，选择角色即可登录）
  - 创建登录视图和 URL 路由
  - 实现登录状态检查和重定向
- **Acceptance Criteria Addressed**: [AC-1]
- **Test Requirements**:
  - `programmatic` TR-3.1: 访问登录页面显示超级管理员选项
  - `programmatic` TR-3.2: 选择角色并登录后成功跳转首页
  - `programmatic` TR-3.3: 未登录访问工单页面重定向到登录页
- **Notes**: 简化设计，采用会话机制标记登录状态

## [/] Task 4: 工单列表功能
- **Priority**: P0
- **Depends On**: Task 2, Task 3
- **Description**: 
  - 创建工单列表视图和模板
  - 实现工单数据查询和展示
  - 实现按工单类型、状态、紧急程度筛选功能
  - 实现按创建时间排序
  - 列表显示字段：工单编号、工单类型、用户姓名、联系方式、状态、紧急程度、创建时间、操作（查看/编辑）
- **Acceptance Criteria Addressed**: [AC-6]
- **Test Requirements**:
  - `programmatic` TR-4.1: 工单列表页面正确显示所有公共字段
  - `programmatic` TR-4.2: 按工单类型筛选正确过滤结果
  - `programmatic` TR-4.3: 按状态筛选正确过滤结果
  - `programmatic` TR-4.4: 按紧急程度筛选正确过滤结果
- **Notes**: 使用 Django ORM 进行查询和过滤

## [/] Task 5: 工单新建功能 - 表单动态生成
- **Priority**: P0
- **Depends On**: Task 2, Task 3
- **Description**: 
  - 创建工单类型选择页面（选择要创建的工单类型）
  - 实现动态表单生成：
    - 公共字段（固定）
    - 根据工单类型加载对应的自定义字段配置
    - 根据控件类型（input/select/textarea）渲染不同的表单控件
  - 创建表单验证逻辑
- **Acceptance Criteria Addressed**: [AC-3, AC-4]
- **Test Requirements**:
  - `programmatic` TR-5.1: 不同工单类型显示对应的自定义字段
  - `programmatic` TR-5.2: 下拉框类型字段正确显示选项
  - `programmatic` TR-5.3: 必填字段验证生效
- **Notes**: 使用 Django Form 或 Formset 动态生成表单

## [x] Task 6: 工单新建功能 - 数据保存
- **Priority**: P0
- **Depends On**: Task 5
- **Description**: 
  - 创建工单保存视图
  - 实现公共字段数据保存到 Ticket 表
  - 实现自定义字段值保存到 TicketFieldValue 表
  - 生成工单编号
  - 保存成功后跳转到详情页或列表页
- **Acceptance Criteria Addressed**: [AC-5]
- **Test Requirements**:
  - `programmatic` TR-6.1: 提交表单后工单数据正确保存
  - `programmatic` TR-6.2: 自定义字段值正确关联到工单
  - `programmatic` TR-6.3: 工单编号唯一且格式正确
- **Notes**: 在保存时记录创建时间和受理人（当前登录用户）

## [ ] Task 7: 工单详情查看功能
- **Priority**: P0
- **Depends On**: Task 2, Task 3
- **Description**: 
  - 创建工单详情视图和模板
  - 显示公共字段信息
  - 显示自定义字段值
  - 显示转派记录历史
  - 显示编辑历史记录
  - 提供编辑按钮
- **Acceptance Criteria Addressed**: [AC-9]
- **Test Requirements**:
  - `programmatic` TR-7.1: 详情页正确显示所有公共字段值
  - `programmatic` TR-7.2: 详情页正确显示自定义字段值
  - `programmatic` TR-7.3: 转派记录列表正确显示
  - `programmatic` TR-7.4: 编辑历史列表正确显示
- **Notes**: 转派记录和编辑历史按时间倒序显示

## [ ] Task 8: 工单编辑功能
- **Priority**: P0
- **Depends On**: Task 5, Task 7
- **Description**: 
  - 创建工单编辑视图和模板
  - 加载现有工单数据（公共字段 + 自定义字段）
  - 实现编辑后的数据保存
  - 记录编辑历史（EditHistory）
  - 当处理人/处理部门变更时记录转派记录（TransferRecord）
- **Acceptance Criteria Addressed**: [AC-7, AC-8]
- **Test Requirements**:
  - `programmatic` TR-8.1: 编辑页面正确加载现有数据
  - `programmatic` TR-8.2: 修改保存后数据正确更新
  - `programmatic` TR-8.3: 编辑历史记录被创建
  - `programmatic` TR-8.4: 处理人变更时转派记录被创建
- **Notes**: 比较变更前后的值，只记录有变化的字段

## [/] Task 9: 自定义字段配置与初始化
- **Priority**: P1
- **Depends On**: Task 2
- **Description**: 
  - 为7种工单类型设计并创建示例自定义字段配置
  - 投诉类型：投诉内容（文本域）、投诉产品（下拉框）
  - 故障返修：故障现象（文本域）、产品型号（输入框）、购买日期（输入框）
  - 建议：建议内容（文本域）
  - 报表问题：报表名称（输入框）、问题描述（文本域）
  - 平台功能异常：功能模块（下拉框）、异常描述（文本域）
  - 检测：检测项目（下拉框）、检测要求（文本域）
  - 预约上门服务：预约时间（输入框）、服务地址（文本域）
  - 创建数据迁移或初始化脚本
- **Acceptance Criteria Addressed**: [AC-4]
- **Test Requirements**:
  - `programmatic` TR-9.1: 每种工单类型至少有一个自定义字段
  - `programmatic` TR-9.2: 三种控件类型（input/select/textarea）都被使用
  - `programmatic` TR-9.3: 下拉框类型字段有配置选项值
- **Notes**: 可以在 migrations 中使用 RunPython 初始化数据

## [ ] Task 10: 导航栏与基础布局
- **Priority**: P1
- **Depends On**: Task 3
- **Description**: 
  - 创建基础模板（base.html）包含导航栏
  - 导航栏包含：系统名称、首页（工单列表）、新建工单、用户信息
  - 实现模板继承
  - 添加基础 CSS 样式
- **Acceptance Criteria Addressed**: [AC-1]
- **Test Requirements**:
  - `human-judgement` TR-10.1: 所有页面使用统一的导航栏样式
  - `human-judgement` TR-10.2: 导航链接可正确跳转
- **Notes**: 使用简单的 CSS 或 Bootstrap 基础样式

## [ ] Task 11: 测试与验证
- **Priority**: P2
- **Depends On**: Task 4, Task 6, Task 7, Task 8
- **Description**: 
  - 创建 Django 测试用例测试核心功能
  - 测试工单创建、查询、编辑流程
  - 测试转派记录和编辑历史的创建
  - 运行 Django 开发服务器进行手动测试
- **Acceptance Criteria Addressed**: [AC-5, AC-6, AC-7, AC-8, AC-9]
- **Test Requirements**:
  - `programmatic` TR-11.1: 所有 Django 测试用例通过
  - `programmatic` TR-11.2: 开发服务器可正常启动
  - `human-judgement` TR-11.3: 手动验证完整工单流程（新建->查看->编辑->再查看）
- **Notes**: 测试数据可通过 Django Admin 或 fixtures 创建
