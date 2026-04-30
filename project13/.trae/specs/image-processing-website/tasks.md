# 图片处理网站 - 实施计划 (Decomposed and Prioritized Task List)

## [ ] Task 1: 项目初始化与后端基础架构
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 初始化 Node.js 项目，创建 package.json
  - 安装 Express 及必要的依赖
  - 创建后端服务器入口文件 (server.js)
  - 配置静态文件服务目录
  - 实现基础的路由（首页、健康检查）
- **Acceptance Criteria Addressed**: AC-9
- **Test Requirements**:
  - `programmatic` TR-1.1: 执行 `npm install` 成功安装所有依赖
  - `programmatic` TR-1.2: 执行 `npm start` 启动服务器，终端显示服务启动信息
  - `programmatic` TR-1.3: 访问 `http://localhost:3000` 返回 200 状态码
  - `programmatic` TR-1.4: 访问 `/health` 端点返回健康状态信息
- **Notes**: 后端主要提供静态文件服务，图片处理主要在前端完成

## [ ] Task 2: 前端基础页面结构 (HTML/CSS)
- **Priority**: P0
- **Depends On**: Task 1
- **Description**:
  - 创建单页应用的 HTML 结构 (index.html)
  - 设计页面布局：顶部导航、左侧工具栏、中央编辑区域、底部状态栏
  - 实现基础 CSS 样式
  - 添加响应式布局支持
  - 准备工具栏按钮和编辑区域的占位元素
- **Acceptance Criteria Addressed**: AC-8
- **Test Requirements**:
  - `human-judgement` TR-2.1: 页面在桌面端正常显示，布局合理
  - `human-judgement` TR-2.2: 页面在移动端（宽度 < 768px）自动适配，工具栏按钮大小合适
  - `programmatic` TR-2.3: 所有必要的 DOM 元素存在并有正确的 ID/类名
  - `human-judgement` TR-2.4: 配色方案简洁专业，视觉层次清晰
- **Notes**: 使用 Flexbox 或 CSS Grid 实现响应式布局

## [x] Task 3: 图片上传与预览功能
- **Priority**: P0
- **Depends On**: Task 2
- **Description**:
  - 实现文件选择器和拖拽上传区域
  - 实现 FileReader API 读取本地图片
  - 创建 Canvas 元素用于图片渲染和编辑
  - 实现图片预览显示（保持原始比例）
  - 显示图片信息（尺寸、大小、格式）
  - 上传成功后激活编辑功能按钮
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `programmatic` TR-3.1: 点击上传按钮可打开文件选择对话框
  - `programmatic` TR-3.2: 拖拽图片到上传区域可成功上传
  - `programmatic` TR-3.3: 上传 JPG/PNG/WebP 格式图片成功显示在 Canvas 上
  - `programmatic` TR-3.4: 图片信息（尺寸、大小、格式）正确显示
  - `programmatic` TR-3.5: 上传超过大小限制的图片显示友好错误提示
  - `programmatic` TR-3.6: 上传非图片文件显示类型错误提示
- **Notes**: 设置合理的图片大小限制（如 10MB）

## [x] Task 4: 操作历史与撤销/重做系统
- **Priority**: P1
- **Depends On**: Task 3
- **Description**:
  - 实现历史记录管理类 (HistoryManager)
  - 存储每个操作后的 Canvas 状态（使用 ImageData 或保存为数据 URL）
  - 实现 undo() 方法恢复上一步状态
  - 实现 redo() 方法恢复已撤销的操作
  - 实现 reset() 方法恢复到原始图片
  - 更新工具栏按钮状态（禁用/启用）
- **Acceptance Criteria Addressed**: AC-7
- **Test Requirements**:
  - `programmatic` TR-4.1: 执行编辑操作后，撤销按钮变为可用
  - `programmatic` TR-4.2: 点击撤销按钮，图片恢复到上一步状态
  - `programmatic` TR-4.3: 撤销后，重做按钮变为可用
  - `programmatic` TR-4.4: 点击重做按钮，恢复已撤销的操作
  - `programmatic` TR-4.5: 点击重置按钮，图片恢复到原始上传状态
  - `programmatic` TR-4.6: 没有历史记录时，撤销/重做按钮保持禁用
