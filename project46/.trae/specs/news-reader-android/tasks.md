# 新闻阅读安卓应用 - The Implementation Plan (Decomposed and Prioritized Task List)

## [ ] Task 1: 项目初始化与基础架构搭建
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 使用 Android Studio 风格初始化 Gradle 工程，配置 Kotlin + Jetpack Compose + Material3。
  - 配置依赖：Compose BOM、Navigation Compose、Coroutines、Room、Retrofit、DataStore、Coil。
  - 建立目录结构：data / domain / ui / di / util。
  - 配置 `compileSdk`/`targetSdk` 为 34，`minSdk` 为 24。
- **Acceptance Criteria Addressed**: AC-9
- **Test Requirements**:
  - `programmatic` TR-1.1: `./gradlew :app:assembleDebug` 成功生成 APK
  - `programmatic` TR-1.2: 应用启动后显示空白主界面且无崩溃
- **Notes**: 所有 Gradle 脚本使用 Kotlin DSL (`build.gradle.kts`)。

## [ ] Task 2: 数据模型、Room 数据库与 Mock 数据源
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 定义核心数据类：`News`、`Category`、`Keyword`、`Favorite`、`HistoryRecord`、`ReadingSession`、`UserPreferences`。
  - 使用 Room 定义数据库与 DAO：`NewsDao`、`FavoriteDao`、`HistoryDao`、`ReadingSessionDao`。
  - 创建 `assets/mock_news.json` 提供至少 50 条涵盖 6 个分类的 Mock 新闻数据。
  - 实现 Repository 层：NewsRepository、UserRepository，从 JSON 预加载到 Room。
- **Acceptance Criteria Addressed**: AC-1, AC-4, AC-5, AC-6, AC-7, AC-8
- **Test Requirements**:
  - `programmatic` TR-2.1: Room DAO 单元测试覆盖 CRUD 操作
  - `programmatic` TR-2.2: Mock JSON 能成功解析并填充数据库
- **Notes**: 实体使用 Kotlin data class，Room 版本 ≥ 2.6。

## [ ] Task 3: 主题系统与夜间模式
- **Priority**: P1
- **Depends On**: Task 1
- **Description**: 
  - 定义浅色/深色 ColorScheme、Typography、Shape。
  - 实现 `ThemeMode` 枚举（LIGHT/DARK/SYSTEM）与 DataStore 持久化。
  - 提供全局 `NewsTheme` Composable，根据 `ThemeMode` 动态切换。
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `programmatic` TR-3.1: DataStore 读写 `ThemeMode` 单元测试
  - `human-judgement` TR-3.2: 切换模式后所有界面主题立即生效，对比度符合 WCAG AA
- **Notes**: 仅修改主题与设置，不涉及业务页面。

## [ ] Task 4: 底部导航与应用导航图
- **Priority**: P0
- **Depends On**: Task 1, Task 3
- **Description**: 
  - 实现四个底部 Tab：首页 / 推荐 / 订阅 / 我的。
  - 使用 Navigation Compose 定义 NavHost，连接各一级 Tab 与详情页二级路由。
  - 为每个 Tab 创建占位页面。
- **Acceptance Criteria Addressed**: AC-9
- **Test Requirements**:
  - `programmatic` TR-4.1: 导航到任意 Tab 不崩溃
  - `human-judgement` TR-4.2: Tab 切换动画平滑、图标与标签正确
- **Notes**: 使用 `Scaffold + NavigationBar`。

## [ ] Task 5: 首页 - 新闻分类与列表
- **Priority**: P0
- **Depends On**: Task 2, Task 4
- **Description**: 
  - 顶部 `TabRow` 展示 6 个分类。
  - 使用 `LazyColumn` 展示该分类下的新闻列表，每项显示标题、摘要、图片、时间。
  - 点击项导航到详情页。
  - 在 ViewModel 中结合用户屏蔽过滤（Task 8 的过滤表）。
- **Acceptance Criteria Addressed**: AC-1, AC-7
- **Test Requirements**:
  - `programmatic` TR-5.1: ViewModel 能根据所选分类返回对应新闻列表
  - `programmatic` TR-5.2: 被屏蔽的关键词/分类不出现在结果中
  - `human-judgement` TR-5.3: 列表滚动流畅，图片加载正常
- **Notes**: 使用 Paging 或简单分页均可，首版可用简单列表。

