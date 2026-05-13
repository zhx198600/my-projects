# ML智能文案生成器 - The Implementation Plan (Decomposed and Prioritized Task List)

## [x] Task 1: 项目初始化和技术栈配置
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 初始化Next.js + TypeScript项目
  - 配置Tailwind CSS样式框架
  - 设置ESLint和Prettier代码规范
  - 配置项目目录结构
- **Acceptance Criteria Addressed**: AC-8
- **Test Requirements**:
  - `programmatic` TR-1.1: 项目可正常启动，运行 `npm run dev` 无错误 ✅
  - `programmatic` TR-1.2: TypeScript编译无错误 ✅
  - `human-judgement` TR-1.3: 目录结构清晰，符合最佳实践 ✅
- **Notes**: 使用最新的Next.js App Router架构

## [x] Task 2: 基础UI界面布局实现
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 实现主页面布局：输入区、参数选择区、结果展示区
  - 实现关键词输入框和生成按钮
  - 实现字数选择下拉框（短/中/长）
  - 实现语气风格选择器（正式/轻松/幽默/专业）
  - 实现配图数量选择
- **Acceptance Criteria Addressed**: AC-8
- **Test Requirements**:
  - `human-judgement` TR-2.1: 界面元素布局合理美观 ✅
  - `human-judgement` TR-2.2: 在移动端和桌面端都显示正常 ✅
  - `programmatic` TR-2.3: 所有表单元素可正常交互 ✅
- **Notes**: 使用shadcn/ui组件库保证UI一致性

## [x] Task 3: LLM文案生成API集成
- **Priority**: P0
- **Depends On**: Task 2
- **Description**: 
  - 设计API路由，处理文案生成请求
  - 集成语音模型API（如OpenAI）
  - 实现Prompt工程，包含字数和语气参数
  - 实现错误处理和加载状态
  - 实现Loading动画和状态提示
- **Acceptance Criteria Addressed**: AC-1, AC-3, AC-4
- **Test Requirements**:
  - `programmatic` TR-3.1: 输入关键词后15秒内返回文案 ✅
  - `programmatic` TR-3.2: 不同字数选项生成的文案长度有明显差异 ✅
  - `programmatic` TR-3.3: 接口错误时有友好的错误提示 ✅
  - `human-judgement` TR-3.4: 文案质量符合所选语气风格 ✅
- **Notes**: 使用环境变量存储API密钥，考虑添加Mock模式便于开发

## [x] Task 4: 关键字自动加粗功能实现
- **Priority**: P0
- **Depends On**: Task 3
- **Description**: 
  - 实现关键字提取算法（基于TF-IDF或LLM识别）
  - 实现文案内容的富文本渲染
  - 将识别到的关键字用<strong>标签包裹
  - 处理加粗后的排版美观性
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `programmatic` TR-4.1: 关键字包含在返回的HTML中 ✅
  - `human-judgement` TR-4.2: 加粗的关键字确实是文案核心词汇 ✅
  - `human-judgement` TR-4.3: 加粗显示自然，不破坏阅读体验 ✅
- **Notes**: 可在Prompt中要求LLM返回时已用Markdown加粗关键字

## [x] Task 5: 智能配图生成功能实现
- **Priority**: P1
- **Depends On**: Task 3
- **Description**: 
  - 集成图片生成API（如DALL-E或其他服务）
  - 从文案中提取适合的图片Prompt
  - 实现1-3张图片的网格布局展示
  - 实现图片懒加载和点击放大预览
- **Acceptance Criteria Addressed**: AC-5
- **Test Requirements**:
  - `programmatic` TR-5.1: 30秒内生成并显示图片 ✅
  - `programmatic` TR-5.2: 生成图片数量不超过用户选择的数量 ✅
  - `human-judgement` TR-5.3: 图片内容与文案主题相关 ✅
- **Notes**: 考虑使用免费的图片生成API降低成本

## [x] Task 6: 文案转语音TTS功能实现
- **Priority**: P1
- **Depends On**: Task 3
- **Description**: 
  - 集成TTS语音合成API
  - 实现语音播放控制条（播放/暂停/进度）
  - 实现语音文件下载功能
  - 添加语音加载状态提示
- **Acceptance Criteria Addressed**: AC-6
- **Test Requirements**:
  - `programmatic` TR-6.1: 5秒内开始播放语音 ✅
  - `programmatic` TR-6.2: 播放控制功能正常工作 ✅
  - `human-judgement` TR-6.3: 语音清晰流畅，发音准确 ✅
- **Notes**: 可考虑使用Web Speech API作为备选方案降低成本

## [x] Task 7: 中英文翻译功能实现
- **Priority**: P1
- **Depends On**: Task 3
- **Description**: 
  - 集成翻译API或使用LLM进行翻译
  - 实现中英文切换展示界面
  - 实现翻译结果的复制功能
  - 保留关键字加粗效果在译文中
- **Acceptance Criteria Addressed**: AC-7
- **Test Requirements**:
  - `programmatic` TR-7.1: 3秒内完成翻译并显示 ✅
  - `programmatic` TR-7.2: 复制功能可正常使用 ✅
  - `human-judgement` TR-7.3: 翻译准确流畅，符合英文表达习惯 ✅
- **Notes**: 可以复用LLM API同时完成翻译，减少依赖

## [x] Task 8: 结果展示和导出功能
- **Priority**: P2
- **Depends On**: Task 4, 5, 6, 7
- **Description**: 
  - 优化结果展示区的排版和样式
  - 实现文案复制功能
  - 实现Markdown格式导出
  - 添加一键分享功能入口
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `programmatic` TR-8.1: 复制功能正常工作 ✅
  - `human-judgement` TR-8.2: 结果展示区排版美观易读 ✅
- **Notes**: 保持界面简洁，不堆砌功能按钮

## [x] Task 9: 优化和完善用户体验
- **Priority**: P2
- **Depends On**: Task 8
- **Description**: 
  - 添加使用示例和提示文案
  - 实现生成历史记录（本地存储）
  - 添加空状态和错误页面设计
  - 性能优化：减少不必要的重渲染
- **Acceptance Criteria Addressed**: AC-8
- **Test Requirements**:
  - `human-judgement` TR-9.1: 首次使用用户能够快速理解操作方式 ✅
  - `programmatic` TR-9.2: Lighthouse性能评分 > 80 ✅
- **Notes**: 重点关注首次加载速度和交互流畅度
