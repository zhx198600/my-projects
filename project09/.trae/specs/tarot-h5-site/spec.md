# 塔罗牌H5网站 - Product Requirement Document

## Overview
- **Summary**: 开发一个塔罗牌H5互动网站，用户可以选择塔罗牌进行算命、性格分析和当日运势查询。网站采用响应式设计，兼容手机和iPad等主流移动设备，所有数据使用mock数据。
- **Purpose**: 提供一个交互性强、视觉美观的塔罗牌体验平台，让用户能够轻松获取个性化的塔罗解读。
- **Target Users**: 对塔罗牌和占卜感兴趣的普通用户，主要使用移动设备访问。

## Goals
- 提供塔罗牌抽取和算命功能
- 提供性格分析功能
- 提供当日运势功能
- 实现响应式设计，完美适配手机和iPad
- 使用mock数据实现完整的交互体验

## Non-Goals (Out of Scope)
- 不连接真实的塔罗数据库或API
- 不实现用户注册登录系统
- 不实现数据持久化（刷新页面即重置）
- 不实现付费功能
- 不实现多语言支持（仅中文）

## Background & Context
这是一个全新的前端项目，从0开始构建。项目将使用现代前端技术栈，重点关注移动端体验和视觉效果。

## Functional Requirements
- **FR-1**: 首页展示 - 提供三大功能入口（算命、性格分析、当日运势）
- **FR-2**: 塔罗牌选择/抽取 - 用户可以随机抽取或手动选择塔罗牌
- **FR-3**: 算命功能 - 根据选择的牌提供解读内容
- **FR-4**: 性格分析 - 根据选择的牌提供性格解读
- **FR-5**: 当日运势 - 提供每日运势分析（爱情、事业、财运等维度）
- **FR-6**: 牌面展示 - 展示22张大阿卡纳牌的精美图片和基本信息
- **FR-7**: 导航功能 - 支持页面间的顺畅切换

## Non-Functional Requirements
- **NFR-1**: 响应式设计 - 适配以下设备：
  - 手机：iPhone 8/11/12/14、Android主流机型（375px-414px宽度）
  - 平板：iPad mini/Air/Pro（768px-1024px宽度）
- **NFR-2**: 性能 - 首屏加载时间 < 3秒，页面切换动画流畅（60fps）
- **NFR-3**: 视觉体验 - 使用神秘、优雅的配色方案（深紫、深蓝、金色为主色调）
- **NFR-4**: 交互体验 - 所有按钮和可点击区域足够大（>44x44px），符合移动端设计规范
- **NFR-5**: 兼容性 - 支持 iOS Safari 14+ 和 Android Chrome 90+

## Constraints
- **Technical**: 前端项目，需选择合适的技术栈（Vue 3或React）
- **Business**: 所有数据为mock数据，无需后端支持
- **Dependencies**: 可能需要使用动画库（如GSAP或CSS动画）和图片资源

## Assumptions
- 用户使用现代移动浏览器访问网站
- 用户了解基本的塔罗牌概念
- 网络连接正常（用于加载图片资源）
- 使用 Vue 3 + Vite 作为技术栈

## Acceptance Criteria

### AC-1: 首页功能入口展示
- **Given**: 用户访问网站
- **When**: 首页加载完成
- **Then**: 清晰展示三大功能入口（算命、性格分析、当日运势），且每个入口都可点击进入
- **Verification**: `programmatic`
- **Notes**: 验证三个入口按钮存在且可点击

### AC-2: 塔罗牌选择/抽取功能
- **Given**: 用户进入任一功能页面
- **When**: 用户选择抽牌或选牌
- **Then**: 系统随机抽取3张牌（过去、现在、未来）或允许用户手动选择
- **Verification**: `programmatic`
- **Notes**: 验证抽牌动画和结果展示

### AC-3: 算命功能解读展示
- **Given**: 用户已抽取塔罗牌
- **When**: 用户查看算命结果
- **Then**: 展示过去、现在、未来三张牌的详细解读，包括牌意和综合分析
- **Verification**: `programmatic`
- **Notes**: 验证牌面信息和解读内容正确显示

### AC-4: 性格分析功能
- **Given**: 用户选择一张代表自己的牌
- **When**: 查看性格分析结果
- **Then**: 展示该牌对应的性格特点、优点、缺点、适合职业等内容
- **Verification**: `programmatic`

### AC-5: 当日运势功能
- **Given**: 用户进入当日运势页面
- **When**: 抽取运势牌
- **Then**: 展示今日整体运势评分，以及爱情、事业、财运、健康等细分维度的运势
- **Verification**: `programmatic`

### AC-6: 响应式布局 - 手机端
- **Given**: 用户使用手机访问（375px-414px宽度）
- **When**: 浏览所有页面
- **Then**: 布局适配手机屏幕，无横向滚动，按钮和文字大小适合手机操作
- **Verification**: `human-judgment`
- **Notes**: 在iPhone 8/12模拟器上测试

### AC-7: 响应式布局 - iPad端
- **Given**: 用户使用iPad访问（768px-1024px宽度）
- **When**: 浏览所有页面
- **Then**: 布局充分利用平板屏幕空间，组件大小和间距合理
- **Verification**: `human-judgment`
- **Notes**: 在iPad Air/Pro模拟器上测试

### AC-8: Mock数据完整性
- **Given**: 所有功能页面
- **When**: 用户使用各功能
- **Then**: 所有数据（牌面信息、解读内容、运势数据）均从mock数据中获取
- **Verification**: `programmatic`
- **Notes**: 验证无网络请求，数据来自本地

### AC-9: 页面导航顺畅
- **Given**: 用户在任意页面
- **When**: 点击返回或导航按钮
- **Then**: 页面切换流畅，无卡顿，状态正确
- **Verification**: `programmatic`

## Open Questions
- [ ] 技术栈是否确认使用Vue 3 + Vite？
- [ ] 是否需要提供翻牌动画效果？
- [ ] 22张大阿卡纳牌的图片资源是否需要自行生成？
- [ ] 每日运势是否需要按日期缓存？
