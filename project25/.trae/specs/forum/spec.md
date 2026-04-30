# 本地生活论坛网站 - 产品需求文档

## Overview
- **Summary**: 构建一个功能完善的本地生活论坛网站，支持用户发帖、多层级评论、Markdown内容、分类浏览、管理员后台管理等核心功能。
- **Purpose**: 为本地居民提供一个在线交流平台，讨论政治、经济、科技、民生等话题，同时提供完善的内容管理和审核机制。
- **Target Users**: 普通浏览用户、注册用户、超级管理员

## Goals
- 实现用户注册登录系统，支持游客浏览
- 支持发帖和多层级评论（评论可嵌套回复）
- 评论内容支持Markdown格式
- 实现帖子分类（政治、经济、科技、民生）
- 构建管理员后台，支持内容管理和敏感词设置

## Non-Goals (Out of Scope)
- 即时通讯功能
- 支付和交易功能
- 移动端APP开发（仅Web端）
- 用户等级和积分系统
- 帖子点赞和收藏功能

## Background & Context
- 项目为全新开发，无现有代码基础
- 采用现代Web技术栈构建
- 需要考虑内容安全和合规性要求

## Functional Requirements
- **FR-1**: 用户认证系统 - 支持游客浏览、用户注册登录、管理员后台登录
- **FR-2**: 发帖功能 - 登录用户可以发布新帖子
- **FR-3**: 多层级评论系统 - 用户可对帖子评论，可对评论进行多次回复
- **FR-4**: Markdown支持 - 评论内容支持Markdown格式渲染
- **FR-5**: 分类浏览 - 支持政治/经济/科技/民生四大分类切换
- **FR-6**: 管理员后台 - 超级管理员专用管理界面
- **FR-7**: 内容管理 - 管理员可删除帖子、删除评论、禁止帖子评论
- **FR-8**: 敏感词过滤 - 管理员可设置发帖和评论的敏感词过滤规则

## Non-Functional Requirements
- **NFR-1**: 页面响应时间 < 2秒
- **NFR-2**: 支持桌面端和移动端响应式布局
- **NFR-3**: 用户密码加密存储
- **NFR-4**: 后台操作有日志记录
- **NFR-5**: 敏感词检测在提交时实时生效

## Constraints
- **Technical**: 使用现代Web技术栈（前端React/Vue，后端Node.js/Python，数据库MySQL/PostgreSQL/MongoDB）
- **Business**: 内容需符合网络安全法规
- **Dependencies**: 无外部API强依赖，所有功能自主实现

## Assumptions
- 用户量初期较小，单台服务器可承载
- 管理员数量有限（1-5人）
- 敏感词数量在可管理范围内（< 1000条）

## Acceptance Criteria

### AC-1: 游客浏览权限
- **Given**: 用户未登录
- **When**: 用户访问论坛网站
- **Then**: 可以正常浏览所有帖子和评论内容
- **Verification**: `programmatic`

### AC-2: 用户登录发帖
- **Given**: 用户已注册并登录
- **When**: 用户提交新帖子表单
- **Then**: 帖子成功发布并显示在对应分类下
- **Verification**: `programmatic`

### AC-3: 多层级评论回复
- **Given**: 用户已登录且帖子存在
- **When**: 用户对帖子或已有评论发表回复
- **Then**: 评论以层级嵌套方式显示，支持无限层级
- **Verification**: `programmatic`

### AC-4: Markdown内容渲染
- **Given**: 用户发表包含Markdown语法的评论
- **When**: 评论发布后
- **Then**: Markdown语法被正确解析渲染为富文本
- **Verification**: `programmatic`

### AC-5: 分类切换功能
- **Given**: 用户在论坛首页
- **When**: 点击不同分类标签（政治/经济/科技/民生）
- **Then**: 帖子列表刷新显示对应分类的帖子
- **Verification**: `programmatic`

### AC-6: 管理员后台登录
- **Given**: 访问管理员登录页面
- **When**: 输入正确的管理员用户名和密码
- **Then**: 成功进入后台管理界面
- **Verification**: `programmatic`

### AC-7: 管理员删除帖子
- **Given**: 管理员已登录后台
- **When**: 点击删除帖子按钮并确认
- **Then**: 该帖子及其所有评论被彻底删除
- **Verification**: `programmatic`

### AC-8: 管理员删除评论
- **Given**: 管理员已登录后台
- **When**: 点击删除评论按钮并确认
- **Then**: 该评论及其所有子评论被删除
- **Verification**: `programmatic`

### AC-9: 禁止帖子评论
- **Given**: 管理员已登录后台
- **When**: 点击"禁止评论"开关
- **Then**: 普通用户无法对该帖子发表新评论
- **Verification**: `programmatic`

### AC-10: 敏感词设置与过滤
- **Given**: 管理员已登录后台
- **When**: 添加敏感词后，普通用户发表包含敏感词的内容
- **Then**: 内容发布被拦截并提示包含敏感词
- **Verification**: `programmatic`

## Open Questions
- [ ] 选择具体的技术栈（前端框架、后端语言、数据库类型）
- [ ] 是否需要用户邮箱验证
- [ ] 是否需要帖子审核机制
