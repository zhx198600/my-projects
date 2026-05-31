# 防晒衣销售数据可视化平台 - The Implementation Plan (Decomposed and Prioritized Task List)

## [x] Task 1: 项目初始化和技术栈配置
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 创建项目目录结构（前端+后端）
  - 初始化Vue前端项目（使用Vite或Vue CLI）
  - 初始化后端项目（建议使用Node.js + Express）
  - 配置项目依赖和基础开发环境
- **Acceptance Criteria Addressed**: 基础设施准备
- **Test Requirements**:
  - `programmatic` TR-1.1: 前端项目可正常启动并显示默认页面
  - `programmatic` TR-1.2: 后端服务可正常启动并监听指定端口
  - `human-judgement` TR-1.3: 项目目录结构清晰合理，前后端分离
- **Notes**: 建议后端使用Node.js + Express + better-sqlite3 技术栈

## [ ] Task 2: SQLite数据库设计和初始化
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 设计销售数据表结构（包含日期、地区、商品名称、销售数量、销售金额等字段）
  - 创建数据库初始化脚本
  - 实现数据库连接模块
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `programmatic` TR-2.1: 数据库文件可成功创建
  - `programmatic` TR-2.2: 销售数据表结构正确，包含所有必要字段
  - `programmatic` TR-2.3: 可成功连接数据库并执行基础CRUD操作
- **Notes**: 建议表名：sales，字段：id, date, region, product, quantity, amount

## [x] Task 3: 后端API - 数据导入接口
- **Priority**: P0
- **Depends On**: Task 2
- **Description**: 
  - 实现CSV文件上传接口
  - 实现CSV文件解析逻辑
  - 实现批量数据插入数据库功能
  - 返回导入结果（成功条数、失败条数）
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `programmatic` TR-3.1: POST /api/upload 接口可正常接收CSV文件
  - `programmatic` TR-3.2: CSV数据可正确解析并存入数据库
  - `programmatic` TR-3.3: 导入接口返回正确的统计结果
  - `programmatic` TR-3.4: 重复导入相同数据不会产生重复记录（可选：先清空再导入）
- **Notes**: 使用multer处理文件上传，csv-parser解析CSV文件

## [x] Task 4: 后端API - 统计查询接口
- **Priority**: P0
- **Depends On**: Task 2
- **Description**: 
  - 实现按时间维度统计接口（支持日/月聚合）
  - 实现按地区维度统计接口
  - 实现按商品维度统计接口
  - 所有接口支持时间范围、地区、商品筛选参数
- **Acceptance Criteria Addressed**: AC-2, AC-3, AC-4, AC-5, AC-6, AC-7, AC-8
- **Test Requirements**:
  - `programmatic` TR-4.1: GET /api/stats/time 返回正确的时间维度统计数据
  - `programmatic` TR-4.2: GET /api/stats/region 返回正确的地区维度统计数据
  - `programmatic` TR-4.3: GET /api/stats/product 返回正确的商品维度统计数据
  - `programmatic` TR-4.4: 筛选参数（startDate, endDate, regions, products）可正确过滤数据
- **Notes**: 使用SQL的GROUP BY和WHERE子句实现统计和筛选

## [x] Task 5: 前端页面框架和路由配置
- **Priority**: P1
- **Depends On**: Task 1
- **Description**: 
  - 配置Vue Router，设置页面路由
  - 创建主布局组件（导航栏、侧边栏/标签页）
  - 创建数据导入页面
  - 创建数据可视化看板页面（包含三个维度图表）
- **Acceptance Criteria Addressed**: 前端基础框架
- **Test Requirements**:
  - `human-judgement` TR-5.1: 页面导航正常，可在各页面间切换
  - `human-judgement` TR-5.2: 页面布局美观，导航清晰
  - `programmatic` TR-5.3: 路由配置正确，无404错误
- **Notes**: 建议页面：/import（数据导入）、/dashboard（数据看板）

