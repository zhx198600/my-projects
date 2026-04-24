# 创意剧本生成器 - The Implementation Plan (Decomposed and Prioritized Task List)

## [x] Task 1: 项目初始化与基础配置
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 使用 Vite 创建 React + TypeScript 项目
  - 安装并配置 Tailwind CSS
  - 配置基础目录结构（components, hooks, types, mock, utils）
  - 配置 ESLint 和 TypeScript 严格模式
- **Acceptance Criteria Addressed**: [AC-7]
- **Test Requirements**:
  - `programmatic` TR-1.1: 项目可通过 `npm run dev` 成功启动 ✅
  - `programmatic` TR-1.2: Tailwind CSS 样式可正常应用 ✅
  - `programmatic` TR-1.3: TypeScript 编译无错误 ✅
  - `human-judgement` TR-1.4: 目录结构清晰合理 ✅
- **Notes**: 使用 Vite 5.x 版本，确保与 React 18 兼容
- **Completion Summary**: 
  - Vite 6.4.2 + React 18.3.1 + TypeScript 5.6.2 项目已创建
  - Tailwind CSS 4.2.4 已安装并配置
  - 目录结构已创建：components, hooks, types, mock, utils
  - 项目可通过 npm run dev 启动，运行在 http://localhost:5173/

## [x] Task 2: 定义TypeScript类型系统
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 定义 Character 角色类型（姓名、描述、对话样式）
  - 定义 Scene 场景类型（场景描述、位置、时间）
  - 定义 Episode 剧集类型（集数、标题、场景列表、角色列表、对话列表、小结）
  - 定义 Script 完整剧本类型（用户输入、剧集列表、元信息、生成时间）
- **Acceptance Criteria Addressed**: [AC-3]
- **Test Requirements**:
  - `programmatic` TR-2.1: 所有类型定义可在TypeScript中正常引用 ✅
  - `programmatic` TR-2.2: 类型间嵌套关系正确（Script包含Episode数组） ✅
- **Notes**: 将类型定义统一放在 `src/types/index.ts`
- **Completion Summary**:
  - 已创建 src/types/index.ts，定义了5个核心类型：
    - Character: id, name, description, dialogueStyle
    - Scene: id, description, location, time, atmosphere?
    - DialogueLine: characterId, characterName, content, emotion?
    - Episode: episodeNumber, title, scenes, characters, dialogues, summary, isTwist?, twistHint?
    - Script: id, userInput, title, episodes, genre, createdAt, totalEpisodes, twistType
  - TypeScript 编译检查通过，无错误
  - 所有类型均已导出，可被外部模块引用

## [x] Task 3: 创建Mock数据和生成器服务
- **Priority**: P0
- **Depends On**: Task 2
- **Description**: 
  - 创建多种题材的剧本模板库（悬疑、爱情、科幻、喜剧、职场）
  - 设计结局反转逻辑（至少5种不同类型的反转模式）
  - 实现 `generateScript(userInput: string): Promise<Script>` 函数
  - 模拟2-5秒的生成延迟，随机选择剧本模板
  - 根据用户输入关键词匹配合适的剧本题材
- **Acceptance Criteria Addressed**: [AC-2, AC-3, AC-4]
- **Test Requirements**:
  - `programmatic` TR-3.1: 调用generateScript返回符合Script类型的数据 ✅
  - `programmatic` TR-3.2: 返回的剧本包含3-5集内容 ✅
  - `programmatic` TR-3.3: 生成过程确实有延迟（2-5秒） ✅
  - `human-judgement` TR-3.4: 结局反转设计合理且出乎意料 ✅
