# PPT智能生成系统 - The Implementation Plan (Decomposed and Prioritized Task List)

## 项目架构概览

本项目采用前后端分离架构：
- **前端**: React 18 + TypeScript + Tailwind CSS
- **后端**: Node.js + Express + TypeScript
- **通信**: RESTful API

---

## [x] Task 1: 项目初始化与基础架构搭建
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 创建前端React项目（使用Vite作为构建工具）
  - 创建后端Node.js + Express项目
  - 配置TypeScript、ESLint、Prettier等开发工具
  - 建立前后端统一的目录结构
  - 配置环境变量管理方案
- **Acceptance Criteria Addressed**: AC-14
- **Test Requirements**:
  - `programmatic` TR-1.1: 前端项目可成功启动（npm run dev）
  - `programmatic` TR-1.2: 后端项目可成功启动并监听端口
  - `programmatic` TR-1.3: 前后端可进行基础API通信（测试/health接口）
  - `human-judgement` TR-1.4: 目录结构清晰，符合React/Node.js最佳实践
- **Notes**: 使用pnpm或npm作为包管理器，确保前后端依赖独立管理

---

## [x] Task 2: 前端 - 内容输入界面开发
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 开发主页面布局（导航栏、内容输入区、操作按钮）
  - 实现文件上传组件（支持拖拽上传和点击选择）
  - 实现文本输入/粘贴组件（多行文本框）
  - 实现两种输入方式的切换逻辑
  - 实现原始内容预览组件
- **Acceptance Criteria Addressed**: AC-2, AC-13, AC-14
- **Test Requirements**:
  - `programmatic` TR-2.1: 文件上传组件可接受.doc和.docx文件
  - `programmatic` TR-2.2: 文本框可接收多行文本输入
  - `programmatic` TR-2.3: 输入方式切换功能正常
  - `human-judgement` TR-2.4: 界面美观，用户体验流畅
  - `human-judgement` TR-2.5: 在不同屏幕尺寸下布局响应式正常
- **Notes**: 文件类型限制仅在前端做初步校验，后端需要再次验证

---

## [x] Task 3: 后端 - Word文档解析API
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 集成mammoth.js库用于Word文档解析
  - 实现文件上传API端点（POST /api/upload）
  - 实现文件类型验证（仅接受.doc, .docx）
  - 实现文件大小限制（如最大10MB）
  - 将解析出的纯文本内容返回给前端
  - 实现临时文件清理机制
- **Acceptance Criteria Addressed**: AC-1, AC-14
- **Test Requirements**:
  - `programmatic` TR-3.1: 上传有效的.docx文件返回200状态码和文本内容
  - `programmatic` TR-3.2: 上传非Word文件返回400错误
  - `programmatic` TR-3.3: 上传超大文件返回413错误
  - `programmatic` TR-3.4: 解析结果与原始文档文字内容完全一致（逐字比对）
  - `programmatic` TR-3.5: 临时文件在处理完成后被清理
- **Notes**: 核心原则：**只提取纯文本，不做任何修改**。保存原始内容供后续比对验证

---

## [x] Task 4: 后端 - 内容分析与智能分页算法
- **Priority**: P0
- **Depends On**: Task 3
- **Description**: 
  - 实现文本结构分析（识别标题、段落、列表项）
  - 实现基于内容长度和逻辑的页面划分算法
  - 每页内容字数控制在合理范围（如标题+200-300字）
  - 实现关键词提取（用于后续插图生成）
  - 实现内容哈希校验（确保内容未被修改）
- **Acceptance Criteria Addressed**: AC-3, AC-4, AC-14
- **Test Requirements**:
  - `programmatic` TR-4.1: 长文本被正确划分为多个页面
  - `programmatic` TR-4.2: 每一页内容完整，无截断
  - `programmatic` TR-4.3: 所有页面内容拼接后与原始内容完全一致
  - `programmatic` TR-4.4: 为每个页面提取到非空关键词列表
  - `programmatic` TR-4.5: 内容哈希校验通过，验证内容未被修改
- **Notes**: 这是核心模块，必须确保内容完整性。实现时应记录处理日志便于调试

---

## [ ] Task 5: 后端 - 页面调整API
- **Priority**: P1
- **Depends On**: Task 4
- **Description**: 
  - 实现页面合并API（POST /api/slides/merge）
  - 实现页面拆分API（POST /api/slides/split）
  - 实现调整后的内容重新索引
  - 确保调整后所有内容完整性
