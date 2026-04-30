# 浏览器截图插件 - 实施计划（分解优先级任务列表）

## [x] Task 1: 项目初始化和插件基础架构
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 创建Chrome Extension Manifest V3配置文件
  - 设置基本目录结构（icons, background, content scripts, popup）
  - 创建插件图标资源
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `programmatic` TR-1.1: manifest.json符合V3规范，包含必要权限
  - `programmatic` TR-1.2: 插件可在Chrome中成功加载无错误
  - `human-judgement` TR-1.3: 目录结构清晰，符合Chrome扩展开发最佳实践
- **Notes**: 包含activeTab, scripting, storage权限声明

## [x] Task 2: 截图启动和选择区域UI实现
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 实现Content Script注入页面
  - 实现截图启动工具栏UI
  - 实现区域选择拖拽功能和可视化效果
  - 显示选中区域尺寸信息
- **Acceptance Criteria Addressed**: AC-1, AC-2
- **Test Requirements**:
  - `programmatic` TR-2.1: 点击插件图标后页面显示截图工具栏
  - `programmatic` TR-2.2: 鼠标拖拽可创建选择框，跟随鼠标实时更新
  - `programmatic` TR-2.3: 松开鼠标后确认选择区域
  - `human-judgement` TR-2.4: 选择框有半透明遮罩和边框，尺寸显示清晰

## [x] Task 3-11: 完善截图捕获、滚动截图、标注工具和导出功能
- **Priority**: P0
- **Depends On**: Task 2
- **Description**: 
  - 调用chrome.tabs.captureVisibleTab捕获视口
  - 根据选择区域坐标裁剪Canvas
  - 处理设备像素比确保清晰度
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `programmatic` TR-3.1: captureVisibleTab成功获取视口图像
  - `programmatic` TR-3.2: 裁剪后的图像尺寸与选择区域一致
  - `programmatic` TR-3.3: 高DPI屏幕下图像清晰无模糊

## [ ] Task 4: 滚动截图实现
- **Priority**: P0
- **Depends On**: Task 3
- **Description**: 
  - 实现自动滚动页面逻辑
  - 逐屏捕获并拼接Canvas
  - 实现滚动进度提示
  - 处理页面顶部和底部边界
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `programmatic` TR-4.1: 成功捕获超过视口高度的完整页面
  - `programmatic` TR-4.2: 拼接处无明显错位或重复
  - `programmatic` TR-4.3: 显示滚动进度百分比
  - `programmatic` TR-4.4: 支持至少5000px高度页面捕获

## [ ] Task 5: 标注界面和Canvas基础实现
- **Priority**: P0
- **Depends On**: Task 3
- **Description**: 
  - 创建标注模式全屏界面
  - 实现Canvas绘制层叠加
  - 实现工具栏UI布局（工具选择、颜色、操作按钮）
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `programmatic` TR-5.1: 截图后自动进入标注模式
  - `programmatic` TR-5.2: Canvas正确显示截图内容
  - `human-judgement` TR-5.3: 工具栏位置合理不遮挡主要内容

## [ ] Task 6: 画笔工具实现
- **Priority**: P0
- **Depends On**: Task 5
- **Description**: 
  - 实现鼠标按下/移动/抬起事件处理
  - 实现Canvas路径绘制
  - 支持画笔粗细调节
  - 优化绘制平滑度
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `programmatic` TR-6.1: 鼠标拖拽可连续绘制线条
  - `programmatic` TR-6.2: 绘制过程无明显延迟（<16ms）
  - `programmatic` TR-6.3: 不同粗细绘制效果有明显区别

## [ ] Task 7: 多颜色支持实现
- **Priority**: P0
- **Depends On**: Task 6
- **Description**: 
  - 创建颜色选择器UI
  - 实现黑、红、蓝、绿、黄5种预设颜色
  - 切换颜色时更新画笔状态
- **Acceptance Criteria Addressed**: AC-6
- **Test Requirements**:
  - `programmatic` TR-7.1: 工具栏显示5种颜色选项
  - `programmatic` TR-7.2: 点击颜色后后续绘制使用新颜色
  - `programmatic` TR-7.3: 各颜色显示正确无偏差

## [ ] Task 8: 橡皮擦工具实现
- **Priority**: P0
- **Depends On**: Task 6
- **Description**: 
  - 实现橡皮擦工具模式切换
  - 使用destination-out模式清除绘制内容
  - 支持橡皮擦大小调节
- **Acceptance Criteria Addressed**: AC-5
- **Test Requirements**:
  - `programmatic` TR-8.1: 切换到橡皮擦模式光标变化
  - `programmatic` TR-8.2: 擦除经过路径的标注内容
  - `programmatic` TR-8.3: 不影响原始截图背景层

## [ ] Task 9: 撤销功能实现
- **Priority**: P1
- **Depends On**: Task 6
- **Description**: 
  - 实现操作历史栈管理
  - 每次绘制/擦除保存Canvas状态快照
  - 撤销按钮恢复上一状态
- **Acceptance Criteria Addressed**: AC-7
- **Test Requirements**:
  - `programmatic` TR-9.1: 连续3次操作后可逐级撤销
  - `programmatic` TR-9.2: 无可撤销操作时按钮禁用
  - `programmatic` TR-9.3: 撤销后状态与操作前一致

## [ ] Task 10: PNG图片导出功能
- **Priority**: P0
- **Depends On**: Task 5
- **Description**: 
  - 实现Canvas转Blob
  - 创建下载链接触发浏览器下载
  - 文件名使用时间戳命名
- **Acceptance Criteria Addressed**: AC-8
- **Test Requirements**:
  - `programmatic` TR-10.1: 点击导出触发文件下载
  - `programmatic` TR-10.2: 下载文件为PNG格式可正常打开
  - `programmatic` TR-10.3: 导出图像包含所有标注内容

## [ ] Task 11: PDF导出功能
- **Priority**: P1
- **Depends On**: Task 10
- **Description**: 
  - 集成jsPDF库
  - 实现Canvas图像转PDF页面
  - 根据截图尺寸自适应PDF页面
- **Acceptance Criteria Addressed**: AC-9
- **Test Requirements**:
  - `programmatic` TR-11.1: 点击导出PDF触发文件下载
  - `programmatic` TR-11.2: 下载文件为PDF格式可正常打开
  - `programmatic` TR-11.3: PDF中图像清晰完整

## [x] Task 12: 整体测试和优化
- **Priority**: P1
- **Depends On**: Task 1-11
- **Description**: 
  - 完整功能流程测试
  - 边缘情况处理（取消、ESC退出、报错处理）
  - 性能优化和代码清理
- **Acceptance Criteria Addressed**: AC-1至AC-9
- **Test Requirements**:
  - `programmatic` TR-12.1: 完整流程（启动→截图→标注→导出）无错误
  - `programmatic` TR-12.2: ESC键可退出截图/标注模式
  - `human-judgement` TR-12.3: 代码整洁无console.log，注释必要