- **Notes**: 限制历史记录步数（如 50 步）避免内存占用过高

## [ ] Task 5: 图片裁剪功能
- **Priority**: P0
- **Depends On**: Task 4
- **Description**:
  - 实现裁剪模式激活/退出
  - 创建可拖拽调整的裁剪框（8 个调整手柄）
  - 实现自由比例裁剪和预设比例裁剪（1:1, 4:3, 16:9, 3:2, 2:3）
  - 实现裁剪框拖拽移动功能
  - 实时预览裁剪效果（可以使用半透明覆盖层或缩小预览）
  - 实现确认裁剪和取消裁剪操作
  - 记录裁剪操作到历史记录
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `programmatic` TR-5.1: 点击裁剪按钮进入裁剪模式，显示裁剪框
  - `programmatic` TR-5.2: 拖拽裁剪框边缘可调整大小
  - `programmatic` TR-5.3: 拖拽裁剪框内部可移动位置
  - `programmatic` TR-5.4: 选择 1:1 比例时，裁剪框保持正方形
  - `programmatic` TR-5.5: 确认裁剪后，图片显示裁剪结果
  - `programmatic` TR-5.6: 裁剪后可通过撤销恢复原图
  - `programmatic` TR-5.7: 点击取消裁剪按钮退出裁剪模式，图片保持不变
- **Notes**: 确保裁剪框不会超出图片边界

## [ ] Task 6: 图片旋转功能
- **Priority**: P0
- **Depends On**: Task 5
- **Description**:
  - 实现旋转工具栏 UI（90度左转/右转按钮、180度按钮、角度滑块/输入框）
  - 使用 Canvas 变换矩阵实现图片旋转
  - 实现实时旋转预览
  - 处理旋转后的图片尺寸计算（宽高互换）
  - 实现应用旋转和取消旋转操作
  - 记录旋转操作到历史记录
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `programmatic` TR-6.1: 点击 90 度右转按钮，图片顺时针旋转 90 度
  - `programmatic` TR-6.2: 点击 90 度左转按钮，图片逆时针旋转 90 度
  - `programmatic` TR-6.3: 点击 180 度按钮，图片旋转 180 度
  - `programmatic` TR-6.4: 拖动滑块时，图片实时旋转对应角度
  - `programmatic` TR-6.5: 旋转 90 度后，图片的宽高互换正确
  - `programmatic` TR-6.6: 旋转后可通过撤销恢复原状
- **Notes**: 任意角度旋转时需要计算新的画布尺寸以容纳旋转后的图片

## [ ] Task 7: AI 抠图（模拟）功能
- **Priority**: P1
- **Depends On**: Task 6
- **Description**:
  - 实现 AI 抠图按钮和状态显示
  - 创建模拟处理动画（进度条、加载效果）
  - 实现模拟抠图算法（如简单的颜色阈值或边缘检测）
  - 将背景区域变为透明（使用 alpha 通道）
  - 添加棋盘格背景显示透明效果
  - 激活背景替换功能
  - 记录抠图操作到历史记录
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `programmatic` TR-7.1: 点击 AI 抠图按钮显示处理中动画
  - `programmatic` TR-7.2: 模拟处理持续 2-3 秒后显示完成
  - `programmatic` TR-7.3: 完成后背景变为透明（显示棋盘格）
  - `programmatic` TR-7.4: 主体区域保持不变
  - `programmatic` TR-7.5: 背景替换功能按钮变为可用
  - `programmatic` TR-7.6: 抠图操作可通过撤销恢复原图
- **Notes**: 模拟算法可以使用简单的颜色范围检测，检测与主体颜色差异较大的背景区域

## [ ] Task 8: 背景替换功能
- **Priority**: P1
- **Depends On**: Task 7
- **Description**:
  - 实现背景替换工具栏 UI
  - 提供预设纯色背景选项（白色、黑色、灰色、蓝色等）
  - 实现自定义背景图片上传
  - 在底层 Canvas 绘制背景，上层保持透明主体
  - 实时预览背景替换效果
  - 记录背景替换操作到历史记录