- **Acceptance Criteria Addressed**: AC-5
- **Test Requirements**:
  - `programmatic` TR-5.1: 合并相邻两页后，内容完整合并
  - `programmatic` TR-5.2: 拆分一页后，两页内容之和等于原页
  - `programmatic` TR-5.3: 任意次数调整后，所有页面内容拼接仍与原始内容一致
- **Notes**: 所有调整操作都需要更新内容哈希，确保完整性可验证

---

## [ ] Task 6: 前端 - 幻灯片编辑界面
- **Priority**: P0
- **Depends On**: Task 2, Task 4
- **Description**: 
  - 实现幻灯片缩略图侧边栏
  - 实现主编辑区域（显示当前页面内容和布局）
  - 实现页面导航控制（上一页/下一页/页码显示）
  - 实现页面合并/拆分操作按钮
  - 实现编辑状态与后端数据同步
- **Acceptance Criteria Addressed**: AC-4, AC-5, AC-10
- **Test Requirements**:
  - `programmatic` TR-6.1: 缩略图正确显示所有页面
  - `programmatic` TR-6.2: 点击缩略图可跳转到对应页面
  - `programmatic` TR-6.3: 上一页/下一页导航功能正常
  - `programmatic` TR-6.4: 页面合并/拆分操作后界面正确更新
- **Notes**: 使用React状态管理或Context API管理编辑状态

---

## [x] Task 7: 排版布局引擎 - 预设模板系统
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 设计3-5种专业排版模板（标题页、内容页、列表页、图片+文字页等）
  - 实现模板数据结构定义（JSON配置）
  - 实现模板选择逻辑（根据页面内容类型自动匹配）
  - 定义统一的配色方案和字体规范
- **Acceptance Criteria Addressed**: AC-6, AC-13
- **Test Requirements**:
  - `human-judgement` TR-7.1: 模板设计美观、专业、现代
  - `programmatic` TR-7.2: 每种模板有明确的适用场景定义
  - `programmatic` TR-7.3: 模板配置可被正确解析和渲染
  - `human-judgement` TR-7.4: 配色方案协调，字体清晰可读
- **Notes**: 模板设计需考虑响应式，确保在不同尺寸下显示效果良好

---

## [x] Task 8: 前端 - 排版渲染组件
- **Priority**: P0
- **Depends On**: Task 6, Task 7
- **Description**: 
  - 实现根据模板配置渲染页面内容的组件
  - 实现自适应字体大小（根据内容长度自动调整）
  - 实现图文混排布局
  - 实现排版预览效果
- **Acceptance Criteria Addressed**: AC-6, AC-9
- **Test Requirements**:
  - `programmatic` TR-8.1: 不同模板可被正确渲染
  - `programmatic` TR-8.2: 文字内容完全展示，无截断
  - `human-judgement` TR-8.3: 排版美观，文字清晰可读
  - `programmatic` TR-8.4: 渲染结果可导出为HTML结构
- **Notes**: 确保渲染组件的输出可被后续PDF导出模块正确处理

---

## [ ] Task 9: AI图像生成服务集成
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 选择并集成AI图像生成API（优先DALL-E 3或Stable Diffusion）
  - 实现API密钥管理（环境变量）
  - 实现提示词构建逻辑（基于页面关键词和内容）
  - 实现图像生成请求和响应处理
  - 实现图像下载和本地临时存储
  - 实现错误处理和重试机制
- **Acceptance Criteria Addressed**: AC-7, AC-14
- **Test Requirements**:
  - `programmatic` TR-9.1: API调用成功返回图像URL或图像数据
  - `programmatic` TR-9.2: 生成的图像被正确存储并可访问
  - `programmatic` TR-9.3: API调用失败时有明确的错误提示
  - `human-judgement` TR-9.4: 生成的图像与提示词内容相关
- **Notes**: 
  - 提示词构建是关键，需要包含：主题描述、风格要求（专业、商务、现代）、配色要求等
  - 考虑实现请求队列和进度反馈机制

---

## [ ] Task 10: 后端 - 插图生成与管理API
- **Priority**: P0
- **Depends On**: Task 4, Task 9
- **Description**: 
  - 实现插图生成API端点（POST /api/images/generate）
  - 实现为单页生成多张候选图（2-3张）
  - 实现重新生成插图API
  - 实现插图选择记录管理
  - 实现生成进度跟踪
