# 联华保险客户档案全栈Web后台管理系统 - 实施计划

## [x] Task 1: 项目基础架构搭建
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 创建前后端分离项目基础结构
  - 后端：Spring Boot + MyBatis Plus + MySQL + Redis
  - 前端：Vue 3 + Vite + Element Plus + Vue Router + Pinia
  - 配置数据库连接、跨域、统一返回格式、全局异常处理
- **Acceptance Criteria Addressed**: AC-8
- **Test Requirements**:
  - `programmatic` TR-1.1: 后端服务启动成功，Swagger文档可访问
  - `programmatic` TR-1.2: 前端项目启动成功，页面正常渲染
  - `human-judgement` TR-1.3: 项目目录结构清晰，符合规范
- **Notes**: 优先搭建可运行的基础骨架，为后续模块开发奠定基础

## [x] Task 2: 系统管理模块开发
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 用户管理：用户增删改查、重置密码、状态管理
  - 角色管理：角色增删改查、权限分配
  - 菜单管理：菜单树结构维护
  - 操作日志：日志记录与查询
  - 登录认证：JWT令牌、权限拦截
- **Acceptance Criteria Addressed**: AC-8
- **Test Requirements**:
  - `programmatic` TR-2.1: 用户登录成功返回JWT token
  - `programmatic` TR-2.2: 不同角色用户看到的菜单不同
  - `programmatic` TR-2.3: 无权限接口返回403状态码
  - `programmatic` TR-2.4: 用户操作被正确记录到日志表

## [x] Task 3: 客户信息管理模块开发
- **Priority**: P0
- **Depends On**: Task 2
- **Description**: 
  - 客户基本信息管理：姓名、电话、身份证、地址等
  - 投保信息管理：险种、保额、保费、投保日期等
  - 健康档案管理：体检记录、病史、家族病史等
  - 客户联系人管理：紧急联系人、受益人信息
- **Acceptance Criteria Addressed**: AC-1, AC-6, AC-7
- **Test Requirements**:
  - `programmatic` TR-3.1: 创建客户信息成功保存到数据库
  - `programmatic` TR-3.2: 按姓名关键字查询返回匹配结果
  - `programmatic` TR-3.3: 客户列表支持Excel导出
  - `programmatic` TR-3.4: 编辑和删除客户信息功能正常

## [x] Task 4: 销售管理模块开发
- **Priority**: P0
- **Depends On**: Task 3
- **Description**: 
  - 销售线索管理：线索录入、分配、跟进记录
  - 销售商机管理：商机创建、阶段更新、预估金额
  - 合同管理：合同创建、审核、电子档案上传
  - 佣金管理：佣金计算、结算记录查询
- **Acceptance Criteria Addressed**: AC-2, AC-6, AC-7
- **Test Requirements**:
  - `programmatic` TR-4.1: 线索可成功转化为商机
  - `programmatic` TR-4.2: 商机阶段更新历史可追溯
  - `programmatic` TR-4.3: 合同状态变更流程正确
  - `programmatic` TR-4.4: 销售数据支持关键字搜索和导出

## [x] Task 5: 档案生命周期管理模块开发
- **Priority**: P1
- **Depends On**: Task 3
- **Description**: 
  - 档案创建：电子档案上传、分类、编号
  - 档案归档：归档审核、位置管理
  - 档案借阅：借阅申请、审批、归还登记
  - 档案销毁：销毁申请、审批、记录
- **Acceptance Criteria Addressed**: AC-3, AC-6, AC-7
- **Test Requirements**:
  - `programmatic` TR-5.1: 档案文件成功上传并关联客户
  - `programmatic` TR-5.2: 借阅申请审批流程正常执行
  - `programmatic` TR-5.3: 档案状态变更正确记录
  - `programmatic` TR-5.4: 档案查询和导出功能正常

## [x] Task 6: 服务管理模块开发
- **Priority**: P1
- **Depends On**: Task 3
- **Description**: 
  - 工单创建：客户投诉、咨询、理赔申请录入
  - 工单分配：自动或手动分配给处理人员
  - 工单处理：处理过程记录、状态更新
  - 回访评价：客户满意度调查、评分
- **Acceptance Criteria Addressed**: AC-4, AC-6, AC-7
- **Test Requirements**:
  - `programmatic` TR-6.1: 工单成功创建并分配
  - `programmatic` TR-6.2: 工单处理过程可完整记录
  - `programmatic` TR-6.3: 客户回访评价可提交和查看
  - `programmatic` TR-6.4: 工单列表支持搜索和导出

## [x] Task 7: 数据分析与报表模块开发
- **Priority**: P1
- **Depends On**: Task 3, Task 4, Task 6
- **Description**: 
  - 客户统计：新增客户趋势、客户画像、地区分布
  - 销售业绩：销售排名、业绩趋势、转化率分析
  - 服务质量：工单响应时间、解决率、满意度
  - 档案统计：档案数量、借阅率、销毁统计
  - 图表展示：ECharts柱状图、折线图、饼图
- **Acceptance Criteria Addressed**: AC-5, AC-7
- **Test Requirements**:
  - `human-judgement` TR-7.1: 各类图表正确渲染，数据准确
  - `programmatic` TR-7.2: 支持按时间范围筛选统计数据
  - `programmatic` TR-7.3: 报表数据支持PDF导出
  - `human-judgement` TR-7.4: 统计页面布局美观，数据易读

## [x] Task 8: 全局搜索与统一导出功能
- **Priority**: P0
- **Depends On**: Task 3, Task 4, Task 5, Task 6
- **Description**: 
  - 全局搜索组件：顶部搜索框，支持跨模块搜索
  - 统一导出工具类：Excel导出使用EasyExcel，PDF导出使用iText
  - 导出进度提示：大文件导出显示进度条
- **Acceptance Criteria Addressed**: AC-6, AC-7
- **Test Requirements**:
  - `programmatic` TR-8.1: 全局搜索返回各模块匹配结果
  - `programmatic` TR-8.2: Excel导出文件格式正确，内容完整
  - `programmatic` TR-8.3: PDF导出格式正确，样式美观
  - `programmatic` TR-8.4: 10000条数据导出在30秒内完成

## [x] Task 9: 系统集成测试与优化
- **Priority**: P1
- **Depends On**: Task 3 - Task 8
- **Description**: 
  - 端到端集成测试
  - 性能优化：SQL优化、索引优化、缓存优化
  - 界面美化与交互优化
  - Bug修复与用户体验提升
- **Acceptance Criteria Addressed**: AC-1 ~ AC-8
- **Test Requirements**:
  - `programmatic` TR-9.1: 核心业务流程完整执行无错误
  - `programmatic` TR-9.2: 系统响应时间在2秒内
  - `human-judgement` TR-9.3: 界面风格统一，用户体验良好
  - `programmatic` TR-9.4: 所有单元测试和集成测试通过
