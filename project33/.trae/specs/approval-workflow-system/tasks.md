# 高校审批流管理系统 - The Implementation Plan (Decomposed and Prioritized Task List)

## [x] Task 1: 项目初始化与基础架构搭建
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 创建Next.js 14 + TypeScript项目基础结构
  - 配置NestJS后端项目结构
  - 配置PostgreSQL数据库连接和Prisma ORM
  - 配置ESLint、Prettier、Husky等代码规范工具
  - 搭建项目目录结构：frontend、backend、shared
- **Acceptance Criteria Addressed**: NFR-6, NFR-7
- **Test Requirements**:
  - `programmatic` TR-1.1: 项目成功启动，前后端服务正常运行
  - `programmatic` TR-1.2: 数据库连接成功，可执行基础CRUD操作
  - `human-judgement` TR-1.3: 目录结构清晰，符合模块化设计原则
- **Notes**: 使用Monorepo架构管理前后端代码

## [x] Task 2: 数据库设计与用户权限体系
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 设计核心数据表结构：用户、角色、权限、组织架构
  - 实现高校预置角色：学生、任课教师、辅导员、部门负责人、分管领导、教务处、财务处
  - 实现RBAC权限体系
  - 实现用户注册、登录、JWT认证
- **Acceptance Criteria Addressed**: FR-3, FR-4, FR-11
- **Test Requirements**:
  - `programmatic` TR-2.1: 用户登录成功，JWT token正确生成和验证
  - `programmatic` TR-2.2: 不同角色用户权限正确隔离
  - `programmatic` TR-2.3: 组织架构层级关系正确建立
- **Notes**: 组织架构包含校-院-部门三级，用户关联部门和角色信息

## [/] Task 3: 组织架构管理模块
- **Priority**: P0
- **Depends On**: Task 2
- **Description**: 
  - 实现学院、部门、岗位的增删改查
  - 实现用户组织架构分配
  - 实现上下级关系配置
  - 提供组织架构树状组件
- **Acceptance Criteria Addressed**: FR-3
- **Test Requirements**:
  - `programmatic` TR-3.1: 组织架构树状展示正确
  - `programmatic` TR-3.2: 用户部门岗位分配成功生效
  - `human-judgement` TR-3.3: 组织架构管理界面直观易用
- **Notes**: 支持批量导入用户和组织架构

## [x] Task 4: 可视化流程设计器 - 基础框架
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 集成React Flow实现画布基础功能
  - 实现节点拖拽添加功能
  - 实现节点位置拖拽调整
  - 实现节点之间连线功能
  - 实现节点删除、连线删除
- **Acceptance Criteria Addressed**: FR-1, AC-1
- **Test Requirements**:
  - `programmatic` TR-4.1: 节点可拖拽添加到画布任意位置
  - `programmatic` TR-4.2: 节点间连线成功建立和删除
  - `human-judgement` TR-4.3: 画布操作流畅，无明显卡顿
- **Notes**: React Flow为核心依赖，需做性能优化

## [ ] Task 5: 流程节点组件与配置面板
- **Priority**: P0
- **Depends On**: Task 4
- **Description**: 
  - 实现开始节点、结束节点
  - 实现审批节点组件
  - 实现条件分支节点组件
  - 实现节点配置侧边面板
  - 实现节点基本属性配置（名称、描述）
- **Acceptance Criteria Addressed**: FR-1, FR-2
- **Test Requirements**:
  - `programmatic` TR-5.1: 各类型节点正确渲染
  - `programmatic` TR-5.2: 节点配置可保存和回显
  - `human-judgement` TR-5.3: 配置面板布局合理
- **Notes**: 节点样式统一，支持主题定制

## [x] Task 6: 审批人配置模块
- **Priority**: P0
- **Depends On**: Task 3, Task 5
- **Description**: 
  - 实现按指定人员选择审批人
  - 实现按角色选择审批人
  - 实现按部门选择审批人
  - 实现按岗位选择审批人
  - 实现上下级（直属领导）选择审批人
  - 审批人配置与流程节点绑定
- **Acceptance Criteria Addressed**: FR-4, AC-4
- **Test Requirements**:
  - `programmatic` TR-6.1: 各种方式选择的审批人正确保存
  - `programmatic` TR-6.2: 流程实例化时审批人正确解析
  - `programmatic` TR-6.3: 学生提交时辅导员审批人正确匹配
- **Notes**: 支持多人会签、或签配置

## [/] Task 7: 流转逻辑配置
- **Priority**: P0
- **Depends On**: Task 5
- **Description**: 
  - 实现串行流转逻辑
  - 实现条件分支表达式配置
  - 实现分支条件优先级设置
  - 流转逻辑验证功能
- **Acceptance Criteria Addressed**: FR-2, AC-2, AC-3
- **Test Requirements**:
  - `programmatic` TR-7.1: 串行节点按顺序执行
  - `programmatic` TR-7.2: 满足条件的分支正确执行
  - `programmatic` TR-7.3: 流程闭环检测功能正常
- **Notes**: 条件表达式支持表单字段引用

## [ ] Task 8: 表单设计器模块
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 集成表单设计器，支持拖拽配置字段
  - 实现基础字段：文本、数字、日期、单选、多选、下拉
  - 实现高级字段：富文本、附件上传、人员选择、部门选择
  - 实现表单预览功能
- **Acceptance Criteria Addressed**: FR-5
- **Test Requirements**:
  - `programmatic` TR-8.1: 各类型字段正确渲染和编辑
  - `programmatic` TR-8.2: 表单数据正确提交和保存
  - `human-judgement` TR-8.3: 表单设计器操作直观