- **Acceptance Criteria Addressed**: AC-7, AC-8
- **Test Requirements**:
  - `programmatic` TR-10.1: 调用生成API返回指定数量的候选插图
  - `programmatic` TR-10.2: 重新生成API返回新的不同的插图
  - `programmatic` TR-10.3: 选择某张插图后，该页面的插图记录正确更新
  - `programmatic` TR-10.4: 生成过程中可查询进度状态
- **Notes**: 为了用户体验，可以在后台预先生成所有页面的插图，但需要显示进度

---

## [ ] Task 11: 前端 - 插图选择组件
- **Priority**: P1
- **Depends On**: Task 8, Task 10
- **Description**: 
  - 实现插图显示区域（在排版中）
  - 实现候选插图选择界面（底部缩略图）
  - 实现重新生成按钮
  - 实现生成中加载状态和进度显示
  - 实现无插图时的占位显示
- **Acceptance Criteria Addressed**: AC-7, AC-8, AC-11
- **Test Requirements**:
  - `programmatic` TR-11.1: 插图正确显示在排版中
  - `programmatic` TR-11.2: 点击候选缩略图可切换插图
  - `programmatic` TR-11.3: 点击重新生成触发新的生成请求
  - `programmatic` TR-11.4: 生成过程中显示加载状态
  - `programmatic` TR-11.5: 选择插图后预览界面立即更新
- **Notes**: 提供良好的加载状态反馈很重要，因为AI生成可能需要较长时间

---

## [ ] Task 12: 前端 - 在线预览功能
- **Priority**: P0
- **Depends On**: Task 8, Task 11
- **Description**: 
  - 实现幻灯片全屏预览模式
  - 实现预览模式下的导航控件（上一页/下一页）
  - 实现键盘快捷键支持（左右箭头、ESC退出）
  - 实现从编辑模式切换到预览模式
  - 实现预览模式下的缩略图侧边栏（可折叠）
- **Acceptance Criteria Addressed**: AC-9, AC-10, AC-11
- **Test Requirements**:
  - `programmatic` TR-12.1: 点击预览按钮进入全屏预览模式
  - `programmatic` TR-12.2: 上一页/下一页按钮功能正常
  - `programmatic` TR-12.3: 左右箭头键可切换页面
  - `programmatic` TR-12.4: ESC键可退出预览模式
  - `programmatic` TR-12.5: 预览内容与编辑内容完全一致
- **Notes**: 全屏预览应隐藏所有编辑控件，提供沉浸式观看体验

---

## [x] Task 13: 后端 - PDF导出服务
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 集成puppeteer用于HTML转PDF
  - 实现PDF生成API端点（POST /api/export/pdf）
  - 实现自定义页面大小（A4、16:9等）
  - 实现自定义质量选项
  - 确保所有页面样式与HTML预览一致
  - 实现生成的PDF文件临时存储和清理
- **Acceptance Criteria Addressed**: AC-12, AC-14
- **Test Requirements**:
  - `programmatic` TR-13.1: 调用导出API成功生成PDF文件
  - `programmatic` TR-13.2: PDF文件可正常打开（使用PDF库验证）
  - `programmatic` TR-13.3: PDF页面数量与PPT页数一致
  - `human-judgement` TR-13.4: PDF内容和样式与在线预览一致
  - `programmatic` TR-13.5: 临时PDF文件在一定时间后被清理
- **Notes**: 
  - Puppeteer需要Chromium，注意Docker部署时的依赖问题
  - 可以考虑使用puppeteer-cluster处理并发请求

---

## [x] Task 14: 前端 - PDF导出界面
- **Priority**: P0
- **Depends On**: Task 12, Task 13
- **Description**: 
  - 实现导出按钮和下拉菜单
  - 实现导出选项配置（页面大小、质量）
  - 实现导出进度显示
  - 实现导出完成后的文件下载
  - 实现导出错误提示
- **Acceptance Criteria Addressed**: AC-12
- **Test Requirements**:
  - `programmatic` TR-14.1: 点击导出按钮触发导出请求
  - `programmatic` TR-14.2: 导出过程中显示进度
  - `programmatic` TR-14.3: 导出成功后自动触发文件下载
  - `programmatic` TR-14.4: 导出失败时显示明确的错误信息
- **Notes**: 导出可能需要较长时间，提供取消按钮和明确的进度反馈