- **Acceptance Criteria Addressed**: AC-5
- **Test Requirements**:
  - `programmatic` TR-8.1: 只有在完成抠图后，背景替换按钮才可用
  - `programmatic` TR-8.2: 选择白色背景，主体后面显示白色背景
  - `programmatic` TR-8.3: 选择黑色背景，主体后面显示黑色背景
  - `programmatic` TR-8.4: 上传背景图片成功显示在主体后面
  - `programmatic` TR-8.5: 背景替换效果实时预览
  - `programmatic` TR-8.6: 背景替换操作可通过撤销恢复
- **Notes**: 背景图片应该按比例缩放以适应画布

## [ ] Task 9: 图片导出与下载功能
- **Priority**: P0
- **Depends On**: Task 8
- **Description**:
  - 实现导出设置 UI（格式选择、质量滑块）
  - 支持 PNG（保留透明）、JPG、WebP 三种格式
  - 实现 JPG/WebP 质量调节（0-100%）
  - 使用 canvas.toBlob() 或 toDataURL() 生成图片
  - 生成下载文件名（如 image_processed_20260427.png）
  - 实现一键下载功能
- **Acceptance Criteria Addressed**: AC-6
- **Test Requirements**:
  - `programmatic` TR-9.1: 选择 PNG 格式下载，图片保留透明背景
  - `programmatic` TR-9.2: 选择 JPG 格式下载，透明背景变为白色（或黑色）
  - `programmatic` TR-9.3: 质量设置为 100% 时，图片质量较高，文件较大
  - `programmatic` TR-9.4: 质量设置为 50% 时，图片质量适中，文件较小
  - `programmatic` TR-9.5: 点击下载按钮触发浏览器下载对话框
  - `programmatic` TR-9.6: 下载的文件名格式正确，包含时间戳
- **Notes**: PNG 格式忽略质量设置，始终无损

## [ ] Task 10: 用户体验优化与错误处理
- **Priority**: P2
- **Depends On**: Task 9
- **Description**:
  - 添加所有操作的加载状态和完成提示
  - 实现友好的错误提示（文件过大、格式不支持等）
  - 添加操作说明/帮助提示
  - 优化移动端触摸操作体验
  - 添加按钮悬停和点击反馈效果
  - 实现键盘快捷键支持（Ctrl+Z 撤销，Ctrl+Y 重做等）
- **Acceptance Criteria Addressed**: AC-1, AC-7, AC-8
- **Test Requirements**:
  - `human-judgement` TR-10.1: 错误提示清晰易懂，帮助用户解决问题
  - `human-judgement` TR-10.2: 所有可交互元素有明显的视觉反馈
  - `programmatic` TR-10.3: 按 Ctrl+Z 触发撤销操作
  - `programmatic` TR-10.4: 按 Ctrl+Y 触发重做操作
  - `human-judgement` TR-10.5: 移动端触摸操作流畅，无卡顿
- **Notes**: 确保所有状态转换有平滑的过渡动画

## [x] Task 11: 最终集成与测试
- **Priority**: P0
- **Depends On**: Task 10
- **Description**:
  - 所有功能模块集成测试
  - 修复发现的 Bug
  - 优化性能（大图处理、历史记录管理等）
  - 验证所有 AC 条件
  - 准备项目启动文档（如 README 简要说明）
- **Acceptance Criteria Addressed**: AC-1 到 AC-9
- **Test Requirements**:
  - `programmatic` TR-11.1: 完整工作流程：上传 -> 裁剪 -> 旋转 -> 抠图 -> 换背景 -> 下载，全部成功
  - `programmatic` TR-11.2: 撤销/重做在完整工作流中正常工作
  - `programmatic` TR-11.3: 多次操作后无内存泄漏或性能明显下降
  - `programmatic` TR-11.4: 服务器启动和访问正常
- **Notes**: 测试不同尺寸、不同格式的图片