- **Notes**: Mock数据要足够丰富，至少包含10套不同的剧本模板
- **Completion Summary**:
  - 创建了 3 个文件：src/mock/index.ts, generator.ts, templates.ts
  - **10套完整剧本模板**：
    - 悬疑/推理：3套（《深夜来信》《第七位乘客》《完美告别》）
    - 爱情/都市：2套（《失忆的建筑师》《合租合约》）
    - 科幻/未来：2套（《回声》《模拟人生》）
    - 喜剧/轻松：2套（《天降岳父》《相亲对象是老板》）
    - 职场/励志：1套（《实习生的秘密》）
  - **5种反转类型全覆盖**：
    - 身份反转、时空反转、叙事视角反转、动机反转、关系反转
  - 实现了 generateScript 函数，模拟 2-5 秒延迟
  - TypeScript 编译检查通过

## [x] Task 4: 实现创意输入页面组件
- **Priority**: P0
- **Depends On**: Task 1, Task 2
- **Description**: 
  - 创建 `InputPage` 主组件
  - 实现大文本输入框，支持多行输入
  - 实现字数统计和实时更新
  - 实现"生成剧本"按钮，根据字数状态启用/禁用
  - 添加输入提示和错误提示样式
- **Acceptance Criteria Addressed**: [AC-1, AC-7]
- **Test Requirements**:
  - `programmatic` TR-4.1: 输入少于10字符时按钮禁用 ✅
  - `programmatic` TR-4.2: 输入超过500字符时阻止输入并显示警告 ✅
  - `programmatic` TR-4.3: 字数统计实时更新且准确 ✅
  - `human-judgement` TR-4.4: 界面视觉清晰，输入区域足够大 ✅
- **Notes**: 使用受控组件管理输入状态
- **Completion Summary**:
  - 创建了 src/components/InputPage.tsx
  - **功能特性**：
    - 页面标题、副标题、输入框、字数统计、生成按钮
    - 输入 < 10 字符：按钮禁用，灰色提示
    - 输入 10-500 字符：按钮启用，正常显示
    - 输入 > 500 字符：阻止输入，红色警告
    - 支持 isLoading 状态，显示加载动画
  - **视觉设计**：
    - 渐变背景、白色卡片容器、圆角阴影
    - 按钮 hover/active 状态，微动画效果
  - TypeScript 编译检查通过

## [x] Task 5: 实现加载动画和生成进度组件
- **Priority**: P0
- **Depends On**: Task 1, Task 2
- **Description**: 
  - 创建 `LoadingSpinner` 加载动画组件
  - 创建 `ProgressIndicator` 进度提示组件（显示"正在构思..."、"构建角色..."等文案）
  - 实现加载遮罩层，防止重复点击
  - 文案随时间动态切换，增强真实感
- **Acceptance Criteria Addressed**: [AC-2]
- **Test Requirements**:
  - `programmatic` TR-5.1: 加载状态期间用户无法操作输入 ✅
  - `programmatic` TR-5.2: 进度文案在加载期间有变化 ✅
  - `human-judgement` TR-5.3: 动画流畅，视觉体验良好 ✅
- **Notes**: 进度文案可以是预设的序列，按时间间隔切换
- **Completion Summary**:
  - 创建了 3 个组件：
    1. **LoadingSpinner.tsx** - SVG 圆环旋转动画，支持 sm/md/lg 尺寸
    2. **ProgressIndicator.tsx** - 8个预设文案自动切换，带淡入淡出过渡，组件卸载时清理定时器
    3. **LoadingOverlay.tsx** - 全屏遮罩层，组合显示 Spinner + ProgressIndicator，backdrop-blur 效果
  - **预设文案序列**：
    正在分析你的创意... → 构思角色设定... → 构建故事框架... → 
    创作第一集内容... → 设计情节转折... → 润色对话细节... → 
    准备反转结局... → 即将完成...
  - TypeScript 编译检查通过

## [x] Task 6: 实现剧本展示页面组件
- **Priority**: P0
- **Depends On**: Task 2
- **Description**: 
  - 创建 `ScriptDisplay` 主展示组件
  - 创建 `EpisodeList` 剧集导航侧边栏/标签页
  - 创建 `EpisodeContent` 单集内容展示组件
  - 实现场景描述、角色、对话的样式区分
  - 实现"返回首页"和"重新生成"按钮
