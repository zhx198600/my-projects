# 在线考试系统 - Product Requirement Document

## Overview
- **Summary**: 构建一个基于 Python + Flask + HTML/CSS/JS 的在线考试系统，支持数学、语文、英语三个科目的题库管理、随机试卷生成、在线计时答题、自动判分和成绩查询功能。
- **Purpose**: 提供一个完整的在线考试解决方案，实现题库的高效管理、试卷的自动化生成、学生在线考试过程的监控以及成绩的自动统计与查询。
- **Target Users**: 教师（题库管理、试卷生成）、学生（在线答题、成绩查询）、管理员（系统维护）

## Goals
- 实现数学、语文、英语三个科目的题库 CRUD 管理
- 支持从题库随机抽取题目生成试卷
- 提供学生在线答题界面和倒计时功能
- 实现客观题自动判分和成绩查询功能
- 构建响应式 Web 界面，适配不同设备

## Non-Goals (Out of Scope)
- 不支持主观题智能判分（仅支持客观题自动判分）
- 不实现用户权限管理和登录系统（第一阶段）
- 不支持考试监控和防作弊功能
- 不实现批量导入/导出题库功能
- 不支持多班级、多学生分组管理

## Background & Context
- 系统采用 B/S 架构，后端使用 Flask 框架
- 前端使用原生 HTML/CSS/JS，不引入重型前端框架
- 数据存储使用 SQLite 数据库（文件型数据库，无需额外安装）
- 第一阶段聚焦核心功能实现，后续可扩展用户系统

## Functional Requirements
- **FR-1**: 题库管理 - 支持数学、语文、英语三科目的题目增删改查
- **FR-2**: 题库管理 - 题目包含题干、选项、正确答案、难度、科目属性
- **FR-3**: 试卷生成 - 可按科目、题量、难度随机抽取题目生成试卷
- **FR-4**: 在线答题 - 学生可选择试卷进行在线答题
- **FR-5**: 在线答题 - 答题过程显示实时倒计时，超时自动提交
- **FR-6**: 自动判分 - 答题完成后系统自动计算客观题得分
- **FR-7**: 成绩查询 - 可查看历史考试记录和得分详情
- **FR-8**: 数据持久化 - 所有题库和成绩数据持久化存储

## Non-Functional Requirements
- **NFR-1**: 页面响应时间 < 2 秒
- **NFR-2**: 支持同时 50 人在线答题
- **NFR-3**: 倒计时误差不超过 1 秒
- **NFR-4**: 界面适配桌面端和移动端
- **NFR-5**: 代码结构清晰，易于维护和扩展

## Constraints
- **Technical**: 必须使用 Python + Flask + HTML/CSS/JS 技术栈
- **Business**: 两周内完成核心功能开发
- **Dependencies**: Flask 2.0+, Python 3.8+, SQLite3

## Assumptions
- 用户使用现代浏览器（Chrome、Firefox、Safari）
- 服务器具备基础的 Python 运行环境
- 单用户操作，暂不考虑并发冲突问题
- 题目均为客观题（选择题、判断题）

## Acceptance Criteria

### AC-1: 题库添加功能
- **Given**: 进入题库管理页面
- **When**: 填写题目信息（科目、题干、选项、答案、难度）并提交
- **Then**: 题目成功保存到数据库，题库列表显示新题目
- **Verification**: `programmatic`

### AC-2: 题库查询与筛选
- **Given**: 题库中存在多个科目的题目
- **When**: 按科目筛选或搜索题干关键词
- **Then**: 显示符合条件的题目列表
- **Verification**: `programmatic`

### AC-3: 题库编辑删除
- **Given**: 题库中存在题目
- **When**: 点击编辑修改题目信息或点击删除
- **Then**: 题目信息更新或从数据库中删除
- **Verification**: `programmatic`

### AC-4: 随机试卷生成
- **Given**: 题库中有足够数量的题目
- **When**: 选择科目、题量、难度范围并生成试卷
- **Then**: 系统随机抽取对应题目生成完整试卷
- **Verification**: `programmatic`

### AC-5: 在线答题倒计时
- **Given**: 进入答题页面
- **When**: 开始答题
- **Then**: 页面显示倒计时，每秒更新，时间到自动提交
- **Verification**: `programmatic`

### AC-6: 自动判分功能
- **Given**: 学生完成答题并提交
- **When**: 系统收到答题结果
- **Then**: 自动比对答案计算得分并保存成绩
- **Verification**: `programmatic`

### AC-7: 成绩查询
- **Given**: 存在历史考试记录
- **When**: 进入成绩查询页面
- **Then**: 显示所有考试记录，包含科目、得分、时间
- **Verification**: `programmatic`

### AC-8: 界面可用性
- **Given**: 使用不同设备访问系统
- **When**: 浏览各个功能页面
- **Then**: 界面布局合理，操作流畅，无明显错位
- **Verification**: `human-judgment`

## Open Questions
- [ ] 是否需要区分教师和学生角色？
- [ ] 考试时间是否可配置？
- [ ] 是否支持题目类型扩展（如填空题）？