---

## [ ] Task 15: 内容完整性保障系统
- **Priority**: P0
- **Depends On**: Task 4, Task 5
- **Description**: 
  - 在整个处理流程中实现内容哈希校验
  - 每个关键节点（解析后、分页后、调整后、导出前）都进行完整性验证
  - 实现内容审计日志
  - 前端显示内容完整性状态（如"内容已保护，未被修改"）
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `programmatic` TR-15.1: 任何修改内容的尝试都会被检测到
  - `programmatic` TR-15.2: 正常流程中所有节点的哈希校验都通过
  - `programmatic` TR-15.3: 前端正确显示内容保护状态
  - `programmatic` TR-15.4: 审计日志记录所有内容操作
- **Notes**: 这是系统的核心承诺。建议在导出PDF时将内容哈希写入PDF元数据或第一页的隐藏区域

---

## [ ] Task 16: 错误处理与用户提示
- **Priority**: P1
- **Depends On**: Task 1
- **Description**: 
  - 实现统一的API错误响应格式
  - 实现前端全局错误边界（Error Boundary）
  - 实现友好的用户错误提示（Toast通知）
  - 实现关键操作的确认对话框
  - 实现加载状态的统一管理
- **Acceptance Criteria Addressed**: AC-14
- **Test Requirements**:
  - `programmatic` TR-16.1: API错误返回统一格式的错误信息
  - `programmatic` TR-16.2: 前端错误边界捕获未处理的异常
  - `human-judgement` TR-16.3: 错误提示信息友好且有帮助
  - `programmatic` TR-16.4: 关键操作有二次确认
- **Notes**: 错误信息应该对用户友好，同时为开发者保留足够的调试信息

---

## [ ] Task 17: 性能优化
- **Priority**: P2
- **Depends On**: Task 16
- **Description**: 
  - 实现API响应缓存（如模板配置、已生成的图像）
  - 实现前端组件懒加载
  - 优化大图显示（使用缩略图 + 懒加载）
  - 实现请求队列和批量处理
  - 优化Word解析性能
- **Acceptance Criteria Addressed**: AC-14
- **Test Requirements**:
  - `programmatic` TR-17.1: 首屏加载时间 < 3秒
  - `programmatic` TR-17.2: Word解析（10页内）< 5秒
  - `programmatic` TR-17.3: PPT生成（不含AI）< 10秒
  - `programmatic` TR-17.4: 页面切换响应时间 < 100ms
- **Notes**: 性能测试应在接近生产环境的条件下进行

---

## [ ] Task 18: 响应式适配与跨浏览器测试
- **Priority**: P2
- **Depends On**: Task 17
- **Description**: 
  - 优化平板端显示效果
  - 测试主流浏览器兼容性（Chrome、Firefox、Safari、Edge）
  - 修复特定浏览器的样式问题
  - 实现高对比度模式支持（可访问性）
- **Acceptance Criteria Addressed**: AC-13
- **Test Requirements**:
  - `human-judgement` TR-18.1: 平板端界面布局合理
  - `programmatic` TR-18.2: 在4种主流浏览器中核心功能正常
  - `human-judgement` TR-18.3: 各浏览器中显示效果一致
- **Notes**: 可以使用BrowserStack或类似服务进行跨浏览器测试

---

## 任务依赖关系图

```
Task 1 (基础架构)
    │
    ├──> Task 2 (前端输入界面) ──> Task 6 (编辑界面) ──> Task 8 (排版渲染) ──> Task 12 (在线预览) ──> Task 14 (导出界面)
    │              │                      │
    │              │                      └──> Task 11 (插图选择)
    │              │
    ├──> Task 3 (Word解析) ──> Task 4 (内容分析) ──> Task 5 (页面调整)
    │                                     │
    │                                     └──> Task 15 (完整性保障)
    │
    ├──> Task 7 (模板系统)
    │
    ├──> Task 9 (AI服务集成) ──> Task 10 (插图API)
    │
    ├──> Task 13 (PDF导出服务)
    │
    └──> Task 16 (错误处理) ──> Task 17 (性能优化) ──> Task 18 (响应式适配)
```

## 开发阶段划分

### 第一阶段（MVP核心功能）- P0任务
- Task 1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

### 第二阶段（用户体验优化）- P1任务
- Task 5, 16

### 第三阶段（性能与兼容性）- P2任务
- Task 17, 18