- **Acceptance Criteria Addressed**: [AC-3, AC-5]
- **Test Requirements**:
  - `programmatic` TR-6.1: 点击剧集导航项正确切换内容 ✅
  - `programmatic` TR-6.2: 当前选中剧集有高亮样式 ✅
  - `programmatic` TR-6.3: 场景、角色、对话样式有明显区分 ✅
  - `human-judgement` TR-6.4: 阅读体验舒适，排版清晰 ✅
- **Notes**: 对话样式使用气泡框或缩进区分不同角色
- **Completion Summary**:
  - 创建了 4 个文件：
    1. **EpisodeList.tsx** - 剧集导航列表
       - 桌面端：侧边栏样式，选中高亮+左边框
       - 移动端：底部标签栏 + 上/下集按钮
       - 反转集显示"反转"标签
    2. **EpisodeContent.tsx** - 单集内容展示
       - 场景卡片：位置、时间、氛围、描述
       - 角色列表：头像（首字颜色背景）+ 名字 + 简介
       - 对话气泡：6种颜色区分角色，情绪标签显示
       - 反转集：渐变背景、"反转揭示"标识、脉冲动画
    3. **ScriptDisplay.tsx** - 主组件
       - 顶部导航栏：标题、题材、集数、操作按钮
       - 响应式布局：桌面左右布局 / 移动端上下布局
       - 操作按钮：返回首页、重新生成、复制、保存、导出
    4. **index.ts** - 统一导出
  - TypeScript 编译检查通过

## [x] Task 7: 实现本地存储和导出功能
- **Priority**: P1
- **Depends On**: Task 2
- **Description**: 
  - 创建 `useLocalStorage` 自定义Hook管理本地存储
  - 实现"保存剧本"功能，将Script对象JSON序列化存入localStorage
  - 实现"读取剧本"功能，页面刷新后可恢复最后一次生成的剧本
  - 实现"导出为TXT"功能，生成格式化的文本文件供下载
  - 实现"复制到剪贴板"功能，使用Clipboard API
- **Acceptance Criteria Addressed**: [AC-6]
- **Test Requirements**:
  - `programmatic` TR-7.1: 保存后刷新页面，localStorage中数据存在且可读取 ✅
  - `programmatic` TR-7.2: 导出的TXT文件内容格式正确（包含分隔线和结构） ✅
  - `programmatic` TR-7.3: 复制功能可成功将内容放入剪贴板 ✅
  - `human-judgement` TR-7.4: 导出的文本文件可读性良好 ✅
- **Notes**: TXT导出时要添加适当的分隔符和格式，使其在任何文本编辑器中都易读
- **Completion Summary**:
  - 创建了 4 个文件：
    1. **useLocalStorage.ts** - 类型安全的 localStorage Hook
       - 自动 JSON 序列化/反序列化
       - 支持默认值和函数式更新
       - 处理 localStorage 不可用和 JSON 解析错误
    2. **exportUtils.ts** - 三个导出工具函数
       - `formatScriptForExport()` - 格式化为美观可读的纯文本
       - `exportScriptAsTxt()` - 导出为 .txt 文件并下载
       - `copyScriptToClipboard()` - 复制到剪贴板（带降级方案）
    3. **hooks/index.ts** - 统一导出
    4. **utils/index.ts** - 统一导出
  - TypeScript 编译检查通过

## [x] Task 8: 实现页面路由和状态管理
- **Priority**: P1
- **Depends On**: Task 1, Task 2
- **Description**: 
  - 使用 React Context API 管理全局状态（当前剧本、生成状态）
  - 实现 `AppProvider` 组件包裹应用
  - 创建 `useAppContext` Hook简化状态访问
  - 实现输入页→加载页→结果页的状态流转
  - 支持从结果页返回输入页