- **Notes**: 表单数据JSON Schema格式存储

## [ ] Task 9: 流程与表单绑定及权限控制
- **Priority**: P1
- **Depends On**: Task 7, Task 8
- **Description**: 
  - 实现流程与表单关联绑定
  - 实现各节点字段查看权限配置
  - 实现各节点字段编辑权限配置
  - 表单渲染时根据当前节点权限控制字段
- **Acceptance Criteria Addressed**: FR-6, AC-5
- **Test Requirements**:
  - `programmatic` TR-9.1: 流程与表单关联正确保存
  - `programmatic` TR-9.2: 无编辑权限的字段显示为只读
  - `programmatic` TR-9.3: 无查看权限的字段隐藏不显示
- **Notes**: 权限默认继承，可逐个节点覆盖

## [ ] Task 10: 流程发布与版本管理
- **Priority**: P1
- **Depends On**: Task 9
- **Description**: 
  - 实现流程设计校验（必填项、闭环、孤立节点检查）
  - 实现流程发布功能
  - 实现流程版本管理
  - 实现流程启用/停用控制
- **Acceptance Criteria Addressed**: FR-1
- **Test Requirements**:
  - `programmatic` TR-10.1: 有问题的流程发布前校验不通过
  - `programmatic` TR-10.2: 发布后的流程创建新实例使用新版本
  - `programmatic` TR-10.3: 历史版本可查看和回退
- **Notes**: 运行中的实例不受新版本影响

## [/] Task 11: 流程引擎核心 - 实例化与流转
- **Priority**: P0
- **Depends On**: Task 10
- **Description**: 
  - 实现流程实例创建
  - 实现审批人动态解析
  - 实现串行节点自动流转
  - 实现条件分支自动判断和流转
  - 实现流程状态管理
- **Acceptance Criteria Addressed**: AC-2, AC-3
- **Test Requirements**:
  - `programmatic` TR-11.1: 流程实例正确创建初始状态
  - `programmatic` TR-11.2: 审批通过后流转到下一节点
  - `programmatic` TR-11.3: 条件分支按表单数据正确跳转
- **Notes**: 流程引擎为核心模块，需充分测试

## [x] Task 12: 审批核心操作实现
- **Priority**: P0
- **Depends On**: Task 11
- **Description**: 
  - 实现审批同意功能
  - 实现审批驳回（可选择驳回节点）功能
  - 实现审批转交功能
  - 实现抄送功能
  - 实现加签功能
- **Acceptance Criteria Addressed**: FR-7, AC-6, AC-7
- **Test Requirements**:
  - `programmatic` TR-12.1: 同意操作后流程正确流转
  - `programmatic` TR-12.2: 驳回到指定节点后状态正确
  - `programmatic` TR-12.3: 转交后新审批人收到待办
- **Notes**: 转交时保留原审批人记录

## [/] Task 13: 流程日志与追溯
- **Priority**: P1
- **Depends On**: Task 12
- **Description**: 
  - 实现所有审批操作日志记录
  - 实现流程流转时间线展示
  - 实现操作人、操作时间、审批意见展示
  - 实现流程状态变更历史
- **Acceptance Criteria Addressed**: FR-8, AC-8
- **Test Requirements**:
  - `programmatic` TR-13.1: 每个审批操作都有日志记录
  - `programmatic` TR-13.2: 流程时间线按时间倒序展示
  - `human-judgement` TR-13.3: 日志展示清晰完整
- **Notes**: 日志不可篡改，永久保存

## [ ] Task 14: 我的审批工作台
- **Priority**: P1
- **Depends On**: Task 12
- **Description**: 
  - 实现我的待办列表
  - 实现我发起的流程列表
  - 实现我已审批的流程列表
  - 实现抄送我的流程列表
  - 实现流程详情查看
- **Acceptance Criteria Addressed**: FR-10, AC-10
- **Test Requirements**:
  - `programmatic` TR-14.1: 待办数量和列表正确
  - `programmatic` TR-14.2: 各分类列表数据准确
  - `human-judgement` TR-14.3: 工作台布局合理高效
- **Notes**: 支持按状态、时间、流程类型筛选

## [ ] Task 15: 流程模板库
- **Priority**: P2
- **Depends On**: Task 10
- **Description**: 
  - 预置学生请假流程模板
  - 预置调课申请流程模板
  - 预置经费报备流程模板
  - 预置校园报修流程模板
  - 实现模板一键启用功能
- **Acceptance Criteria Addressed**: FR-9, AC-9
- **Test Requirements**:
  - `programmatic` TR-15.1: 各预置模板数据完整正确
  - `programmatic` TR-15.2: 模板启用后生成可使用的流程
  - `human-judgement` TR-15.3: 模板分类展示清晰
- **Notes**: 模板支持导出导入

## [x] Task 16: 系统集成测试与优化
- **Priority**: P1
- **Depends On**: Task 14, Task 15
- **Description**: 
  - 端到端流程测试（学生请假完整流程）
  - 分支条件流转测试
  - 性能测试和优化
  - UI细节优化和用户体验提升
  - Bug修复和代码优化
- **Acceptance Criteria Addressed**: NFR-1, NFR-2, NFR-3
- **Test Requirements**:
  - `programmatic` TR-16.1: 完整流程无阻塞成功执行
  - `programmatic` TR-16.2: 页面加载和操作响应达标
  - `human-judgement` TR-16.3: 整体系统用户体验良好
- **Notes**: 重点测试边界情况和异常场景
