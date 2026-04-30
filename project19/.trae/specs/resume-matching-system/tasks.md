# 全栈简历快速匹配打分系统 - The Implementation Plan (Decomposed and Prioritized Task List)

## [x] Task 1: 项目初始化与技术栈搭建
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 初始化Node.js后端项目，采用Express.js框架
  - 初始化前端项目，采用Vue 3 + Vite
  - 配置SQLite数据库存储简历数据
  - 配置CORS和基础中间件
  - 建立前后端目录结构
- **Acceptance Criteria Addressed**: [基础架构]
- **Test Requirements**:
  - `programmatic` TR-1.1: 后端服务可在3000端口启动成功
  - `programmatic` TR-1.2: 前端可在5173端口启动成功
  - `programmatic` TR-1.3: 前后端可正常通信
  - `human-judgement` TR-1.4: 项目目录结构清晰合理

## [x] Task 2: 文件上传与解压缩功能实现
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 后端实现multipart/form-data文件上传接口
  - 实现zip压缩包自动解压功能(使用adm-zip)
  - 解压后的文件存储管理
  - 前端实现文件上传组件，支持拖拽上传
  - 上传进度条显示
- **Acceptance Criteria Addressed**: [AC-1]
- **Test Requirements**:
  - `programmatic` TR-2.1: POST /api/upload 接口可正确接收zip文件
  - `programmatic` TR-2.2: 上传的zip文件可成功解压到指定目录
  - `programmatic` TR-2.3: 解压后正确识别目录中的.doc和.docx文件
  - `human-judgement` TR-2.4: 前端上传界面友好，有进度反馈

## [x] Task 3: Word文档解析与字段提取引擎
- **Priority**: P0
- **Depends On**: Task 2
- **Description**: 
  - 集成mammoth.js解析Word文档内容
  - 实现中文简历字段提取算法：姓名、年龄、学历、住址、工作年限、联系方式、在职状态、基础技能、个人特长
  - 实现基于正则和关键词的智能匹配提取
  - 将提取的数据结构化存入数据库
- **Acceptance Criteria Addressed**: [AC-2]
- **Test Requirements**:
  - `programmatic` TR-3.1: 正确读取.docx文件文本内容
  - `programmatic` TR-3.2: 从简历中正确提取姓名字段
  - `programmatic` TR-3.3: 从简历中正确提取年龄/学历/工作年限等数字字段
  - `programmatic` TR-3.4: 提取的字段正确持久化到数据库
  - `human-judgement` TR-3.5: 字段提取准确率达到80%以上

## [x] Task 4: 后端RESTful API设计与实现
- **Priority**: P0
- **Depends On**: Task 3
- **Description**: 
  - 简历列表获取API GET /api/resumes
  - 单条简历详情API GET /api/resumes/:id
  - 简历删除API DELETE /api/resumes/:id
  - 简历文件预览API
  - API参数验证与错误处理
- **Acceptance Criteria Addressed**: [AC-3, AC-4]
- **Test Requirements**:
  - `programmatic` TR-4.1: 获取简历列表接口返回正确的分页数据
  - `programmatic` TR-4.2: 获取单条简历接口返回完整字段
  - `programmatic` TR-4.3: 删除接口正确从数据库移除记录
  - `programmatic` TR-4.4: API错误情况下返回合理HTTP状态码和错误信息

## [x] Task 5: 前端简历列表与展示页面
- **Priority**: P0
- **Depends On**: Task 4
- **Description**: 
  - 简历列表表格组件开发
  - 实现所有字段的表格展示：姓名、年龄、学历、住址、工作年限、联系方式、在职状态、基础技能、个人特长
  - 简历预览弹窗组件：点击预览展示简历完整内容
- **Acceptance Criteria Addressed**: [AC-3, AC-4]
- **Test Requirements**:
  - `programmatic` TR-5.1: 页面加载成功展示简历列表表格
  - `programmatic` TR-5.2: 表格所有列正确显示对应数据
  - `programmatic` TR-5.3: 点击预览按钮正确弹出弹窗显示简历内容
  - `human-judgement` TR-5.4: 列表页面布局美观，响应式展示正常