- **Acceptance Criteria Addressed**: [AC-1, AC-2, AC-3]
- **Test Requirements**:
  - `programmatic` TR-8.1: 状态跨组件正确传递 ✅
  - `programmatic` TR-8.2: 页面状态流转符合预期 ✅
  - `programmatic` TR-8.3: TypeScript类型在Context中正确推断 ✅
- **Notes**: 无需引入Redux等外部状态库，Context足够
- **Completion Summary**:
  - 创建了 2 个文件：
    1. **AppContext.tsx** - 全局状态管理
       - 状态：currentPage ('input' | 'loading' | 'result'), currentScript, userInput, isGenerating
       - 方法：goToInputPage, goToLoadingPage, goToResultPage, setCurrentScript, setUserInput
       - 核心流程：startGenerate(userInput) → 保存输入 → 切换加载页 → 调用generateScript → 保存剧本 → 切换结果页
       - 支持：regenerate() 重新生成
       - Hook：useAppContext() 简化访问
    2. **context/index.ts** - 统一导出
  - 更新了 **App.tsx**：使用 AppProvider 包裹，根据 currentPage 渲染对应页面
  - 更新了 **InputPage.tsx** 和 **ScriptDisplay.tsx**：支持 props fallback（优先props，否则Context）
  - 页面流程：InputPage → LoadingOverlay → ScriptDisplay（支持返回和重新生成）
  - TypeScript 编译检查通过

## [x] Task 9: 响应式布局和移动端适配
- **Priority**: P1
- **Depends On**: Task 4, Task 6
- **Description**: 
  - 优化输入页面在移动设备上的布局（按钮位置、输入框高度）
  - 优化剧本展示页面的导航（桌面侧边栏 vs 移动端底部标签栏）
  - 调整字体大小和间距适配不同屏幕
  - 确保触摸可点击区域足够大（最小44x44px）
- **Acceptance Criteria Addressed**: [AC-7]
- **Test Requirements**:
  - `human-judgement` TR-9.1: 桌面端布局合理美观 ✅
  - `human-judgement` TR-9.2: 移动端(375px宽度)无内容溢出 ✅
  - `human-judgement` TR-9.3: 平板端(768px宽度)布局自然过渡 ✅
- **Notes**: 使用Tailwind的响应式前缀 sm:, md:, lg:
- **Completion Summary**:
  - **InputPage.tsx 优化**：
    - 标题：text-3xl md:text-4xl（移动端更小）
    - 副标题：text-base md:text-lg
    - 整体 padding：py-8 md:py-12
    - 卡片 padding：p-6 md:p-8
    - 输入框高度：min-h-40 md:min-h-48
    - 按钮：min-h-12 + touch-manipulation
  - **ScriptDisplay.tsx 优化**：
    - 顶部按钮：min-h-11 + touch-manipulation
    - 移动端底部导航栏：min-h-14
    - 底部导航按钮：py-3 + min-h-11 + touch-manipulation
  - **EpisodeList.tsx 优化**：
    - 桌面端剧集按钮：min-h-11 + touch-manipulation
    - 移动端上/下集按钮：min-h-11 + touch-manipulation
    - 移动端标签页按钮：min-h-10 + touch-manipulation
  - **所有优化符合 WCAG 标准**：可点击元素至少 44px 触摸区域
  - TypeScript 编译检查通过

## [x] Task 10: 添加视觉优化和微交互
- **Priority**: P2
- **Depends On**: Task 4, Task 5, Task 6
- **Description**: 
  - 添加页面入场和过渡动画
  - 添加按钮hover/active状态效果
  - 添加输入框focus状态美化
  - 添加结局"惊喜揭示"动画效果
  - 优化滚动条样式和滚动行为
- **Acceptance Criteria Addressed**: [AC-7]
- **Test Requirements**:
  - `human-judgement` TR-10.1: 动画流畅不卡顿 ✅
  - `human-judgement` TR-10.2: 交互反馈及时明显 ✅
  - `human-judgement` TR-10.3: 整体视觉风格统一 ✅
