# 商品比价网站 - The Implementation Plan (Decomposed and Prioritized Task List)

## [x] Task 1: 项目初始化和技术栈搭建
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 初始化Vue3 + Vite前端项目
  - 初始化Express + Node.js后端项目
  - 配置TypeScript、ESLint、Prettier
  - 搭建前后端服务基础架构
- **Acceptance Criteria Addressed**: [AC-6]
- **Test Requirements**:
  - `programmatic` TR-1.1: npm run dev 正常启动前后端服务
  - `programmatic` TR-1.2: 基础API接口调用成功
  - `human-judgement` TR-1.3: 项目结构清晰，配置合理
- **Notes**: 使用Vue3 + Express全栈架构

## [x] Task 2: URL输入界面和表单验证
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 实现首页URL输入表单，支持2-5个输入框动态添加
  - 添加URL格式验证和非空验证
  - 实现加载状态和进度提示
  - 响应式设计适配移动端
- **Acceptance Criteria Addressed**: [AC-1, AC-6]
- **Test Requirements**:
  - `programmatic` TR-2.1: 输入无效URL提示错误信息
  - `programmatic` TR-2.2: 少于2个URL时提交按钮禁用
  - `human-judgement` TR-2.3: 加载动画流畅，用户体验良好
- **Notes**: 动态添加删除URL输入框

## [/] Task 3: 网页爬虫引擎开发
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 集成Puppeteer/Cheerio爬虫库
  - 实现京东商品页面解析器（标题、价格、品牌、图片、参数）
  - 实现天猫商品页面解析器
  - 封装统一的爬虫接口，支持多平台适配
- **Acceptance Criteria Addressed**: [AC-2]
- **Test Requirements**:
  - `programmatic` TR-3.1: 测试京东URL解析成功率 > 80%
  - `programmatic` TR-3.2: 测试天猫URL解析成功率 > 80%
  - `programmatic` TR-3.3: 解析结果包含title、price、brand、image、params字段
- **Notes**: 处理反爬机制，添加请求头和延迟

## [/] Task 4: 参数对比可视化组件
- **Priority**: P1
- **Depends On**: Task 3
- **Description**: 
  - 实现参数对比表格组件
  - 相同参数值合并显示，差异参数高亮标色
  - 支持参数分类折叠展开
  - 商品卡片横向排列对比
- **Acceptance Criteria Addressed**: [AC-3, AC-6]
- **Test Requirements**:
  - `programmatic` TR-4.1: 2个商品参数对比表格正确渲染
  - `human-judgement` TR-4.2: 差异参数高亮醒目，便于识别
  - `human-judgement` TR-4.3: 移动端竖屏布局合理
- **Notes**: 使用Table组件，支持横向滚动

## [x] Task 5: 用户评价爬取和简单情感分析
- **Priority**: P1
- **Depends On**: Task 3
- **Description**: 
  - 爬取商品用户评价数据
  - 统计好评率、差评率
  - 提取评价高频关键词
  - 生成评价摘要和标签云
- **Acceptance Criteria Addressed**: [AC-4]
- **Test Requirements**:
  - `programmatic` TR-5.1: 成功获取至少10条评价数据
  - `programmatic` TR-5.2: 好评率计算正确（0-100%）
  - `human-judgement` TR-5.3: 关键词统计合理反映评价倾向
- **Notes**: 初期使用关键词匹配进行简单情感分析

## [x] Task 6: 多维度评分和建议生成算法
- **Priority**: P0
- **Depends On**: Task 3, Task 5
- **Description**: 
  - 实现性价比评分算法（价格/关键参数比）
  - 实现外观、质量、功能评分模型
  - 用户可选择权重侧重点
  - 基于权重计算综合得分，生成Top推荐及理由
- **Acceptance Criteria Addressed**: [AC-5]
- **Test Requirements**:
  - `programmatic` TR-6.1: 选择"性价比"时，价格低/配置高商品得分高
  - `programmatic` TR-6.2: 每个商品生成1-10分的综合得分
  - `human-judgement` TR-6.3: 推荐理由清晰具体，与选择的关注点一致
- **Notes**: 算法可解释性优先，避免黑盒评分

## [/] Task 7: 结果展示页面和数据可视化
- **Priority**: P1
- **Depends On**: Task 4, Task 6
- **Description**: 
  - 使用ECharts实现雷达图多维度对比
  - 实现柱状图价格对比
  - Tab切换：基本信息、参数对比、评价分析、最终建议
  - 整体UI美化和交互优化
- **Acceptance Criteria Addressed**: [AC-3, AC-4, AC-5, AC-6]
- **Test Requirements**:
  - `programmatic` TR-7.1: 所有Tab页内容正确渲染
  - `human-judgement` TR-7.2: 图表清晰直观，配色专业
  - `human-judgement` TR-7.3: 整体界面达到现代Web应用标准
- **Notes**: 雷达图展示5个维度得分

## [x] Task 8: 集成测试和Bug修复
- **Priority**: P1
- **Depends On**: Task 2 - Task 7
- **Description**: 
  - 端到端完整流程测试
  - 边界情况处理（解析失败、网络超时）
  - 错误提示和降级处理
  - 性能优化
- **Acceptance Criteria Addressed**: [AC-1, AC-2, AC-3, AC-4, AC-5, AC-6]
- **Test Requirements**:
  - `programmatic` TR-8.1: 完整流程（输入→解析→对比→建议）顺利完成
  - `programmatic` TR-8.2: 解析失败时友好提示用户
  - `human-judgement` TR-8.3: 无明显UI bug和交互问题
