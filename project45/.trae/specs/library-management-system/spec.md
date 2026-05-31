# 图书借阅管理系统 - Product Requirement Document

## Overview
- **Summary**: 开发一个基于Web的图书借阅管理系统，支持图书管理、用户管理、借阅归还操作和借阅记录查询。系统采用RBAC（基于角色的访问控制）模型，支持管理员、普通用户和游客三种角色，不同角色具有不同的操作权限。
- **Purpose**: 为图书馆或小型图书室提供一个高效、易用的图书借阅管理解决方案，实现图书全生命周期管理和用户权限分级控制。
- **Target Users**: 图书管理员、借阅用户、访客

## Goals
- 实现图书信息的增删改查管理
- 实现用户账户的注册、登录和管理
- 实现图书的借阅和归还流程
- 实现借阅记录的查询和统计
- 实现基于角色的权限控制（管理员/普通用户/游客）

## Non-Goals (Out of Scope)
- 不实现移动端App（仅Web端）
- 不实现图书预约功能
- 不实现罚款计算和支付功能
- 不实现复杂的统计报表和数据可视化
- 不实现图书条形码扫描功能

## Background & Context
- 系统采用前后端分离架构，前端使用React，后端使用Node.js + Express
- 数据存储使用SQLite数据库，轻量级且易于部署
- 使用JWT进行用户认证和权限验证
- 项目从零开始构建，无历史代码依赖

## Functional Requirements
- **FR-1**: 图书管理 - 管理员可以录入、编辑、删除图书信息
- **FR-2**: 图书浏览 - 所有用户（包括游客）可以浏览图书目录和详情
- **FR-3**: 用户注册登录 - 用户可以注册账户并登录系统
- **FR-4**: 用户管理 - 管理员可以查看和管理用户列表
- **FR-5**: 图书借阅 - 普通用户可以借阅可借图书
- **FR-6**: 图书归还 - 普通用户可以归还已借图书
- **FR-7**: 借阅记录查询 - 用户可以查看自己的借阅记录，管理员可以查看所有记录
- **FR-8**: 权限控制 - 根据用户角色限制可访问的功能和操作

## Non-Functional Requirements
- **NFR-1**: 响应式设计，支持桌面和移动浏览器访问
- **NFR-2**: 系统响应时间 < 2秒（常规操作）
- **NFR-3**: 密码使用bcrypt加密存储
- **NFR-4**: 前端使用TypeScript确保类型安全
- **NFR-5**: 代码结构清晰，便于维护和扩展

## Constraints
- **Technical**: 前端使用React + TypeScript + Vite，后端使用Node.js + Express + SQLite，不使用ORM框架
- **Business**: 项目为学习和演示用途，无严格的时间和预算限制
- **Dependencies**: 需要安装Node.js环境和npm包管理器

## Assumptions
- 用户使用现代浏览器（Chrome、Firefox、Safari、Edge）访问系统
- 图书库存数量初始化为1，同一时间同一本图书只能被一个用户借阅
- 所有用户注册后默认为普通用户角色，管理员角色由系统预置
- 借阅无期限限制，用户可随时归还

## Acceptance Criteria

### AC-1: 图书录入功能
- **Given**: 管理员已登录系统
- **When**: 管理员填写图书信息（书名、作者、ISBN、分类、简介）并提交
- **Then**: 图书信息保存到数据库，图书列表中显示新录入的图书
- **Verification**: `programmatic`

### AC-2: 图书删除功能
- **Given**: 管理员已登录系统，图书存在且未被借阅
- **When**: 管理员点击删除按钮并确认
- **Then**: 图书从数据库中删除，图书列表不再显示该图书
- **Verification**: `programmatic`

### AC-3: 图书浏览功能
- **Given**: 任何用户（包括游客）访问系统
- **When**: 用户查看图书列表或点击某本图书
- **Then**: 显示图书列表或图书详情信息，无需登录
- **Verification**: `programmatic`

### AC-4: 用户注册功能
- **Given**: 访客访问注册页面
- **When**: 用户填写用户名、密码、邮箱并提交
- **Then**: 账户创建成功，用户角色默认为普通用户
- **Verification**: `programmatic`

### AC-5: 用户登录功能
- **Given**: 用户已注册账户
- **When**: 用户输入正确的用户名和密码并提交
- **Then**: 登录成功，返回JWT token，用户信息存储在前端
- **Verification**: `programmatic`

### AC-6: 图书借阅功能
- **Given**: 普通用户已登录，图书库存 > 0
- **When**: 用户点击借阅按钮
- **Then**: 借阅记录创建，图书库存减1，用户借阅列表显示该图书
- **Verification**: `programmatic`

### AC-7: 图书归还功能
- **Given**: 普通用户已登录，该用户有已借阅的图书
- **When**: 用户点击归还按钮
- **Then**: 借阅记录更新为已归还，图书库存加1
- **Verification**: `programmatic`

### AC-8: 借阅记录查询功能
- **Given**: 用户已登录
- **When**: 用户访问借阅记录页面
- **Then**: 普通用户看到自己的借阅记录，管理员看到所有用户的借阅记录
- **Verification**: `programmatic`

### AC-9: 游客权限控制
- **Given**: 用户未登录（游客身份）
- **When**: 用户尝试进行借阅、归还、管理等操作
- **Then**: 系统提示需要登录，或相关操作按钮不可见
- **Verification**: `programmatic`

### AC-10: 普通用户权限控制
- **Given**: 普通用户已登录
- **When**: 用户尝试访问管理员功能（如图书录入、用户管理）
- **Then**: 系统提示权限不足，或相关功能入口不可见
- **Verification**: `programmatic`

### AC-11: 管理员权限控制
- **Given**: 管理员已登录
- **When**: 管理员访问图书管理、用户管理等功能
- **Then**: 可以正常访问并执行相关操作
- **Verification**: `programmatic`

### AC-12: UI用户体验
- **Given**: 用户访问系统
- **When**: 用户进行各种操作
- **Then**: 界面美观、交互流畅、有明确的操作反馈和错误提示
- **Verification**: `human-judgment`

## Open Questions
- [ ] 是否需要支持图书分类管理？
- [ ] 是否需要支持图书搜索和筛选功能？
- [ ] 是否需要限制单个用户最大借阅数量？
- [ ] 是否需要借阅到期提醒功能？
