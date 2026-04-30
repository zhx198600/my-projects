# 浏览器截图插件 - 产品需求文档

## Overview
- **Summary**: 开发一个功能完整的Chrome浏览器截图插件，支持区域截图、全页面滚动截图、图片标注（画笔、橡皮擦、多颜色）、撤销操作，以及导出图片/PDF格式。
- **Purpose**: 为用户提供便捷的网页截图和标注工具，替代传统截图软件，实现浏览器内一站式截图处理体验。
- **Target Users**: 需要网页截图和标注的普通用户、开发人员、产品经理、教育工作者等。

## Goals
- 实现浏览器区域截图功能
- 实现全页面滚动截图功能
- 实现图片标注功能（画笔工具）
- 实现橡皮擦功能
- 支持多种画笔颜色选择
- 实现标注撤销功能
- 支持导出为PNG图片
- 支持导出为PDF文档

## Non-Goals (Out of Scope)
- 不支持视频录制功能
- 不实现OCR文字识别
- 不支持云存储同步
- 不实现多标签页批量截图
- 不提供社交分享功能

## Background & Context
- 基于Chrome Extension Manifest V3开发
- 使用原生JavaScript和HTML5 Canvas实现图像绘制
- 利用Chrome API实现浏览器交互

## Functional Requirements
- **FR-1**: 用户可通过插件图标或快捷键启动截图
- **FR-2**: 用户可拖动鼠标选择截图区域
- **FR-3**: 用户可选择滚动截图模式捕获完整网页
- **FR-4**: 提供画笔工具进行标注，支持粗细调节
- **FR-5**: 提供橡皮擦工具擦除标注内容
- **FR-6**: 提供至少5种常用颜色供画笔选择
- **FR-7**: 支持撤销上一步标注操作
- **FR-8**: 支持将结果导出为PNG图片文件
- **FR-9**: 支持将结果导出为PDF文档
- **FR-10**: 标注模式下可随时切换工具和颜色

## Non-Functional Requirements
- **NFR-1**: 截图操作响应时间 < 500ms
- **NFR-2**: 标注绘制流畅无卡顿（60fps）
- **NFR-3**: 滚动截图支持至少5000px高度页面
- **NFR-4**: 导出图片质量保持原网页清晰度
- **NFR-5**: 插件安装包大小 < 500KB

## Constraints
- **Technical**: Chrome Extension Manifest V3, Chrome 88+, 纯前端实现无后端依赖
- **Business**: 开源免费，无用户数据收集
- **Dependencies**: jsPDF库用于PDF导出，无其他外部依赖

## Assumptions
- 用户使用Chrome或基于Chromium的浏览器
- 用户具备基本的文件系统读写权限
- 网页内容不包含跨域限制的图片
- 滚动截图时页面无动态加载内容

## Acceptance Criteria

### AC-1: 插件安装和启动
- **Given**: 用户已安装插件
- **When**: 用户点击插件图标或使用快捷键
- **Then**: 截图工具栏显示，页面进入截图准备状态
- **Verification**: `programmatic`
- **Notes**: 工具栏包含区域截图、滚动截图、取消按钮

### AC-2: 区域截图功能
- **Given**: 截图工具已启动
- **When**: 用户拖动鼠标选择区域后松开
- **Then**: 选中区域被截取并进入标注模式
- **Verification**: `programmatic`
- **Notes**: 截取区域显示边框和尺寸提示

### AC-3: 滚动截图功能
- **Given**: 截图工具已启动，页面高度超过视口
- **When**: 用户点击滚动截图按钮并等待
- **Then**: 自动滚动并拼接生成完整页面截图
- **Verification**: `programmatic`
- **Notes**: 显示滚动进度提示

### AC-4: 画笔标注功能
- **Given**: 已进入标注模式
- **When**: 用户选择画笔工具并在图片上绘制
- **Then**: 鼠标轨迹以选定颜色和粗细显示
- **Verification**: `programmatic`
- **Notes**: 实时绘制无延迟

### AC-5: 橡皮擦功能
- **Given**: 已进入标注模式且存在标注内容
- **When**: 用户选择橡皮擦工具并擦除
- **Then**: 经过的路径上的标注内容被清除
- **Verification**: `programmatic`

### AC-6: 颜色选择功能
- **Given**: 已进入标注模式，画笔工具已选中
- **When**: 用户点击不同颜色选项
- **Then**: 后续绘制使用新选择的颜色
- **Verification**: `programmatic`
- **Notes**: 至少提供黑、红、蓝、绿、黄5种颜色

### AC-7: 撤销功能
- **Given**: 已进行至少一次标注操作
- **When**: 用户点击撤销按钮
- **Then**: 上一次标注/擦除操作被恢复
- **Verification**: `programmatic`
- **Notes**: 支持多级撤销

### AC-8: 导出PNG图片
- **Given**: 标注完成
- **When**: 用户点击导出图片按钮
- **Then**: 浏览器下载包含标注的PNG文件
- **Verification**: `programmatic`

### AC-9: 导出PDF文档
- **Given**: 标注完成
- **When**: 用户点击导出PDF按钮
- **Then**: 浏览器下载包含截图的PDF文件
- **Verification**: `programmatic`

## Open Questions
- [ ] 是否需要支持自定义画笔粗细？
- [ ] 是否需要支持添加文字标注？
- [ ] 是否需要支持箭头、矩形等图形标注？
