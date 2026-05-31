# 新闻阅读微信小程序 - 实现计划（任务分解与优先级）

## [x] Task 1: 项目初始化与基础架构搭建
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 创建微信小程序基础项目结构
  - 配置app.json、app.js、app.wxss
  - 引入WeUI组件库
  - 创建工具类和通用组件目录结构
  - 配置底部tabBar导航（首页、订阅、推荐、我的）
- **Acceptance Criteria Addressed**: NFR-2, NFR-3
- **Test Requirements**:
  - `programmatic` TR-1.1: 小程序能正常启动，底部导航正常显示
  - `programmatic` TR-1.2: 四个tab页面可正常切换
  - `human-judgement` TR-1.3: 项目结构清晰，符合微信小程序规范
- **Notes**: 使用微信小程序官方开发工具创建项目

## [x] Task 2: 新闻数据服务与模拟数据
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 创建新闻数据服务层（API封装）
  - 生成模拟新闻数据（至少5个分类，每个分类20条）
  - 实现新闻列表获取、详情获取、搜索接口
  - 封装wx.request请求工具
- **Acceptance Criteria Addressed**: FR-1, FR-10
- **Test Requirements**:
  - `programmatic` TR-2.1: 能按分类获取新闻列表数据
  - `programmatic` TR-2.2: 能获取单条新闻详情
  - `programmatic` TR-2.3: 能按关键词搜索新闻
  - `human-judgement` TR-2.4: 模拟数据结构合理，包含标题、摘要、内容、图片、时间、分类等字段

## [x] Task 3: 首页新闻分类浏览
- **Priority**: P0
- **Depends On**: Task 2
- **Description**: 
  - 实现顶部分类标签栏（可左右滑动）
  - 实现新闻列表组件（图文混排）
  - 实现下拉刷新和上拉加载更多
  - 点击新闻跳转到详情页
- **Acceptance Criteria Addressed**: AC-1, FR-1
- **Test Requirements**:
  - `programmatic` TR-3.1: 分类标签可切换，对应分类新闻正确显示
  - `programmatic` TR-3.2: 下拉刷新可获取最新数据
  - `programmatic` TR-3.3: 上拉加载更多正常工作
  - `programmatic` TR-3.4: 点击列表项可跳转到详情页
  - `human-judgement` TR-3.5: 列表滑动流畅，UI美观

## [x] Task 4: 新闻详情页
- **Priority**: P0
- **Depends On**: Task 3
- **Description**: 
  - 实现新闻详情展示页面
  - 支持富文本内容渲染
  - 实现字体大小调节功能（小/中/大/特大）
  - 实现底部操作栏（收藏、返回首页等）
- **Acceptance Criteria Addressed**: AC-9, FR-9
- **Test Requirements**:
  - `programmatic` TR-4.1: 新闻详情内容正确显示
  - `programmatic` TR-4.2: 字体大小调节功能正常
  - `programmatic` TR-4.3: 富文本内容渲染正确
  - `human-judgement` TR-4.4: 排版美观，阅读体验良好

## [x] Task 5: 全局主题系统与夜间模式
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 设计日间/夜间主题配色方案
  - 实现全局主题状态管理
  - 在app.wxss中定义CSS变量
  - 实现主题切换持久化存储
  - 所有页面适配双主题
- **Acceptance Criteria Addressed**: AC-3, FR-3
- **Test Requirements**:
  - `programmatic` TR-5.1: 主题切换后全局样式立即更新
  - `programmatic` TR-5.2: 重启小程序后主题设置保持
  - `programmatic` TR-5.3: 新闻详情页文字和背景适配夜间模式
  - `human-judgement` TR-5.4: 夜间模式下阅读舒适，无刺眼颜色

## [x] Task 6: 本地存储服务
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 封装wx.setStorage/wx.getStorage工具类
  - 实现收藏数据CRUD操作
  - 实现阅读历史CRUD操作
  - 实现用户设置（主题、过滤关键词、订阅关键词）存储
  - 实现阅读时长统计数据存储
- **Acceptance Criteria Addressed**: NFR-4, FR-4, FR-5
- **Test Requirements**:
  - `programmatic` TR-6.1: 收藏数据可正常增删改查
  - `programmatic` TR-6.2: 阅读历史可正常增删改查
  - `programmatic` TR-6.3: 用户设置持久化存储正常
  - `programmatic` TR-6.4: 重启小程序后数据不丢失

## [ ] Task 7: 收藏功能
- **Priority**: P1
- **Depends On**: Task 4, Task 6
- **Description**: 
  - 在新闻详情页添加收藏按钮
  - 实现收藏状态实时更新
  - 创建收藏列表页面
  - 支持取消收藏和批量删除
- **Acceptance Criteria Addressed**: AC-4, FR-4
- **Test Requirements**:
  - `programmatic` TR-7.1: 详情页点击收藏按钮状态正确切换
  - `programmatic` TR-7.2: 收藏的新闻出现在收藏列表
  - `programmatic` TR-7.3: 取消收藏后从列表移除
  - `programmatic` TR-7.4: 收藏列表按收藏时间倒序排列

## [ ] Task 8: 阅读历史记录
- **Priority**: P1
- **Depends On**: Task 4, Task 6
- **Description**: 
  - 进入新闻详情页自动添加历史记录
  - 创建历史记录列表页面
  - 支持清空全部历史
  - 支持删除单条历史
- **Acceptance Criteria Addressed**: AC-5, FR-5
- **Test Requirements**:
  - `programmatic` TR-8.1: 浏览新闻后自动添加历史记录
  - `programmatic` TR-8.2: 历史记录按浏览时间倒序排列
  - `programmatic` TR-8.3: 清空历史功能正常
  - `programmatic` TR-8.4: 重复浏览同一新闻只保留最新记录

