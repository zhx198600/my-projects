# 塔罗牌H5网站 - The Implementation Plan (Decomposed and Prioritized Task List)

## [x] Task 1: 项目初始化与基础配置
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 使用 Vite + Vue 3 初始化项目
  - 配置 CSS 预处理器（SCSS）
  - 配置移动端viewport和基础样式
  - 配置响应式断点（375px, 768px, 1024px）
  - 安装必要依赖：Vue Router、SCSS
- **Acceptance Criteria Addressed**: [AC-6, AC-7, AC-9]
- **Test Requirements**:
  - `programmatic` TR-1.1: 项目可成功启动 `npm run dev`
  - `programmatic` TR-1.2: viewport meta标签正确配置
  - `human-judgement` TR-1.3: 基础CSS重置完成，无默认样式干扰
- **Notes**: 推荐使用 Vue 3 <script setup> 语法

## [x] Task 2: Mock数据结构设计与实现
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 设计22张大阿卡纳牌数据结构（名称、编号、正位/逆位含义、元素、星座关联等）
  - 设计算命解读数据结构（过去/现在/未来三张牌的组合解读）
  - 设计性格分析数据结构（每张牌对应的性格特点、优点、缺点、适合职业）
  - 设计当日运势数据结构（整体评分、爱情/事业/财运/健康细分维度）
  - 创建 mock 数据文件，填充完整的中文内容
- **Acceptance Criteria Addressed**: [AC-3, AC-4, AC-5, AC-8]
- **Test Requirements**:
  - `programmatic` TR-2.1: 22张大阿卡纳牌数据完整，包含所有必要字段
  - `programmatic` TR-2.2: 性格分析数据覆盖所有22张牌
  - `programmatic` TR-2.3: 运势数据结构包含至少4个维度
  - `human-judgement` TR-2.4: 数据内容通顺合理，符合塔罗牌基本含义
- **Notes**: 参考经典韦特塔罗牌含义进行mock数据编写

## [x] Task 3: 塔罗牌图片资源准备
- **Priority**: P0
- **Depends On**: Task 2
- **Description**: 
  - 设计或生成22张大阿卡纳牌的图片（使用指定图片生成API）
  - 创建牌背图片（神秘风格）
  - 准备背景图和装饰元素图片
  - 优化图片大小，确保移动端加载性能
- **Acceptance Criteria Addressed**: [AC-2, AC-3, NFR-2]
- **Test Requirements**:
  - `programmatic` TR-3.1: 22张牌面图片 + 1张牌背图片都存在
  - `programmatic` TR-3.2: 所有图片单张大小不超过500KB
  - `human-judgement` TR-3.3: 图片风格统一，视觉效果符合神秘主题
- **Notes**: 使用项目要求的图片生成API：`https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image`

## [x] Task 4: 路由配置与页面骨架
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 配置 Vue Router，定义以下路由：
    - `/` - 首页
    - `/fortune-telling` - 算命页面
    - `/personality` - 性格分析页面
    - `/daily-fortune` - 当日运势页面
  - 创建页面组件骨架（Home, FortuneTelling, Personality, DailyFortune）
  - 实现导航栏组件（顶部返回按钮，页面标题）
- **Acceptance Criteria Addressed**: [AC-1, AC-9]
- **Test Requirements**:
  - `programmatic` TR-4.1: 所有路由可正确跳转
  - `programmatic` TR-4.2: 页面组件已创建且可渲染
  - `human-judgement` TR-4.3: 导航栏在所有页面都正确显示
- **Notes**: 使用编程式导航进行页面切换

## [x] Task 5: 首页实现 - 功能入口
- **Priority**: P0
- **Depends On**: Task 4, Task 3
- **Description**: 
  - 实现神秘风格的首页背景和装饰元素
  - 创建三大功能入口卡片组件：
    - 塔罗算命（抽取3张牌解读过去现在未来）
    - 性格分析（选择一张牌了解你的性格）
    - 当日运势（查看今日各维度运势）
  - 实现卡片悬停/点击动画效果
  - 添加塔罗牌主题的视觉元素（星星、月亮、神秘符号等）
- **Acceptance Criteria Addressed**: [AC-1, AC-6, AC-7]
- **Test Requirements**:
  - `programmatic` TR-5.1: 三个功能入口可点击并跳转到对应页面
  - `programmatic` TR-5.2: 页面在375px宽度下布局正常
  - `human-judgement` TR-5.3: 整体视觉风格统一，符合神秘塔罗主题
- **Notes**: 首页是用户第一印象，重点关注视觉效果

## [x] Task 6: 抽牌组件实现 - 通用组件
- **Priority**: P0
- **Depends On**: Task 2, Task 3
- **Description**: 
  - 创建通用的抽牌组件 CardDraw.vue
  - 实现牌背展示效果
  - 实现翻牌动画效果（CSS transition/animation）
  - 实现随机抽取功能（从22张牌中随机抽取N张）
  - 实现手动选择功能（展示牌面让用户选择）
  - 支持配置抽牌数量（1张或3张）
- **Acceptance Criteria Addressed**: [AC-2, AC-8]
- **Test Requirements**:
  - `programmatic` TR-6.1: 抽牌组件可渲染，牌背显示正确
  - `programmatic` TR-6.2: 随机抽牌逻辑覆盖所有22张牌
  - `programmatic` TR-6.3: 翻牌动画执行成功，正位/逆位随机
  - `human-judgement` TR-6.4: 翻牌动画流畅自然，视觉效果好
