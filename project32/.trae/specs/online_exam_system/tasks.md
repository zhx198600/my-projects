# 在线考试系统 - The Implementation Plan (Decomposed and Prioritized Task List)

## [x] Task 1: 项目初始化与数据库设计
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 初始化 Flask 项目结构
  - 设计 SQLite 数据库表结构（题目表、试卷表、成绩表）
  - 创建数据库初始化脚本
- **Acceptance Criteria Addressed**: AC-1, AC-8
- **Test Requirements**:
  - `programmatic` TR-1.1: 运行项目可成功启动 Flask 服务
  - `programmatic` TR-1.2: 数据库文件成功创建，包含所有必要表结构
- **Notes**: 题目表需包含科目、题干、选项、正确答案、难度字段

## [x] Task 2: 题库管理 API 实现
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 实现题目添加 API（POST /api/questions）
  - 实现题目查询 API（GET /api/questions，支持科目筛选）
  - 实现题目更新 API（PUT /api/questions/<id>）
  - 实现题目删除 API（DELETE /api/questions/<id>）
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3
- **Test Requirements**:
  - `programmatic` TR-2.1: POST 请求可成功添加题目到数据库
  - `programmatic` TR-2.2: GET 请求可按科目筛选返回题目列表
  - `programmatic` TR-2.3: PUT 请求可成功更新题目信息
  - `programmatic` TR-2.4: DELETE 请求可成功删除题目
- **Notes**: API 返回统一 JSON 格式

## [x] Task 3: 题库管理前端页面
- **Priority**: P0
- **Depends On**: Task 2
- **Description**: 
  - 创建题库管理 HTML 页面
  - 实现题目添加表单
  - 实现题目列表展示与筛选
  - 实现编辑和删除操作的交互
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3, AC-8
- **Test Requirements**:
  - `human-judgement` TR-3.1: 表单布局合理，字段齐全
  - `human-judgement` TR-3.2: 题目列表显示清晰，支持科目筛选
  - `programmatic` TR-3.3: 增删改操作可成功与后端 API 交互
- **Notes**: 使用原生 CSS 进行样式设计

## [x] Task 4: 随机试卷生成功能
- **Priority**: P0
- **Depends On**: Task 2
- **Description**: 
  - 实现试卷生成 API（POST /api/exams/generate）
  - 支持按科目、题量、难度筛选题目
  - 实现随机选题算法
  - 保存生成的试卷信息
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `programmatic` TR-4.1: 指定参数可生成对应题量的试卷
  - `programmatic` TR-4.2: 生成的题目均属于指定科目
  - `programmatic` TR-4.3: 多次生成试卷题目不重复（题库充足时）
- **Notes**: 题库不足时应有友好提示

## [x] Task 5: 在线答题页面与倒计时
- **Priority**: P0
- **Depends On**: Task 4
- **Description**: 
  - 创建试卷选择页面
  - 创建在线答题 HTML 页面
  - 使用 JavaScript 实现倒计时功能
  - 答题数据本地缓存，防止刷新丢失
- **Acceptance Criteria Addressed**: AC-5, AC-8
- **Test Requirements**:
  - `programmatic` TR-5.1: 倒计时每秒准确更新
  - `programmatic` TR-5.2: 倒计时结束自动触发提交
  - `human-judgement` TR-5.3: 答题界面布局合理，题目显示清晰
  - `programmatic` TR-5.4: 刷新页面答题进度不丢失
- **Notes**: 默认考试时间 60 分钟

## [x] Task 6: 自动判分与成绩保存
- **Priority**: P0
- **Depends On**: Task 5
- **Description**: 
  - 实现答题提交 API（POST /api/exams/submit）
  - 实现自动比对答案计算得分逻辑
  - 保存考试成绩记录
  - 实现成绩详情查询 API
- **Acceptance Criteria Addressed**: AC-6
- **Test Requirements**:
  - `programmatic` TR-6.1: 提交答案后自动计算正确得分
  - `programmatic` TR-6.2: 成绩记录成功保存到数据库
  - `programmatic` TR-6.3: 可查询到每道题的对错情况
- **Notes**: 单题分值统一，暂不设置题分权重

## [x] Task 7: 成绩查询页面
- **Priority**: P1
- **Depends On**: Task 6
- **Description**: 
  - 创建成绩列表查询页面
  - 展示历史考试记录（科目、得分、考试时间）
  - 支持查看考试详情（每道题的答题情况）
- **Acceptance Criteria Addressed**: AC-7, AC-8
- **Test Requirements**:
  - `human-judgement` TR-7.1: 成绩列表显示清晰，信息完整
  - `programmatic` TR-7.2: 点击可查看详细答题情况
  - `human-judgement` TR-7.3: 对错标识清晰直观
- **Notes**: 按考试时间倒序排列

## [/] Task 8: 首页导航与整体样式优化
- **Priority**: P1
- **Depends On**: Task 3, Task 5, Task 7
- **Description**: 
  - 创建系统首页与导航菜单
  - 统一各页面样式风格
  - 响应式适配，优化移动端显示
  - 添加页面加载状态与操作反馈
- **Acceptance Criteria Addressed**: AC-8
- **Test Requirements**:
  - `human-judgement` TR-8.1: 导航清晰，各功能入口易于找到
  - `human-judgement` TR-8.2: 各页面样式统一美观
  - `human-judgement` TR-8.3: 移动端无明显布局错位
- **Notes**: 操作成功/失败应有明确提示信息

## [x] Task 9: 项目测试与代码优化
- **Priority**: P2
- **Depends On**: Task 8
- **Description**: 
  - 全功能流程测试
  - 边界情况处理（题库为空、题量不足等）
  - 代码结构优化与注释完善
  - 添加启动说明文档
- **Acceptance Criteria Addressed**: AC-1 ~ AC-8
- **Test Requirements**:
  - `programmatic` TR-9.1: 完整考试流程无报错
  - `programmatic` TR-9.2: 各种边界情况有友好处理
  - `human-judgement` TR-9.3: 代码结构清晰，关键逻辑有注释
- **Notes**: 确保 README 包含启动步骤说明
