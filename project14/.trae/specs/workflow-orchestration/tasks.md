# 流程编排平台 - The Implementation Plan (Decomposed and Prioritized Task List)

## [x] Task 1: 项目初始化和基础架构
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 使用Vite + React + TypeScript初始化项目
  - 配置项目目录结构 (src/pages, src/components, src/types, src/data, src/hooks)
  - 配置基础依赖（可选：Tailwind CSS 或 Ant Design作为UI库）
  - 配置路由 (React Router)
- **Acceptance Criteria Addressed**: [AC-1, AC-10]
- **Test Requirements**:
  - `programmatic` TR-1.1: 项目可以成功启动
  - `programmatic` TR-1.2: TypeScript编译无错误
  - `human-judgement` TR-1.3: 目录结构符合规范，页面路由正常工作
- **Notes**: 建议使用Tailwind CSS，轻量且灵活

## [x] Task 2: 定义类型系统和Mock数据
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 定义核心类型：Role (部门经理, 财务, 总经理), ApprovalStatus (pending, approved, rejected, completed), ApprovalNode, ApprovalRecord, Application
  - 定义节点类型：DepartmentManagerNode, FinanceNode, GeneralManagerNode
  - 创建初始Mock数据：3-5个示例申请，包含不同审批状态
  - 实现Mock数据生成器，支持创建新申请
- **Acceptance Criteria Addressed**: [AC-2, AC-3, AC-10]
- **Test Requirements**:
  - `programmatic` TR-2.1: 类型定义完整，没有any类型
  - `programmatic` TR-2.2: Mock数据包含所有必要字段
  - `programmatic` TR-2.3: 可以生成新的申请数据
- **Notes**: 设计数据结构时考虑流程流转的可扩展性

## [x] Task 3: 实现状态管理和Context
- **Priority**: P0
- **Depends On**: Task 2
- **Description**: 
  - 创建 ApprovalContext 管理全局状态（当前角色、申请列表）
  - 实现角色切换逻辑
  - 实现核心业务方法：
    - switchRole(role): 切换当前角色
    - getApplicationsByRole(): 根据角色过滤可见的申请
    - approveApplication(appId, comment): 同意操作
    - rejectApplication(appId, comment): 驳回操作
    - ccApplication(appId, roles): 抄送操作
    - createApplication(data): 创建新申请
- **Acceptance Criteria Addressed**: [AC-1, AC-4, AC-5, AC-9, AC-10]
- **Test Requirements**:
  - `programmatic` TR-3.1: 角色切换后，getApplicationsByRole返回正确过滤的数据
  - `programmatic` TR-3.2: approveApplication正确推进流程到下一节点
  - `programmatic` TR-3.3: rejectApplication正确设置流程为已驳回并结束
  - `programmatic` TR-3.4: createApplication正确创建新申请并设置初始状态
- **Notes**: 使用React Context + useReducer，避免过度使用第三方状态管理库

## [x] Task 4: 实现角色切换组件和布局
- **Priority**: P0
- **Depends On**: Task 3
- **Description**: 
  - 创建顶部导航栏/Header组件
  - 实现角色切换下拉框（显示当前角色，可切换）
  - 实现应用标题和基础布局（侧边栏可选）
  - 创建App壳组件，包含路由Outlet和Header
- **Acceptance Criteria Addressed**: [AC-1]
- **Test Requirements**:
  - `programmatic` TR-4.1: 角色切换触发状态更新
  - `human-judgement` TR-4.2: 界面布局清晰，角色切换入口明显
  - `programmatic` TR-4.3: 路由Outlet正确渲染子页面
- **Notes**: 保持UI简洁，突出当前角色信息

## [x] Task 5: 实现申请列表页面
- **Priority**: P0
- **Depends On**: Task 4
- **Description**: 
  - 创建 ApplicationsListPage 页面
  - 实现申请卡片/表格组件
  - 显示字段：标题、金额、创建时间、当前状态、当前节点
  - 添加"发起新申请"按钮
  - 添加"抄送我的"标签页（可选，展示抄送的申请）
  - 根据当前角色过滤显示的申请
- **Acceptance Criteria Addressed**: [AC-2, AC-6, AC-7]
- **Test Requirements**:
  - `programmatic` TR-5.1: 部门经理角色看到所有待审批申请
  - `programmatic` TR-5.2: 财务角色只看到部门经理已同意的申请
  - `programmatic` TR-5.3: 总经理角色只看到财务已同意的申请
  - `human-judgement` TR-5.4: 列表信息展示完整，状态标识清晰
- **Notes**: 使用状态标签（待审批/已同意/已驳回/已完成）增强可视化

