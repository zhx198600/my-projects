# 在线考试系统

基于 Flask + SQLite 的轻量级在线考试管理系统，支持完整的考试流程管理。

## 功能特点

### 核心功能
- ✅ **题库管理** - 支持题目的增删改查，支持多科目、多难度级别
- ✅ **试卷生成** - 可根据科目、难度、题量随机生成试卷
- ✅ **在线答题** - 获取试卷详情，开始在线答题
- ✅ **自动阅卷** - 提交后自动评分，生成详细的答题报告
- ✅ **成绩查询** - 查看所有考试记录和详细成绩

### 技术特性
- 📦 **轻量级架构** - Flask 后端 + SQLite 数据库，无需额外依赖
- 🔌 **RESTful API** - 统一的 API 返回格式，便于前端集成
- 🛡️ **边界处理完善** - 完整的异常处理，覆盖各种边界场景
- ✅ **测试覆盖完整** - 包含单元测试和全链路集成测试

## 项目结构

```
project32/
├── app.py                      # Flask 主应用程序
├── database/
│   ├── init_db.py              # 数据库初始化脚本
│   └── exam_system.db          # SQLite 数据库文件（运行时生成）
├── templates/                  # HTML 模板文件
│   ├── index.html
│   ├── questions.html
│   ├── exams.html
│   ├── exam_list.html
│   ├── exam_detail.html
│   ├── scores_list.html
│   └── score_detail.html
├── static/
│   └── css/style.css           # 样式文件
├── test_system.py              # 基础功能单元测试
├── test_comprehensive.py       # 全链路综合测试
└── README.md
```

## 数据库设计

### questions 题库表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键ID |
| subject | TEXT | 科目（数学、语文、英语等） |
| question_text | TEXT | 题目内容 |
| options | TEXT | 选项（JSON格式） |
| correct_answer | TEXT | 正确答案 |
| difficulty | TEXT | 难度（简单/中等/困难） |
| created_at | TIMESTAMP | 创建时间 |

### exams 试卷表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键ID |
| exam_name | TEXT | 试卷名称 |
| subject | TEXT | 科目 |
| difficulty | TEXT | 难度 |
| question_count | INTEGER | 题目数量 |
| total_score | INTEGER | 总分 |
| question_ids | TEXT | 题目ID列表（JSON） |
| questions | TEXT | 题目详情（JSON） |
| created_at | TIMESTAMP | 创建时间 |

### scores 成绩表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键ID |
| exam_id | INTEGER | 关联试卷ID |
| exam_name | TEXT | 试卷名称 |
| student_name | TEXT | 考生姓名 |
| score | INTEGER | 得分 |
| total_score | INTEGER | 总分 |
| correct_count | INTEGER | 正确题数 |
| total_count | INTEGER | 总题数 |
| answer_details | TEXT | 答题详情（JSON） |
| submit_time | TIMESTAMP | 提交时间 |

## API 接口

### 统一返回格式
所有 API 均采用以下统一返回格式：
```json
{
  "success": true,
  "message": "操作成功",
  "data": { ... },
  "timestamp": "2024-01-01T12:00:00.000000"
}
```

### 主要接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | 系统健康检查 |
| GET | `/api/questions` | 获取题目列表 |
| POST | `/api/questions` | 添加新题目 |
| PUT | `/api/questions/{id}` | 更新题目 |
| DELETE | `/api/questions/{id}` | 删除题目 |
| POST | `/api/exams/generate` | 生成试卷 |
| GET | `/api/exams` | 获取试卷列表 |
| GET | `/api/exams/{id}` | 获取试卷详情 |
| POST | `/api/exams/{id}/submit` | 提交试卷 |
| GET | `/api/scores` | 获取成绩列表 |
| GET | `/api/scores/{id}` | 获取成绩详情 |

## 快速开始

### 环境要求
- Python 3.7+
- Flask 2.0+

### 安装依赖

```bash
pip3 install flask
```

### 启动项目

```bash
# 1. 进入项目目录
cd /path/to/project32

# 2. 启动应用
python3 app.py
```

服务将在 `http://0.0.0.0:5002` 启动。

### 访问页面

- 首页: `http://localhost:5002/`
- 题库管理: `http://localhost:5002/questions`
- 生成试卷: `http://localhost:5002/exams`
- 试卷列表: `http://localhost:5002/exam-list`
- 成绩列表: `http://localhost:5002/scores`

## 运行测试

### 运行所有测试
```bash
# 基础单元测试（13项）
python3 test_system.py

# 全链路综合测试（9项）
python3 test_comprehensive.py
```

### 测试覆盖范围
- ✅ **完整考试流程**：添加题目→生成试卷→开始答题→提交试卷→查看成绩
- ✅ **边界情况处理**：
  - 空题库生成试卷
  - 题量不足时生成试卷
  - 提交空答案
  - 无效题量（0或负数）
  - 访问不存在的资源
  - 生成试卷不指定科目
  - 同一试卷允许多次提交
- ✅ **API返回格式一致性**

## 考试流程示例

1. **添加题目**
```bash
curl -X POST http://localhost:5002/api/questions \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "数学",
    "question_text": "1 + 1 = ?",
    "options": {"A": "1", "B": "2", "C": "3", "D": "4"},
    "correct_answer": "B",
    "difficulty": "简单"
  }'
```

2. **生成试卷**
```bash
curl -X POST http://localhost:5002/api/exams/generate \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "数学",
    "question_count": 5,
    "difficulty": "简单",
    "exam_name": "数学期末考试"
  }'
```

3. **提交答卷**
```bash
curl -X POST http://localhost:5002/api/exams/1/submit \
  -H "Content-Type: application/json" \
  -d '{
    "answers": {"1": "A", "2": "B", "3": "C"},
    "student_name": "张三"
  }'
```

## 开发说明

- 数据库自动初始化：首次运行时会自动创建数据库和表
- 所有 API 均有完整的异常处理机制
- 代码结构清晰，便于二次开发

## 版本历史

- v1.0.0 - 完成基础功能，包含完整考试流程和测试覆盖