## [ ] Task 6: 新闻详情页与阅读时长统计
- **Priority**: P0
- **Depends On**: Task 2, Task 4
- **Description**: 
  - 详情页展示标题、作者、时间、正文、图片。
  - 顶部可返回，显示收藏按钮状态。
  - 在页面 `onActive`/`onInactive` 生命周期内统计有效阅读时长，写入 `ReadingSession`。
  - 支持收藏/取消收藏。
- **Acceptance Criteria Addressed**: AC-4, AC-5, AC-6, AC-10
- **Test Requirements**:
  - `programmatic` TR-6.1: 停留 ≥ 3 秒后 `ReadingSession` 中存在记录
  - `programmatic` TR-6.2: 详情页退出后该新闻出现在历史中
  - `programmatic` TR-6.3: 点击收藏按钮后数据库 Favorite 表记录变化
  - `human-judgement` TR-6.4: 页面排版清晰、长文可滚动
- **Notes**: 使用 `LifecycleEventObserver` 或 Compose `DisposableEffect`。

## [ ] Task 7: 订阅页面 - 关键词订阅管理
- **Priority**: P1
- **Depends On**: Task 2, Task 4
- **Description**: 
  - 订阅页面提供输入框添加关键词、Chip 展示已订阅关键词，可删除。
  - 订阅数据写入本地数据库。
  - 首页中匹配到订阅关键词的新闻高亮显示。
- **Acceptance Criteria Addressed**: AC-2, AC-8
- **Test Requirements**:
  - `programmatic` TR-7.1: 添加/删除关键词后数据库记录即时更新
  - `programmatic` TR-7.2: 首页列表中，匹配订阅关键词的新闻 `isSubscribedHighlight` 字段为 true
- **Notes**: 关键词匹配基于标题/摘要包含。

## [ ] Task 8: 我的页面 - 收藏/历史/阅读统计/内容过滤
- **Priority**: P1
- **Depends On**: Task 2, Task 3, Task 4, Task 6
- **Description**: 
  - 我的页面入口项：收藏列表、历史列表、阅读统计、内容过滤、夜间模式切换。
  - 收藏/历史列表：展示新闻条目，支持删除或清空。
  - 阅读统计：聚合 `ReadingSession` 显示日/周总时长。
  - 内容过滤：添加/移除屏蔽关键词与分类。
  - 夜间模式切换（复用 Task 3）。
- **Acceptance Criteria Addressed**: AC-3, AC-4, AC-5, AC-6, AC-7
- **Test Requirements**:
  - `programmatic` TR-8.1: 历史列表按时间倒序展示
  - `programmatic` TR-8.2: 收藏/历史可清空
  - `programmatic` TR-8.3: 阅读统计日/周聚合与原始记录一致
  - `programmatic` TR-8.4: 添加屏蔽关键词后，相关新闻在首页/推荐中被过滤
- **Notes**: 聚合统计可用 SQL `SUM` 或 Kotlin 层聚合。

## [ ] Task 9: 个性化推荐算法与推荐页
- **Priority**: P2
- **Depends On**: Task 2, Task 6, Task 7, Task 8
- **Description**: 
  - 基于用户行为加权打分：阅读次数 ×1、阅读时长 ×2、收藏 ×3、订阅关键词命中 ×2。
  - 实现 `RecommendUseCase`，对所有新闻打分并取 Top N。
  - 推荐 Tab 页面展示推荐列表，结合内容过滤。
- **Acceptance Criteria Addressed**: AC-8
- **Test Requirements**:
  - `programmatic` TR-9.1: 对给定行为输入，推荐列表打分与期望一致
  - `programmatic` TR-9.2: 被屏蔽内容不出现在推荐列表
  - `human-judgement` TR-9.3: 推荐结果与用户近期行为高度相关
- **Notes**: 提供可注入的推荐策略，便于未来替换。

## [x] Task 10: 整体质量与打磨
- **Priority**: P2
- **Depends On**: Task 1-9
- **Description**: 
  - 空状态、错误状态 UI。
  - 图标资源、启动图。
  - 关键 ViewModel/UseCase 单元测试覆盖率 ≥ 70%。
  - 代码静态检查（ktlint）通过。
- **Acceptance Criteria Addressed**: AC-3, AC-9, AC-10
- **Test Requirements**:
  - `programmatic` TR-10.1: `./gradlew test` 全部通过
  - `programmatic` TR-10.2: `./gradlew lint` 无严重错误
  - `human-judgement` TR-10.3: 应用在真机上体验流畅
- **Notes**: 该任务是发布前的整体验收。
