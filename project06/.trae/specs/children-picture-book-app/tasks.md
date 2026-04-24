# 安卓儿童绘本App - The Implementation Plan (Decomposed and Prioritized Task List)

## [x] Task 1: Flutter项目初始化和基础架构搭建
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 创建Flutter项目，配置Android支持
  - 建立项目目录结构（lib/models, lib/screens, lib/widgets, lib/services, assets）
  - 添加必要的依赖包（翻页库、TTS插件等）
  - 配置主题和路由
- **Acceptance Criteria Addressed**: [AC-1, AC-2, AC-10]
- **Test Requirements**:
  - `programmatic` TR-1.1: Flutter项目能成功创建并在Android模拟器上运行
  - `programmatic` TR-1.2: 项目目录结构符合规范
  - `human-judgement` TR-1.3: 依赖包配置正确，无冲突
- **Notes**: 建议使用 `page_turn` 或类似的Flutter翻页库，使用 `flutter_tts` 插件

## [x] Task 2: 绘本数据模型和内置示例数据
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 定义绘本数据模型（PictureBook, BookPage）
  - 创建至少1本示例绘本的JSON数据文件
  - 准备示例图片资源（每页1张图，建议3-5页）
  - 实现数据加载服务（从assets读取）
- **Acceptance Criteria Addressed**: [AC-1, AC-2]
- **Test Requirements**:
  - `programmatic` TR-2.1: 数据模型定义完整，包含必要字段（id, title, cover, pages[], pageCount等）
  - `programmatic` TR-2.2: 示例绘本数据能成功从assets加载
  - `human-judgement` TR-2.3: 示例图片资源清晰，适合儿童阅读
- **Notes**: 每页数据应包含：imagePath, text, wordPositions（用于逐字高亮的字符位置信息）

## [x] Task 3: 绘本列表页面实现
- **Priority**: P0
- **Depends On**: Task 2
- **Description**: 
  - 实现绘本列表UI（网格或列表布局）
  - 显示绘本封面和标题
  - 实现点击跳转到阅读页面
  - 添加应用标题栏
- **Acceptance Criteria Addressed**: [AC-1, AC-10]
- **Test Requirements**:
  - `programmatic` TR-3.1: 列表正确显示所有可用绘本
  - `programmatic` TR-3.2: 点击绘本能正确导航到阅读页面
  - `human-judgement` TR-3.3: UI布局美观，适合儿童使用
- **Notes**: 考虑使用Card组件，圆角设计，色彩明亮

## [x] Task 4: 绘本阅读基础界面布局
- **Priority**: P0
- **Depends On**: Task 3
- **Description**: 
  - 实现阅读页面Scaffold结构
  - 布局：顶部标题/返回按钮，中间内容区域，底部控制栏
  - 实现页码显示组件
  - 预留机器人吉祥物位置和文字区域
- **Acceptance Criteria Addressed**: [AC-2, AC-9, AC-10]
- **Test Requirements**:
  - `programmatic` TR-4.1: 阅读页面正确显示，能正常接收绘本参数
  - `programmatic` TR-4.2: 页码显示正确（如 "1/5"）
  - `human-judgement` TR-4.3: 布局合理，各区域位置协调
- **Notes**: 中间内容区域需要预留足够空间给翻页组件和文字

## [x] Task 5: 仿真翻页效果集成
- **Priority**: P0
- **Depends On**: Task 4
- **Description**: 
  - 集成翻页库（如 page_flip 或 page_turn）
  - 实现页面内容组件（每页包含图片+文字）
  - 处理翻页事件回调（用于触发朗读）
  - 支持手势滑动翻页
- **Acceptance Criteria Addressed**: [AC-2, AC-3]
- **Test Requirements**:
  - `programmatic` TR-5.1: 能正确显示多页绘本内容
  - `human-judgement` TR-5.2: 翻页动画流畅自然，仿真效果好
  - `programmatic` TR-5.3: 翻页后页码正确更新
  - `programmatic` TR-5.4: 翻页事件能被正确捕获
- **Notes**: 确保左右翻页方向正确（从右向左翻到下一页）

## [x] Task 6: 机器人吉祥物组件
- **Priority**: P1
- **Depends On**: Task 4
- **Description**: 
  - 设计机器人吉祥物形象（使用Flutter CustomPaint或图片资源）
  - 实现机器人组件，固定在界面右下角
  - 添加说话动画效果（嘴巴张合、身体轻微抖动）
  - 动画状态与朗读状态联动
- **Acceptance Criteria Addressed**: [AC-4]
- **Test Requirements**:
  - `human-judgement` TR-6.1: 机器人形象可爱，适合儿童
  - `human-judgement` TR-6.2: 位置合理，不遮挡主要内容
  - `programmatic` TR-6.3: 朗读时动画播放，停止时动画暂停
- **Notes**: 如果使用图片，准备多张帧图实现动画效果；或使用CustomPainter绘制

## [x] Task 7: TTS语音朗读服务封装
- **Priority**: P0
- **Depends On**: Task 4
- **Description**: 
  - 集成 flutter_tts 插件
  - 封装TTS服务类，支持中文语音
  - 实现播放、暂停、停止、继续功能
  - 添加状态回调（开始、结束、每个字/词的回调）
  - 处理语音设置（语速、音调、语言）