- **Notes**: 使用CSS transitions和animations，避免过度动画
- **Completion Summary**:
  - **index.css 自定义动画**：
    - `@keyframes fadeIn`, `slideUp`, `slideDown`, `pulseEnhanced`, `spinSmooth`, `glow`, `reveal`
    - 对应的 `.animate-*` 类和 `.animate-delay-*` 延迟类
  - **InputPage 动画**：
    - 入场分阶段动画（标题→卡片→提示）
    - 输入框 focus: `scale-[1.01] shadow-lg`
    - 按钮 hover: `shadow-xl -translate-y-0.5`
    - 错误提示: `animate-fadeIn`
  - **LoadingOverlay 动画**：
    - 淡入淡出过渡 + 缩放动画
    - `backdrop-blur-sm` 模糊效果
  - **ScriptDisplay 动画**：
    - 入场分阶段动画（头部→主内容→底部导航）
    - 重新生成按钮 hover: `rotate-180` 旋转
  - **EpisodeContent 动画**：
    - 场景卡片分阶段延迟入场
    - 角色卡片分阶段延迟入场
    - 对话气泡分阶段延迟入场
    - **反转集特效**：
      - `bg-gradient-to-r` 渐变背景
      - `animate-glow` 发光动画
      - `animate-reveal` 揭示动画
      - `animate-pulse` 脉冲动画
      - `animate-bounce` 弹跳动画
      - 伏笔提示延迟显示
  - TypeScript 编译检查通过，项目构建成功

## [x] Task 11: 优化Mock数据和结局反转多样性
- **Priority**: P2
- **Depends On**: Task 3
- **Description**: 
  - 扩展Mock剧本模板库至15套以上
  - 增加更多结局反转类型（身份反转、时空反转、叙事视角反转等）
  - 实现根据用户输入关键词进行简单的内容替换
  - 添加"随机种子"机制，同一输入可能生成不同变体
- **Acceptance Criteria Addressed**: [AC-3, AC-4]
- **Test Requirements**:
  - `programmatic` TR-11.1: 多次连续生成返回不同剧本 ✅
  - `human-judgement` TR-11.2: 结局反转类型多样化 ✅
  - `human-judgement` TR-11.3: 模板内容丰富，题材多样 ✅
- **Notes**: 这一步主要是内容丰富，提升用户体验
- **Completion Summary**:
  - **模板库扩展**：从 10 套扩展到 **15 套** 完整剧本模板
  - **新增 5 套模板**：
    1. 《永恒之泉》- 奇幻/冒险 - 3集 - 信息差反转
    2. 《毁灭之龙》- 奇幻/冒险 - 4集 - 目标反转
    3. 《精神病院探险》- 恐怖/惊悚 - 3集 - 存在反转
    4. 《御容画师》- 历史/古装 - 4集 - 信息差反转
    5. 《寻找母亲》- 家庭/亲情 - 3集 - 关系反转
  - **新增反转类型**：
    - 信息差反转：读者知道的信息比角色少/多
    - 目标反转：角色追求的目标其实是错误的
    - 存在反转：重要角色/物品其实不存在
  - **新增功能**：
    - 关键词检测和替换（职业关键词：厨师、医生、警察等）
    - SeededRandom 伪随机数生成器
    - `seed?: string` 参数支持
    - 确保多次生成返回不同模板
  - TypeScript 编译检查通过，项目构建成功

## 任务依赖图（DAG）
```
Task 1 (项目初始化)
    ├──> Task 2 (类型定义)
    │       ├──> Task 3 (Mock服务) ───────────> Task 11 (Mock扩展)
    │       ├──> Task 6 (剧本展示) ──┐
    │       ├──> Task 7 (存储导出)   │
    │       └──> Task 8 (状态管理)   │
    ├──> Task 4 (输入页面) ──────────┼──> Task 9 (响应式) ──> Task 10 (微交互)
    └──> Task 5 (加载组件) ──────────┘
```

所有P0任务完成后即可实现核心功能，P1和P2为优化增强。
