# Markdown Toolkit (md-tool) - 实施计划

## [x] Task 1: 项目脚手架与 CLI 入口
- **Priority**: P0
- **Depends On**: None
- **Description**:
  - 创建项目目录结构：`src/md_tool/` 包，包含 `__main__.py`、`cli.py` 等
  - 使用 `argparse` 实现 CLI 主入口，支持 `--help`，包含子命令占位符：`toc`、`check-links`、`merge`、`export`
  - 创建 `pyproject.toml` 或 `setup.py`，声明依赖：`markdown`、`pdfkit` 或 `weasyprint`
  - 所有子命令注册后执行 `md-tool --help` 应显示所有可用子命令
- **Acceptance Criteria Addressed**: AC-11, AC-12
- **Test Requirements**:
  - `programmatic` TR-1.1: `python -m md_tool --help` 输出包含所有四个子命令名称
  - `programmatic` TR-1.2: 传入不存在的子命令时退出码非零
  - `programmatic` TR-1.3: `pyproject.toml` 中正确声明 `markdown` 依赖
- **Notes**: 使用 `pyproject.toml` + `setuptools` 现代方式；模块命名 `md_tool`（下划线），CLI 命令名为 `md-tool`（连字符）

## [x] Task 2: TOC 生成功能
- **Priority**: P0
- **Depends On**: Task 1
- **Description**:
  - 实现 `toc` 子命令：扫描指定目录下所有 `.md` 文件
  - 默认按文件名排序，生成 `TOC.md`，每行格式为 `- [文件名](相对路径)`
  - 支持 `--recursive` 标志，递归扫描子目录，按目录层级缩进（每级增加 2 空格）
  - 支持 `--output` 自定义输出文件名
- **Acceptance Criteria Addressed**: AC-1, AC-2
- **Test Requirements**:
  - `programmatic` TR-2.1: 对包含 3 个 MD 文件的目录执行 `toc`，生成的 `TOC.md` 包含 3 个链接行
  - `programmatic` TR-2.2: 带子目录的目录用 `--recursive`，子目录文件行有缩进前缀
  - `programmatic` TR-2.3: 非 MD 文件被忽略
- **Notes**: 使用 `pathlib.Path.rglob` 或 `iterdir`

## [x] Task 3: 内部链接检查功能
- **Priority**: P0
- **Depends On**: Task 1
- **Description**:
  - 实现 `check-links` 子命令：解析 MD 文件中的所有 `[text](url)` 链接
  - 区分内部相对链接（以 `.` 或无协议开头）和外部链接（`http://`、`https://`）
  - 对内部链接：检查目标文件是否存在；若含 `#anchor`，还需检查目标文件是否存在对应标题锚点
  - 输出格式：`[PASS|WARN|ERROR] 文件:行号 链接路径`
  - 有错误时退出码非零
- **Acceptance Criteria Addressed**: AC-3, AC-4, AC-5
- **Test Requirements**:
  - `programmatic` TR-3.1: 指向存在文件的链接输出 PASS
  - `programmatic` TR-3.2: 指向不存在文件的链接输出 ERROR，退出码非零
  - `programmatic` TR-3.3: 锚点存在时 PASS，锚点不存在时 WARN
  - `programmatic` TR-3.4: 外部链接被跳过（不检查）
- **Notes**: 锚点匹配需将标题转为 kebab-case（与 GitHub 风格一致）

## [x] Task 4: 文件合并功能
- **Priority**: P0
- **Depends On**: Task 1
- **Description**:
  - 实现 `merge` 子命令：接受多个文件路径或一个目录路径
  - 按指定顺序合并文件内容，文件间插入 `---\n\n` 分隔符（可通过 `--separator` 自定义）
  - 支持 `--output` / `-o` 指定输出文件
  - 输入为目录时按文件名排序
- **Acceptance Criteria Addressed**: AC-6, AC-7
- **Test Requirements**:
  - `programmatic` TR-4.1: 三个文件按顺序合并，输出文件内容顺序正确，分隔符存在
  - `programmatic` TR-4.2: 输入目录时按文件名排序合并
  - `programmatic` TR-4.3: `--separator` 自定义分隔符生效
- **Notes**: 保持原始文件内容不变，仅添加分隔符

## [x] Task 5: 导出功能（HTML + PDF）
- **Priority**: P0
- **Depends On**: Task 1
- **Description**:
  - 实现 `export` 子命令：支持 `--format {html,pdf}`
  - HTML 导出：使用 `markdown` 库将 MD 转为 HTML 片段，包装为完整 HTML 文档（`<!DOCTYPE html>` + `<html><head><body>`）
  - PDF 导出：先转 HTML 再用 `pdfkit`（依赖 `wkhtmltopdf`）或 `weasyprint` 生成 PDF
  - 支持 `--css` 参数：HTML 导出时嵌入 `<style>` 标签或 `<link>` 引用；PDF 导出时注入样式
- **Acceptance Criteria Addressed**: AC-8, AC-9, AC-10
- **Test Requirements**:
  - `programmatic` TR-5.1: HTML 导出输出为完整 HTML 文档，包含 `<!DOCTYPE html>`
  - `programmatic` TR-5.2: `--css` 参数传入时，HTML 输出中包含对应 CSS 内容或引用
  - `programmatic` TR-5.3: PDF 导出成功生成文件（非空）
  - `programmatic` TR-5.4: 不支持的格式时报错且退出码非零
- **Notes**: 优先使用 `weasyprint`（纯 Python，无需系统级二进制）；若不可用则 fallback 到 `pdfkit`

## [x] Task 6: 集成测试与端到端验证
- **Priority**: P1
- **Depends On**: Task 2, Task 3, Task 4, Task 5
- **Description**:
  - 创建测试 fixture 目录，包含典型 MD 文件集（含子目录、交叉链接、缺失链接等）
  - 编写集成测试脚本，覆盖所有四个子命令的主要场景
  - 验证错误处理边界条件（空目录、非 MD 文件、权限不足等）
- **Acceptance Criteria Addressed**: AC-1 through AC-12
- **Test Requirements**:
  - `programmatic` TR-6.1: 端到端测试脚本全部通过
  - `programmatic` TR-6.2: 错误输入产生非零退出码
- **Notes**: 使用 Python `unittest` 或 `pytest`