## [/] Task 6: 多维度搜索筛选功能
- **Priority**: P0
- **Depends On**: Task 5
- **Description**: 
  - 后端实现搜索条件过滤逻辑
  - 年龄段筛选：30岁以下/35岁以下/40岁以下/45岁以下
  - 岗位类型筛选：前端/后台/UI/测试/产品/项目经理(基于技能字段匹配)
  - 工作年限范围筛选
  - 前端搜索筛选表单组件
- **Acceptance Criteria Addressed**: [AC-5, AC-6, AC-7]
- **Test Requirements**:
  - `programmatic` TR-6.1: 年龄段筛选参数正确过滤结果
  - `programmatic` TR-6.2: 岗位类型筛选正确匹配技能关键词
  - `programmatic` TR-6.3: 工作年限范围筛选正确返回结果
  - `programmatic` TR-6.4: 多个筛选条件组合生效
  - `human-judgement` TR-6.5: 筛选表单布局合理，用户体验良好

## [x] Task 7: 匹配度打分算法实现
- **Priority**: P1
- **Depends On**: Task 6
- **Description**: 
  - 设计匹配度打分权重模型：年龄匹配(20%)、岗位匹配(40%)、工作年限匹配(30%)、学历匹配(10%)
  - 后端实现打分算法，每条简历计算0-100分
  - 搜索结果按照分数降序排列
  - 前端展示匹配分数列
- **Acceptance Criteria Addressed**: [AC-8]
- **Test Requirements**:
  - `programmatic` TR-7.1: 每条简历计算得出0-100之间的分数
  - `programmatic` TR-7.2: 搜索结果按分数从高到低排序
  - `programmatic` TR-7.3: 匹配条件越多的简历分数越高
  - `human-judgement` TR-7.4: 分数计算逻辑合理，符合预期

## [x] Task 8: 分页功能实现
- **Priority**: P1
- **Depends On**: Task 5
- **Description**: 
  - 后端分页查询实现，支持page和pageSize参数
  - 分页元数据返回：总数、总页数、当前页
  - 前端分页组件开发
  - 搜索筛选条件下的分页保持
- **Acceptance Criteria Addressed**: [AC-9]
- **Test Requirements**:
  - `programmatic` TR-8.1: 分页参数正确返回对应页数据
  - `programmatic` TR-8.2: 分页元数据（总条数、总页数）正确
  - `programmatic` TR-8.3: 筛选条件下分页结果正确
  - `human-judgement` TR-8.4: 分页组件交互正常，样式美观

## [x] Task 9: Excel导出功能
- **Priority**: P1
- **Depends On**: Task 6
- **Description**: 
  - 后端使用exceljs库实现Excel文件生成
  - 支持导出当前筛选条件下的所有数据
  - Excel包含所有简历字段
  - 前端导出按钮与下载处理
- **Acceptance Criteria Addressed**: [AC-10]
- **Test Requirements**:
  - `programmatic` TR-9.1: GET /api/resumes/export 接口返回Excel文件
  - `programmatic` TR-9.2: 导出的Excel包含所有简历字段列
  - `programmatic` TR-9.3: 导出数据与当前筛选条件一致
  - `programmatic` TR-9.4: 导出超过100条数据无性能问题
  - `human-judgement` TR-9.5: Excel格式美观，可正常打开查看

## [x] Task 10: 整体集成测试与优化
- **Priority**: P2
- **Depends On**: Task 7, Task 8, Task 9
- **Description**: 
  - 端到端流程测试：上传->解析->搜索->导出
  - 性能优化：大文件上传、批量解析
  - 错误边界处理与用户友好提示
  - 界面样式优化与用户体验改进
- **Acceptance Criteria Addressed**: [完整流程验证]
- **Test Requirements**:
  - `programmatic` TR-10.1: 完整流程无报错顺利完成
  - `programmatic` TR-10.2: 异常场景有合理的错误提示
  - `human-judgement` TR-10.3: 整体用户体验流畅
  - `human-judgement` TR-10.4: 代码结构清晰，可维护性良好
