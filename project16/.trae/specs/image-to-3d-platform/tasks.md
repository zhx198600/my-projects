# 平面图片转3D可视化平台 - The Implementation Plan (Decomposed and Prioritized Task List)

## [x] Task 1: 项目初始化与基础架构搭建
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 初始化前端React项目（使用Vite或Create React App）
  - 初始化后端Node.js + Express项目
  - 配置项目目录结构
  - 配置基础依赖（路由、CORS、环境变量等）
  - 创建前后端通信的基础API框架
- **Acceptance Criteria Addressed**: N/A (基础设施)
- **Test Requirements**:
  - `programmatic` TR-1.1: 前端项目可正常启动，显示Hello World页面
  - `programmatic` TR-1.2: 后端服务可正常启动，基础健康检查接口返回200
  - `programmatic` TR-1.3: 前后端可正常通信（测试一个简单的API调用）
- **Notes**: 使用Vite创建React项目，Express作为后端框架

## [x] Task 2: 前端页面布局与路由设计
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 设计主要页面路由：首页（上传）、编辑页、3D预览页
  - 实现全局布局组件（Header、导航等）
  - 实现页面间的导航逻辑
  - 配置CSS/样式解决方案（推荐Tailwind CSS）
- **Acceptance Criteria Addressed**: NFR-2
- **Test Requirements**:
  - `programmatic` TR-2.1: 各路由页面可正常访问
  - `human-judgement` TR-2.2: 页面布局清晰，导航直观
  - `programmatic` TR-2.3: 响应式布局在桌面端和平板上正常显示
- **Notes**: 使用React Router管理路由

## [x] Task 3: 图片上传功能实现
- **Priority**: P0
- **Depends On**: Task 2
- **Description**: 
  - 前端实现拖拽上传区域
  - 前端实现点击选择文件上传
  - 实现上传进度显示
  - 后端实现文件接收和存储（临时存储）
  - 实现图片格式和大小验证
  - 上传成功后显示图片预览
- **Acceptance Criteria Addressed**: FR-1, AC-1
- **Test Requirements**:
  - `programmatic` TR-3.1: JPG、PNG、WebP格式图片可成功上传
  - `programmatic` TR-3.2: 超过大小限制的文件被拒绝并显示提示
  - `programmatic` TR-3.3: 上传进度条正确显示进度
  - `programmatic` TR-3.4: 上传成功后图片正确显示在预览区域
- **Notes**: 文件临时存储在服务器，处理完成后可清理

## [x] Task 4: 图像分割API集成（主体识别）
- **Priority**: P0
- **Depends On**: Task 3
- **Description**: 
  - 后端集成第三方图像分割API（如Remove.bg）
  - 实现API密钥环境变量配置
  - 实现主体识别API端点
  - 处理API响应，提取抠图结果
  - 前端实现识别状态显示（loading）
  - 前端显示识别结果（透明背景的主体）
- **Acceptance Criteria Addressed**: FR-2, AC-2
- **Test Requirements**:
  - `programmatic` TR-4.1: API调用成功，返回处理后的图片
  - `programmatic` TR-4.2: 识别过程中显示loading状态
  - `human-judgement` TR-4.3: 识别结果主体清晰，背景透明
  - `programmatic` TR-4.4: API调用失败时有错误提示
- **Notes**: 先使用模拟数据开发，再接入真实API

## [x] Task 5: 主体编辑工具实现
- **Priority**: P0
- **Depends On**: Task 4
- **Description**: 
  - 实现Canvas/SVG绘图环境
  - 实现画笔工具（添加区域）
  - 实现橡皮擦工具（删除区域）
  - 实现撤销/重做功能（历史记录栈）
  - 实现缩放和平移功能
  - 实现画笔大小调节
  - 编辑结果实时更新蒙版
- **Acceptance Criteria Addressed**: FR-3, AC-3
- **Test Requirements**:
  - `programmatic` TR-5.1: 画笔工具可在图片上绘制
  - `programmatic` TR-5.2: 橡皮擦工具可擦除已绘制区域
  - `programmatic` TR-5.3: 撤销/重做功能可正确恢复状态
  - `programmatic` TR-5.4: 缩放和平移功能正常工作
  - `programmatic` TR-5.5: 编辑结果实时反映在主体预览中
- **Notes**: 使用Canvas API或Konva.js等绘图库

## [x] Task 6: 2D转3D API集成
- **Priority**: P0
- **Depends On**: Task 5
- **Description**: 
  - 后端集成第三方2D转3D API（如Tripo3D）
  - 实现编辑后图片的预处理和上传
  - 实现轮询或WebSocket获取转换进度
  - 前端实现"生成3D"按钮和进度显示
  - 处理API响应，获取3D模型文件
- **Acceptance Criteria Addressed**: FR-4, AC-4
- **Test Requirements**:
  - `programmatic` TR-6.1: 编辑后的图片成功上传到3D转换API
  - `programmatic` TR-6.2: 转换进度实时显示
  - `programmatic` TR-6.3: 转换完成后成功获取3D模型文件
  - `programmatic` TR-6.4: 转换失败时有明确的错误提示
- **Notes**: 2D转3D通常需要较长时间，考虑异步处理