- **Notes**: 这个组件会被多个页面复用，设计为通用组件

## [x] Task 7: 算命功能页面实现
- **Priority**: P1
- **Depends On**: Task 6, Task 2
- **Description**: 
  - 集成抽牌组件（抽取3张牌）
  - 实现抽牌引导文案和步骤提示
  - 展示抽牌结果：过去、现在、未来三张牌
  - 显示每张牌的正位/逆位含义
  - 显示三张牌的综合解读（mock组合解读数据）
  - 实现"再抽一次"按钮
- **Acceptance Criteria Addressed**: [AC-2, AC-3, AC-8]
- **Test Requirements**:
  - `programmatic` TR-7.1: 可成功抽取3张牌并显示
  - `programmatic` TR-7.2: 每张牌显示正位/逆位和对应含义
  - `programmatic` TR-7.3: "再抽一次"按钮可重新抽牌
  - `human-judgement` TR-7.4: 解读内容排版清晰，易于阅读
- **Notes**: 过去现在未来是经典的牌阵

## [x] Task 8: 性格分析功能页面实现
- **Priority**: P1
- **Depends On**: Task 6, Task 2
- **Description**: 
  - 集成抽牌组件（抽取1张牌或手动选择）
  - 实现引导：选择一张代表你性格的牌
  - 展示抽牌/选牌结果
  - 显示性格解读：
    - 性格关键词
    - 优点分析
    - 缺点分析
    - 适合的职业类型
    - 人际关系建议
  - 实现"重新选择"按钮
- **Acceptance Criteria Addressed**: [AC-2, AC-4, AC-8]
- **Test Requirements**:
  - `programmatic` TR-8.1: 可抽取/选择1张牌
  - `programmatic` TR-8.2: 性格分析的5个维度都有数据展示
  - `programmatic` TR-8.3: "重新选择"按钮功能正常
  - `human-judgement` TR-8.4: 内容分区清晰，阅读体验好
- **Notes**: 提供手动选牌功能会让用户更有参与感

## [ ] Task 9: 当日运势功能页面实现
- **Priority**: P1
- **Depends On**: Task 6, Task 2
- **Description**: 
  - 集成抽牌组件（抽取1张运势牌）
  - 显示今日日期
  - 展示整体运势评分（0-100分）和简短评语
  - 展示细分维度运势：
    - 爱情运势（评分+简短解读）
    - 事业运势（评分+简短解读）
    - 财运运势（评分+简短解读）
    - 健康运势（评分+简短解读）
  - 实现"查看明日运势"按钮（重新抽牌模拟）
- **Acceptance Criteria Addressed**: [AC-2, AC-5, AC-8]
- **Test Requirements**:
  - `programmatic` TR-9.1: 运势牌可抽取并显示
  - `programmatic` TR-9.2: 整体评分和4个细分维度都显示数据
  - `programmatic` TR-9.3: 日期显示正确
  - `human-judgement` TR-9.4: 各维度使用进度条或图标展示更直观
- **Notes**: 运势评分可以根据牌的正逆位和牌义mock生成

## [ ] Task 10: 响应式适配完善
- **Priority**: P1
- **Depends On**: Task 5, Task 7, Task 8, Task 9
- **Description**: 
  - 完善手机端（375px-414px）布局优化
    - 字体大小适配
    - 按钮和可点击区域大小保证（>44px）
    - 间距调整适配小屏幕
  - 完善iPad端（768px-1024px）布局优化
    - 合理利用大屏幕空间
    - 可能需要两列布局展示内容
    - 字体和元素大小调整
  - 测试横竖屏切换
- **Acceptance Criteria Addressed**: [AC-6, AC-7, NFR-4]
- **Test Requirements**:
  - `human-judgement` TR-10.1: 在iPhone 8(375px)下所有页面布局正常
  - `human-judgement` TR-10.2: 在iPhone 12(390px)下所有页面布局正常
  - `human-judgement` TR-10.3: 在iPad Air(820px)下所有页面布局正常
  - `human-judgement` TR-10.4: 横竖屏切换后布局正确
  - `programmatic` TR-10.5: 所有可点击按钮大小 >= 44x44px
- **Notes**: 使用 Chrome DevTools 的设备模拟器进行测试

## [x] Task 11: 动画与交互优化
- **Priority**: P2
- **Depends On**: Task 10
- **Description**: 
  - 页面切换动画
  - 按钮点击反馈动画
  - 卡片悬浮效果
  - 星空/星光背景动画效果（可选）
  - 加载状态和骨架屏
- **Acceptance Criteria Addressed**: [NFR-2, NFR-3]
- **Test Requirements**:
  - `human-judgement` TR-11.1: 页面切换动画流畅
  - `human-judgement` TR-11.2: 按钮点击有明显反馈
  - `programmatic` TR-11.3: 无卡顿掉帧现象（可选通过性能测试）
- **Notes**: 优先使用 CSS 动画而非 JS 动画以获得更好性能

## [ ] Task 12: 整体测试与修复
- **Priority**: P0
- **Depends On**: Task 11
- **Description**: 
  - 功能回归测试
  - 响应式测试（多设备）
  - Mock数据完整性检查
  - 修复发现的bug
- **Acceptance Criteria Addressed**: [所有AC]
- **Test Requirements**:
  - `programmatic` TR-12.1: 所有主要流程可完整走通
  - `human-judgement` TR-12.2: 无明显UI bug
  - `human-judgement` TR-12.3: 移动端操作体验流畅
- **Notes**: 这是最终验证任务