- **Acceptance Criteria Addressed**: [AC-5, AC-6]
- **Test Requirements**:
  - `programmatic` TR-7.1: TTS服务能成功初始化
  - `programmatic` TR-7.2: 能正确朗读中文字符串
  - `programmatic` TR-7.3: 播放/暂停/停止控制正常工作
  - `programmatic` TR-7.4: 能获取每个字的朗读进度回调（关键！用于逐字高亮）
- **Notes**: 关键是要获取逐字的朗读进度，不同TTS引擎支持程度不同，可能需要估算或使用range-based回调

## [x] Task 8: 逐字高亮文字显示组件
- **Priority**: P0
- **Depends On**: Task 7
- **Description**: 
  - 实现可逐字高亮的RichText组件
  - 文字默认黑色，高亮时红色
  - 支持按字符索引设置高亮范围
  - 提供API：setHighlightIndex(index)、resetHighlight()
- **Acceptance Criteria Addressed**: [AC-7, AC-8]
- **Test Requirements**:
  - `human-judgement` TR-8.1: 未高亮文字显示为标准黑色
  - `human-judgement` TR-8.2: 高亮文字显示为醒目的红色
  - `programmatic` TR-8.3: 调用setHighlightIndex能正确更新高亮位置
  - `programmatic` TR-8.4: 支持中文分词或逐字符高亮
- **Notes**: 使用TextSpan列表，每个字符或词语一个span，动态修改颜色

## [x] Task 9: 朗读与高亮同步机制
- **Priority**: P0
- **Depends On**: Task 7, Task 8
- **Description**: 
  - 连接TTS服务和高亮组件
  - 实现翻页后自动朗读逻辑
  - 根据TTS回调实时更新高亮索引
  - 处理边界情况（朗读到末尾、暂停后继续）
- **Acceptance Criteria Addressed**: [AC-5, AC-8]
- **Test Requirements**:
  - `programmatic` TR-9.1: 翻页后自动开始朗读
  - `programmatic` TR-9.2: 高亮位置与语音朗读同步
  - `human-judgement` TR-9.3: 同步延迟可接受（< 200ms）
  - `programmatic` TR-9.4: 朗读结束后所有读过的字保持高亮状态
- **Notes**: 如果TTS没有精确的逐字回调，可能需要根据语速估算每个字的朗读时间

## [x] Task 10: 播放控制UI集成
- **Priority**: P1
- **Depends On**: Task 9
- **Description**: 
  - 在底部控制栏添加播放/暂停按钮
  - 按钮状态与朗读状态联动
  - 添加重新播放当前页按钮（可选）
- **Acceptance Criteria Addressed**: [AC-6]
- **Test Requirements**:
  - `programmatic` TR-10.1: 按钮显示正确的状态图标（播放/暂停）
  - `programmatic` TR-10.2: 点击按钮能正确切换播放状态
  - `human-judgement` TR-10.3: 按钮位置明显，易于操作
- **Notes**: 使用明显的图标，大尺寸按钮方便儿童点击

## [x] Task 11: 整体UI美化和主题配置
- **Priority**: P2
- **Depends On**: Task 10
- **Description**: 
  - 配置应用主题（明亮色彩、圆角设计）
  - 统一文字样式和大小
  - 添加合适的间距和内边距
  - 确保整体视觉风格适合儿童
- **Acceptance Criteria Addressed**: [AC-1, AC-2, AC-4]
- **Test Requirements**:
  - `human-judgement` TR-11.1: 整体UI美观、色彩协调
  - `human-judgement` TR-11.2: 文字清晰易读，字号适中
  - `human-judgement` TR-11.3: 风格统一，符合儿童应用定位
- **Notes**: 使用明亮的主色调，避免刺眼的高对比度

## [ ] Task 12: Android兼容性测试和调试
- **Priority**: P1
- **Depends On**: Task 11
- **Description**: 
  - 测试不同Android版本（API 21+）
  - 测试不同屏幕尺寸适配
  - 调试TTS在不同设备上的表现
  - 修复发现的bug
- **Acceptance Criteria Addressed**: [所有AC]
- **Test Requirements**:
  - `programmatic` TR-12.1: 应用能在Android模拟器上正常启动和运行
  - `programmatic` TR-12.2: 所有主要功能工作正常
  - `human-judgement` TR-12.3: UI在不同屏幕尺寸下布局合理
- **Notes**: 特别注意TTS引擎的可用性和中文支持

## [ ] Task 13: 示例绘本内容完善
- **Priority**: P2
- **Depends On**: Task 2
- **Description**: 
  - 完善示例绘本内容（增加页数，优化文字）
  - 确保图片和文字对应正确
  - 准备至少2本不同风格的示例绘本
- **Acceptance Criteria Addressed**: [AC-1, AC-2]
- **Test Requirements**:
  - `human-judgement` TR-13.1: 示例绘本内容完整，故事连贯
  - `human-judgement` TR-13.2: 图片质量好，适合儿童
  - `programmatic` TR-13.3: 多本绘本切换正常
- **Notes**: 选择简单、积极向上的儿童故事内容