## [x] Task 7: 3D模型渲染与交互
- **Priority**: P0
- **Depends On**: Task 6
- **Description**: 
  - 集成Three.js到前端项目
  - 实现GLB/GLTF模型加载器
  - 实现3D场景设置（相机、灯光、渲染器）
  - 实现轨道控制器（旋转、缩放、平移）
  - 实现模型自动居中缩放
  - 提供基础光照效果
- **Acceptance Criteria Addressed**: FR-4, AC-4
- **Test Requirements**:
  - `programmatic` TR-7.1: 3D模型成功加载并显示在场景中
  - `programmatic` TR-7.2: 用户可通过鼠标/触摸旋转、缩放模型
  - `programmatic` TR-7.3: 模型自动居中，大小合适
  - `human-judgement` TR-7.4: 基础光照效果使模型可见且美观
- **Notes**: 使用Three.js的OrbitControls实现交互

## [x] Task 8: 3D渲染风格与颜色美化
- **Priority**: P1
- **Depends On**: Task 7
- **Description**: 
  - 实现"一键渲染"按钮和功能
  - 设计多种渲染风格预设（写实、卡通、赛博朋克等）
  - 实现环境贴图（HDR环境光）
  - 实现材质系统（金属度、粗糙度等参数调整）
  - 实现多种光照配置
  - 实现风格切换时的平滑过渡
  - 可选：集成第三方渲染API增强效果
- **Acceptance Criteria Addressed**: FR-5, AC-5
- **Test Requirements**:
  - `programmatic` TR-8.1: 点击"一键渲染"后模型应用美化效果
  - `programmatic` TR-8.2: 不同风格选项可切换，效果有明显区别
  - `human-judgement` TR-8.3: 渲染效果美观，颜色和光照协调
  - `programmatic` TR-8.4: 风格切换过程流畅，无明显卡顿
- **Notes**: 可使用Three.js的PostProcessing实现更丰富的效果

## [ ] Task 9: 结果导出功能
- **Priority**: P1
- **Depends On**: Task 7, Task 8
- **Description**: 
  - 实现3D模型导出（GLB/GLTF格式）
  - 实现当前渲染视图截图导出（PNG/JPG）
  - 前端实现导出选项选择界面
  - 后端支持文件生成和下载
  - 实现导出进度提示
- **Acceptance Criteria Addressed**: FR-6, AC-6
- **Test Requirements**:
  - `programmatic` TR-9.1: 导出的GLB/GLTF文件可在标准3D查看器中打开
  - `programmatic` TR-9.2: 导出的图片包含当前3D视图的完整内容
  - `programmatic` TR-9.3: 导出过程有进度提示，完成后可下载
  - `programmatic` TR-9.4: 导出失败时有明确错误提示
- **Notes**: 使用Three.js的GLTFExporter导出模型

## [ ] Task 10: 错误处理与用户反馈
- **Priority**: P1
- **Depends On**: Task 1
- **Description**: 
  - 实现全局错误边界（React Error Boundary）
  - 实现API调用失败的重试机制
  - 实现友好的错误提示组件（Toast/Modal）
  - 实现各操作状态的loading指示器
  - 实现空状态和引导提示
- **Acceptance Criteria Addressed**: NFR-2, NFR-4
- **Test Requirements**:
  - `programmatic` TR-10.1: API失败时有清晰的错误提示
  - `programmatic` TR-10.2: 前端异常不会导致页面白屏
  - `human-judgement` TR-10.3: 错误提示信息对用户有帮助
  - `programmatic` TR-10.4: 各操作的loading状态正确显示
- **Notes**: 使用React Query或SWR管理API状态和缓存

## [ ] Task 11: 性能优化与监控
- **Priority**: P2
- **Depends On**: Task 3, Task 6
- **Description**: 
  - 实现图片上传前的客户端压缩
  - 实现3D模型的LOD（细节层次）优化
  - 实现图片懒加载
  - 添加关键操作的性能埋点
  - 实现临时文件的定时清理
- **Acceptance Criteria Addressed**: NFR-1, AC-7
- **Test Requirements**:
  - `programmatic` TR-11.1: 大图片上传前被合理压缩
  - `programmatic` TR-11.2: 3D场景帧率稳定（目标30fps+）
  - `programmatic` TR-11.3: 临时文件在处理完成后被清理
  - `programmatic` TR-11.4: 各关键操作耗时在NFR规定范围内
- **Notes**: 使用浏览器DevTools进行性能分析

## [x] Task 12: API密钥配置与环境管理
- **Priority**: P2
- **Depends On**: Task 4, Task 6
- **Description**: 
  - 实现环境变量管理（开发/生产环境）
  - 可选：实现前端API密钥输入界面（让用户使用自己的密钥）
  - 实现API密钥的安全存储（后端环境变量）
  - 实现API调用次数统计和限额提示
- **Acceptance Criteria Addressed**: NFR-4
- **Test Requirements**:
  - `programmatic` TR-12.1: 不同环境使用正确的API配置
  - `programmatic` TR-12.2: API密钥不会暴露在前端代码中
  - `programmatic` TR-12.3: 达到API限额时有明确提示
- **Notes**: 生产环境使用环境变量，不要硬编码密钥
