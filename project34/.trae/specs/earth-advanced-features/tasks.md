# 3D 地球高级功能 - The Implementation Plan

## [x] Task 1: 图层开关控制面板UI
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 创建左侧图层控制面板
  - 5个独立开关：气象、地震、风场、洋流、夜光
  - 每个开关带图标和说明文字
  - 深色科技风玻璃态设计风格
- **Acceptance Criteria Addressed**: AC-10
- **Test Requirements**:
  - `programmatic` TR-1.1: 点击开关可切换对应图层显示隐藏
  - `human-judgement` TR-1.2: 控制面板样式符合深色科技风
  - `programmatic` TR-1.3: 图层状态可独立控制互不影响
- **Notes**: 使用CSS变量统一管理主题色

## [x] Task 2: USGS地震数据API对接与可视化
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 对接USGS Earthquake API获取近30天地震数据
  - 经纬度转球面坐标定位地震点位
  - 震级映射球体大小和颜色
  - 实现脉冲发光动画效果
  - 添加本地缓存机制避免重复请求
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `programmatic` TR-2.1: 成功获取并解析USGS API数据
  - `human-judgement` TR-2.2: 震级越大球体越大颜色越红
  - `human-judgement` TR-2.3: 每个地震点有脉冲发光动画
- **Notes**: 使用模拟数据作为API不可用时的fallback

## [ ] Task 3: GPU风场粒子系统
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 使用BufferGeometry实现5000+粒子系统
  - 实现全球风场向量场算法
  - 粒子沿向量场流动，出边界后重置
  - 风速映射粒子颜色（蓝-绿-黄-红）
  - 使用GPUInstance优化性能
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `programmatic` TR-3.1: 5000粒子稳定运行>=30fps
  - `human-judgement` TR-3.2: 粒子平滑流动无明显卡顿
  - `human-judgement` TR-3.3: 颜色正确反映风速大小
- **Notes**: 使用柏林噪声生成风向量场数据

## [x] Task 4: 全球洋流箭头可视化
- **Priority**: P1
- **Depends On**: Task 1
- **Description**: 
  - 主要洋流路线数据定义
  - 创建箭头几何体和动画材质
  - 箭头方向指示洋流流向
  - 实现箭头沿路径位移动画
  - 流速映射箭头颜色和大小
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `human-judgement` TR-4.1: 主要洋流路线正确显示
  - `human-judgement` TR-4.2: 箭头方向正确指示流向
  - `human-judgement` TR-4.3: 箭头有平滑位移动画
- **Notes**: 选取10条主要全球洋流即可

## [x] Task 5: 夜光遥感效果增强
- **Priority**: P1
- **Depends On**: Task 1
- **Description**: 
  - 改进夜半球城市灯光着色器
  - 增加灯光亮度随视角变化
  - 添加灯光辉光泛光效果
  - 实现主要城市点光源闪烁效果
- **Acceptance Criteria Addressed**: AC-5
- **Test Requirements**:
  - `human-judgement` TR-5.1: 夜半球城市灯光明显增强
  - `human-judgement` TR-5.2: 灯光有柔和泛光效果
  - `human-judgement` TR-5.3: 主要城市有细微闪烁
- **Notes**: 重点优化着色器emissive强度计算

## [x] Task 6: 国家精确边界几何体
- **Priority**: P1
- **Depends On**: None
- **Description**: 
  - 使用D3.js + TopoJSON生成精确国家多边形
  - 球面三角剖分精确贴合地球曲面
  - 优化几何体数量保证性能
  - 每个国家独立mesh支持精确拾取
- **Acceptance Criteria Addressed**: AC-6
- **Test Requirements**:
  - `human-judgement` TR-6.1: 国家边界形状精确吻合
  - `programmatic` TR-6.2: 射线拾取精确无误判
  - `programmatic` TR-6.3: hover高亮不超出边界
- **Notes**: 使用 earcut 三角剖分库

## [ ] Task 7: 多国家数据对比弹窗
- **Priority**: P1
- **Depends On**: Task 6
- **Description**: 
  - 弹窗支持最多4个国家对比
  - 添加对比按钮到国家数据面板
  - 表格形式并排显示多维度数据
  - 支持移除单个对比项
  - 对比数据可视化柱状图
- **Acceptance Criteria Addressed**: AC-7
- **Test Requirements**:
  - `human-judgement` TR-7.1: 对比表格布局清晰易读
  - `programmatic` TR-7.2: 支持添加/删除对比国家
  - `human-judgement` TR-7.3: 最多4国对比限制生效
- **Notes**: 表格内嵌入迷你柱状图

## [x] Task 8: 时间轴播放器UI组件
- **Priority**: P1
- **Depends On**: None
- **Description**: 
  - 页面底部时间轴控制条
  - 播放/暂停按钮
  - 可拖拽进度条
  - 年份显示和快速跳转
  - 播放速度调节选项
- **Acceptance Criteria Addressed**: AC-8
- **Test Requirements**:
  - `human-judgement` TR-8.1: 时间轴UI美观专业
  - `programmatic` TR-8.2: 进度条拖拽顺畅
  - `programmatic` TR-8.3: 播放状态切换正常
- **Notes**: 参考视频播放器交互设计

## [ ] Task 9: 历年数据演变动画
- **Priority**: P1
- **Depends On**: Task 8
- **Description**: 
  - 生成1990-2025年模拟时序数据
  - 数据帧之间平滑插值过渡
  - 各国颜色和柱状图随时间演变
  - 关键年份数据变化标记
- **Acceptance Criteria Addressed**: AC-9
- **Test Requirements**:
  - `human-judgement` TR-9.1: 数据演变动画平滑自然
  - `programmatic` TR-9.2: 播放速度调节生效
  - `programmatic` TR-9.3: 年份跳转数据立即更新
- **Notes**: 使用线性插值保证帧间平滑

## [x] Task 10: 气象数据模拟与可视化
- **Priority**: P2
- **Depends On**: Task 1
- **Description**: 
  - 全球主要城市气温模拟数据
  - 温度热力球可视化
  - 云层覆盖动画效果
  - 降水量柱状图标记
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `human-judgement` TR-10.1: 主要城市气温点正确显示
  - `human-judgement` TR-10.2: 云层有流动动画效果
  - `programmatic` TR-10.3: 图层开关正常工作
- **Notes**: OpenWeatherMap API需API Key，先用模拟数据