## [x] Task 6: 前端 - 数据导入功能
- **Priority**: P1
- **Depends On**: Task 3, Task 5
- **Description**: 
  - 创建文件上传组件
  - 实现文件选择和上传逻辑
  - 显示导入进度和结果
  - 提供示例CSV文件下载或格式说明
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `human-judgement` TR-6.1: 上传界面友好，支持拖拽或点击选择文件
  - `programmatic` TR-6.2: 文件可成功上传到后端
  - `human-judgement` TR-6.3: 导入结果清晰展示（成功/失败数量）
- **Notes**: 使用axios发送文件上传请求

## [x] Task 7: 前端图表集成 - 折线图（时间维度）
- **Priority**: P1
- **Depends On**: Task 4, Task 5
- **Description**: 
  - 集成图表库（ECharts或Chart.js）
  - 实现时间维度折线图组件
  - 从后端API获取数据并渲染
  - 支持X轴时间单位切换（日/月）
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `human-judgement` TR-7.1: 折线图正确显示销售金额随时间的变化趋势
  - `human-judgement` TR-7.2: 图表标题、坐标轴、图例清晰完整
  - `programmatic` TR-7.3: 数据与后端API返回一致
- **Notes**: 推荐使用ECharts，功能更丰富

## [ ] Task 8: 前端图表集成 - 饼图（地区维度）
- **Priority**: P1
- **Depends On**: Task 4, Task 5
- **Description**: 
  - 实现地区维度饼图组件
  - 从后端API获取数据并渲染
  - 显示各地区销售金额占比
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `human-judgement` TR-8.1: 饼图正确显示各地区销售占比
  - `human-judgement` TR-8.2: 鼠标悬停显示详细数据
  - `programmatic` TR-8.3: 数据与后端API返回一致
- **Notes**: 饼图标签清晰，颜色区分明显

## [ ] Task 9: 前端图表集成 - 柱状图（商品维度）
- **Priority**: P1
- **Depends On**: Task 4, Task 5
- **Description**: 
  - 实现商品维度柱状图组件
  - 从后端API获取数据并渲染
  - 显示各商品销售数量对比
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `human-judgement` TR-9.1: 柱状图正确显示各商品销售数量对比
  - `human-judgement` TR-9.2: 柱状图高度与数值成正比
  - `programmatic` TR-9.3: 数据与后端API返回一致
- **Notes**: 商品名称较多时考虑横向柱状图

## [x] Task 10: 前端筛选功能实现
- **Priority**: P1
- **Depends On**: Task 7, Task 8, Task 9
- **Description**: 
  - 创建筛选条件组件（时间范围选择器、地区多选、商品多选）
  - 实现筛选条件变更时自动刷新所有图表
  - 实现筛选条件重置功能
- **Acceptance Criteria Addressed**: AC-5, AC-6, AC-7, AC-8
- **Test Requirements**:
  - `human-judgement` TR-10.1: 时间范围选择器可正常选择日期
  - `human-judgement` TR-10.2: 地区和商品支持多选
  - `programmatic` TR-10.3: 筛选条件变化时API请求参数正确
  - `programmatic` TR-10.4: 组合筛选条件返回正确的过滤结果
- **Notes**: 筛选条件统一管理，变更时触发所有图表数据刷新

## [x] Task 11: 整体测试和优化
- **Priority**: P2
- **Depends On**: Task 6, Task 10
- **Description**: 
  - 端到端功能测试
  - 界面样式优化和响应式适配
  - 错误处理和用户提示完善
  - 性能优化（数据加载、图表渲染）
- **Acceptance Criteria Addressed**: NFR-1, NFR-2, NFR-3, NFR-4
- **Test Requirements**:
  - `human-judgement` TR-11.1: 完整流程测试（导入->查看->筛选）无明显bug
  - `human-judgement` TR-11.2: 界面美观，交互流畅
  - `programmatic` TR-11.3: 异常情况有友好提示（如文件格式错误、无数据等）
- **Notes**: 准备测试用CSV数据文件