## [x] Task 6: 实现流程详情页面
- **Priority**: P0
- **Depends On**: Task 5
- **Description**: 
  - 创建 ApplicationDetailPage 页面
  - 实现流程节点可视化组件（时间线/流程图形式）
  - 展示申请基本信息（标题、金额、说明、创建时间）
  - 展示每个节点的审批状态和意见
  - 高亮当前待审批节点
- **Acceptance Criteria Addressed**: [AC-3]
- **Test Requirements**:
  - `human-judgement` TR-6.1: 流程节点可视化清晰，展示三节点串行关系
  - `programmatic` TR-6.2: 节点状态（待审批/已同意/已驳回）正确显示
  - `human-judgement` TR-6.3: 当前待审批节点有明显高亮
- **Notes**: 建议使用时间线或垂直流程图展示三节点（部门经理->财务->总经理）

## [x] Task 7: 实现审批操作组件
- **Priority**: P0
- **Depends On**: Task 6
- **Description**: 
  - 创建 ApprovalActions 组件
  - 实现"同意"按钮和模态框（输入审批意见）
  - 实现"驳回"按钮和模态框（输入驳回意见）
  - 实现"抄送"按钮和模态框（选择抄送角色）
  - 只有当前节点的角色才能看到操作按钮
  - 操作后刷新页面数据并显示成功提示
- **Acceptance Criteria Addressed**: [AC-4, AC-5, AC-8, AC-9]
- **Test Requirements**:
  - `programmatic` TR-7.1: 非当前节点角色看不到操作按钮
  - `programmatic` TR-7.2: 同意操作后流程推进到下一节点（部门经理->财务->总经理->完成）
  - `programmatic` TR-7.3: 驳回操作后流程状态为已驳回
  - `programmatic` TR-7.4: 抄送操作后被抄送角色在抄送列表中可见
  - `programmatic` TR-7.5: 总经理同意后流程状态为已完成
- **Notes**: 操作前添加确认弹窗，避免误操作

## [x] Task 8: 实现发起申请页面
- **Priority**: P0
- **Depends On**: Task 5
- **Description**: 
  - 创建 CreateApplicationPage 页面
  - 实现表单组件：标题（必填）、金额（必填，数字）、说明（可选，多行文本）
  - 实现表单验证
  - 实现提交功能（调用Context方法）
  - 提交成功后跳转回列表页并显示成功提示
- **Acceptance Criteria Addressed**: [AC-10]
- **Test Requirements**:
  - `programmatic` TR-8.1: 空标题提交失败，显示验证错误
  - `programmatic` TR-8.2: 金额必须为正数，否则验证失败
  - `programmatic` TR-8.3: 提交成功后创建的申请状态为"待审批"，当前节点为部门经理
  - `programmatic` TR-8.4: 提交成功后正确跳转
- **Notes**: 表单UI简洁明了，提示信息友好

## [x] Task 9: 整体集成和UI优化
- **Priority**: P1
- **Depends On**: Task 8
- **Description**: 
  - 统一组件样式和交互风格
  - 添加loading状态和空状态展示
  - 添加成功/错误提示（Toast）
  - 优化移动端适配（可选）
  - 添加少量mock数据默认展示
- **Acceptance Criteria Addressed**: [AC-1, AC-2, AC-3]
- **Test Requirements**:
  - `human-judgement` TR-9.1: 整体UI风格统一，视觉效果良好
  - `programmatic` TR-9.2: 空列表时有友好提示
  - `human-judgement` TR-9.3: 操作反馈及时且清晰
- **Notes**: 关注用户体验细节，如按钮点击反馈、过渡动画等

## [x] Task 10: 端到端场景测试
- **Priority**: P1
- **Depends On**: Task 9
- **Description**: 
  - 测试完整审批流程：发起申请 -> 部门经理同意 -> 财务同意 -> 总经理同意 -> 完成
  - 测试驳回场景：发起申请 -> 部门经理驳回 -> 流程结束
  - 测试抄送功能：审批时抄送其他角色
  - 测试角色视角隔离：不同角色看到的数据不同
- **Acceptance Criteria Addressed**: [AC-1, AC-4, AC-5, AC-6, AC-7, AC-8, AC-9, AC-10]
- **Test Requirements**:
  - `programmatic` TR-10.1: 完整流程走通，三节点依次审批后状态变为已完成 ✅
  - `programmatic` TR-10.2: 任意节点驳回后，流程不再继续推进 ✅
  - `programmatic` TR-10.3: 财务看不到部门经理未同意的申请 ✅ (部门经理看到6条，财务看到3条)
  - `programmatic` TR-10.4: 总经理看不到财务未同意的申请 ✅ (总经理看到2条)
- **Notes**: 所有测试通过，业务逻辑正确
