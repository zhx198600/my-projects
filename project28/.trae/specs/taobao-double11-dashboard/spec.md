# 淘宝双11数字大屏 - Product Requirement Document

## Overview
- **Summary**: 构建一个淘宝双11实时交易信息监控大屏，展示全国各地区交易数据，支持地图下钻功能，数据每分钟自动刷新，适配高分辨率显示。
- **Purpose**: 通过可视化大屏实时展示双11期间全国各地区交易数据，为运营决策提供数据支撑，打造科技感、专业感的数据展示平台。
- **Target Users**: 电商运营团队、数据分析人员、管理层

## Goals
- 实现全国地图为背景的区域交易数据展示
- 支持省级区域点击下钻功能
- 实现数据每分钟自动刷新机制
- 兼容1080*1920及以上分辨率显示
- 提供美观、现代化的大屏UI设计
- 后端使用Python提供数据API接口

## Non-Goals (Out of Scope)
- 不实现用户登录认证系统
- 不提供历史数据回溯查询功能
- 不实现数据导出和报表生成
- 不支持移动端适配
- 不连接真实淘宝交易系统，使用模拟数据

## Background & Context
- 双11电商大促需要实时数据监控来支撑运营决策
- 大屏数据可视化已成为电商大促活动的标配展示方式
- Python后端具备优秀的数据处理能力和生态支持

## Functional Requirements
- **FR-1**: 全国地图背景展示，支持34个省级行政区数据展示
- **FR-2**: 点击省级区域下钻到市级地图展示对应数据
- **FR-3**: 数据每60秒自动刷新
- **FR-4**: 核心指标展示（总交易额、订单量、客单价、实时在线人数）
- **FR-5**: 区域交易排行榜展示
- **FR-6**: Python后端提供RESTful API数据接口

## Non-Functional Requirements
- **NFR-1**: 兼容1920x1080及以上分辨率，支持2K、4K显示
- **NFR-2**: 页面加载时间 < 2秒
- **NFR-3**: API响应时间 < 500ms
- **NFR-4**: 界面美观，具备科技感，配色符合双11主题
- **NFR-5**: 地图交互流畅，无明显卡顿

## Constraints
- **Technical**: 后端必须使用Python，前端技术栈不限
- **Business**: 使用模拟数据，不接入真实交易系统
- **Dependencies**: 地图可视化库（ECharts/GeoJSON）、Python Web框架

## Assumptions
- 使用ECharts作为地图可视化组件
- 后端采用FastAPI或Flask框架
- 数据采用随机模拟生成，模拟真实交易波动
- 浏览器支持现代ES6+特性

## Acceptance Criteria

### AC-1: 全国地图展示区域交易数据
- **Given**: 用户打开大屏页面
- **When**: 页面加载完成
- **Then**: 页面中央显示中国地图，各省份标注交易数据，颜色深浅代表交易额大小
- **Verification**: `human-judgment`
- **Notes**: 检查地图渲染完整性和数据标注清晰度

### AC-2: 省级区域点击下钻功能
- **Given**: 用户在全国地图页面
- **When**: 点击任意省级区域
- **Then**: 地图下钻显示该省份的市级地图，并展示对应地市的交易数据
- **Verification**: `programmatic`
- **Notes**: 验证点击事件触发和地图层级切换

### AC-3: 数据每分钟自动刷新
- **Given**: 页面正常显示中
- **When**: 等待60秒
- **Then**: 所有数据指标自动更新，无页面整体刷新
- **Verification**: `programmatic`
- **Notes**: 验证刷新间隔准确性和数据更新机制

### AC-4: 分辨率兼容性
- **Given**: 在不同分辨率显示器上打开页面
- **When**: 设置分辨率为1920x1080、2560x1440、3840x2160
- **Then**: 页面元素自适应布局，无变形、无溢出、显示完整
- **Verification**: `human-judgment`
- **Notes**: 验证多种分辨率下显示效果

### AC-5: 核心指标展示
- **Given**: 页面加载完成
- **When**: 查看页面顶部
- **Then**: 显示总交易额、订单量、客单价、实时在线人数四大核心指标
- **Verification**: `human-judgment`
- **Notes**: 检查指标数值和动效展示

### AC-6: Python后端API服务
- **Given**: 后端服务已启动
- **When**: 调用/api/overview、/api/region、/api/ranking接口
- **Then**: 返回JSON格式的正确数据结构
- **Verification**: `programmatic`
- **Notes**: 验证接口响应状态码和数据格式

### AC-7: 界面美观性
- **Given**: 页面完整加载
- **When**: 查看整体界面效果
- **Then**: 配色协调统一，具备科技感大屏视觉效果，动画流畅
- **Verification**: `human-judgment`
- **Notes**: 评估整体视觉效果和用户体验

### AC-8: 区域排行榜展示
- **Given**: 页面加载完成
- **When**: 查看排行榜模块
- **Then**: 显示TOP10省份交易额排行榜，支持实时更新
- **Verification**: `human-judgment`
- **Notes**: 验证排名数据和更新机制

## Open Questions
- [ ] 是否需要增加品类销售占比图表？
- [ ] 是否需要增加实时交易流水动效？
- [ ] 是否需要添加背景音乐或音效？