## [ ] Task 9: 关键词订阅功能
- **Priority**: P1
- **Depends On**: Task 2, Task 6
- **Description**: 
  - 创建订阅管理页面
  - 实现添加/删除订阅关键词
  - 实现订阅关键词数量限制（最多20个）
  - 点击订阅关键词查看相关新闻列表
  - 创建订阅tab首页，展示所有订阅关键词的新闻聚合
- **Acceptance Criteria Addressed**: AC-2, FR-2
- **Test Requirements**:
  - `programmatic` TR-9.1: 可正常添加和删除订阅关键词
  - `programmatic` TR-9.2: 超过数量限制时提示用户
  - `programmatic` TR-9.3: 点击关键词可显示相关新闻
  - `programmatic` TR-9.4: 订阅数据持久化存储

## [ ] Task 10: 内容过滤功能
- **Priority**: P1
- **Depends On**: Task 2, Task 6
- **Description**: 
  - 在设置页面添加过滤关键词管理
  - 实现添加/删除过滤关键词
  - 在新闻列表获取时应用过滤规则
  - 过滤包含敏感关键词的新闻
- **Acceptance Criteria Addressed**: AC-7, FR-7
- **Test Requirements**:
  - `programmatic` TR-10.1: 可正常添加和删除过滤关键词
  - `programmatic` TR-10.2: 包含过滤关键词的新闻不显示在列表中
  - `programmatic` TR-10.3: 过滤设置持久化存储
  - `programmatic` TR-10.4: 过滤功能在所有新闻列表页面生效

## [ ] Task 11: 阅读时长统计
- **Priority**: P1
- **Depends On**: Task 4, Task 6
- **Description**: 
  - 在新闻详情页实现计时器
  - 进入详情页开始计时，离开时停止
  - 按日期统计阅读时长
  - 创建统计页面，展示日/周/月阅读时长和阅读篇数
- **Acceptance Criteria Addressed**: AC-6, FR-6
- **Test Requirements**:
  - `programmatic` TR-11.1: 进入详情页开始计时，退出停止
  - `programmatic` TR-11.2: 阅读时长数据正确累加
  - `programmatic` TR-11.3: 统计页面显示今日、本周、本月数据
  - `programmatic` TR-11.4: 统计数据持久化存储

## [ ] Task 12: 新闻搜索功能
- **Priority**: P1
- **Depends On**: Task 2
- **Description**: 
  - 在首页顶部添加搜索入口
  - 创建搜索页面
  - 实现搜索历史记录
  - 实现搜索结果列表展示
- **Acceptance Criteria Addressed**: AC-10, FR-10
- **Test Requirements**:
  - `programmatic` TR-12.1: 搜索框可正常输入
  - `programmatic` TR-12.2: 搜索结果正确显示
  - `programmatic` TR-12.3: 搜索历史记录正常保存和显示
  - `programmatic` TR-12.4: 点击搜索结果可进入详情页

## [ ] Task 13: 个性化推荐算法
- **Priority**: P2
- **Depends On**: Task 6, Task 8
- **Description**: 
  - 基于阅读历史统计用户阅读偏好
  - 按分类和关键词统计阅读频率
  - 实现简单的推荐算法（基于阅读历史权重）
  - 推荐结果去重和过滤
- **Acceptance Criteria Addressed**: AC-8, FR-8
- **Test Requirements**:
  - `programmatic` TR-13.1: 能基于阅读历史生成用户画像
  - `programmatic` TR-13.2: 推荐列表能正常生成
  - `human-judgement` TR-13.3: 推荐结果与用户阅读历史相关
  - `human-judgement` TR-13.4: 推荐结果多样性合理

## [ ] Task 14: 推荐页面
- **Priority**: P2
- **Depends On**: Task 13
- **Description**: 
  - 创建推荐页面
  - 展示个性化推荐新闻列表
  - 实现"换一批"功能
  - 展示推荐理由（如"因为你看过科技新闻"）
- **Acceptance Criteria Addressed**: AC-8, FR-8
- **Test Requirements**:
  - `programmatic` TR-14.1: 推荐页面正常显示推荐列表
  - `programmatic` TR-14.2: "换一批"功能正常工作
  - `human-judgement` TR-14.3: 推荐理由清晰合理

## [ ] Task 15: 个人中心与设置页面
- **Priority**: P2
- **Depends On**: Task 5, Task 9, Task 10
- **Description**: 
  - 创建个人中心页面
  - 创建设置页面
  - 集成夜间模式开关
  - 集成过滤关键词管理入口
  - 展示阅读统计概览
  - 添加收藏、历史记录入口
- **Acceptance Criteria Addressed**: FR-3, FR-7
- **Test Requirements**:
  - `programmatic` TR-15.1: 个人中心页面正常显示
  - `programmatic` TR-15.2: 设置页面各功能入口正常
  - `programmatic` TR-15.3: 夜间模式开关正常工作
  - `human-judgement` TR-15.4: 页面布局美观，操作便捷

## [ ] Task 16: 整体测试与优化
- **Priority**: P2
- **Depends On**: Task 1-15
- **Description**: 
  - 全功能集成测试
  - 性能优化（列表渲染、页面加载）
  - UI细节优化
  - 边界情况处理（空数据、网络错误等）
  - 代码规范检查
- **Acceptance Criteria Addressed**: NFR-1, NFR-2, NFR-3
- **Test Requirements**:
  - `programmatic` TR-16.1: 所有功能正常工作无崩溃
  - `programmatic` TR-16.2: 页面加载时间<2秒
  - `human-judgement` TR-16.3: 列表滑动流畅
  - `human-judgement` TR-16.4: 整体用户体验良好
