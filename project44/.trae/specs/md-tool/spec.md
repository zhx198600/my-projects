# Markdown Toolkit (md-tool) - 产品需求文档

## Overview
- **Summary**: 一个命令行工具 `md-tool`，用于处理 Markdown 文件集，支持目录生成、内部链接检查、多文件合并以及导出为 PDF/HTML 格式。
- **Purpose**: 为技术文档作者和项目维护者提供一站式 Markdown 文档处理能力，减少手动维护文档结构和链接的工作量。
- **Target Users**: 技术文档作者、开源项目维护者、需要批量处理 Markdown 文档的开发者。

## Goals
- 自动生成 Markdown 文档集的目录（TOC）文件，包含层级化的链接结构
- 检查 Markdown 文档中的内部相对链接是否指向有效的目标文件或锚点
- 将多个 Markdown 文件按指定顺序合并为一个文件，支持目录分隔符
- 将 Markdown 文件导出为 PDF 或 HTML 格式，保留格式和样式

## Non-Goals (Out of Scope)
- 不涉及 Markdown 语法的扩展或自定义解析器的深度定制
- 不提供 GUI 界面，仅限命令行交互
- 不实现 Markdown 与其他格式（如 Word、EPUB）的互转
- 不提供文档托管或在线预览功能

## Background & Context
- Markdown 是技术文档的事实标准，但大型文档集往往缺少自动化工具来管理结构和链接一致性
- 现有工具（如 `markdownlint`、`pandoc`）各有所长但不够聚焦，需要一个轻量、统一的工具
- 技术选型：Python 3，CLI 框架使用 `argparse`（标准库），PDF 导出使用 `weasyprint` 或 `markdown` + `pdfkit`，HTML 导出使用 `markdown` 库

## Functional Requirements
- **FR-1 (TOC 生成)**: 用户可指定一个目录，工具扫描其中所有 `.md` 文件，按文件名或目录层级排序，生成一个 `TOC.md` 文件，包含指向各文件的链接
- **FR-2 (链接检查)**: 用户可指定一个目录或文件，工具解析所有 Markdown 链接（`[text](path)`），检查相对路径指向的文件/锚点是否存在，输出报告（通过/警告/错误）
- **FR-3 (文件合并)**: 用户可指定多个 MD 文件或一个包含 MD 文件的目录，按指定顺序合并为单一输出文件，每个文件之间插入可配置的分隔符（如 `---`）
- **FR-4 (PDF 导出)**: 用户可指定一个 MD 文件，将其转换为 PDF 输出，支持自定义 CSS 样式
- **FR-5 (HTML 导出)**: 用户可指定一个 MD 文件，将其转换为 HTML 输出，支持自定义 CSS 样式和是否嵌入样式

## Non-Functional Requirements
- **NFR-1 (性能)**: 处理 100 个以内 MD 文件时，单条命令响应时间应 < 5 秒
- **NFR-2 (可移植性)**: 支持 macOS 和 Linux，Python 3.8+
- **NFR-3 (易用性)**: 所有命令提供 `--help` 帮助信息，错误信息清晰明确
- **NFR-4 (可维护性)**: 代码模块化，每个子命令独立模块，单文件不超过 500 行

## Constraints
- **Technical**: Python 3.8+，仅使用 `argparse`、`markdown`、`pdfkit`/`weasyprint`、`pathlib` 等常用库
- **Business**: 无商业约束，开源友好
- **Dependencies**: PDF 导出依赖系统级工具（如 `wkhtmltopdf` 或 `weasyprint` 的系统依赖）

## Assumptions
- 用户已安装 Python 3.8+ 及 pip
- PDF 导出时用户可安装必要的系统依赖（如 `wkhtmltopdf`）
- Markdown 文件使用 UTF-8 编码
- 内部链接使用标准 Markdown 相对路径语法

## Acceptance Criteria

### AC-1: TOC 生成基本功能
- **Given**: 一个包含多个 `.md` 文件的目录
- **When**: 运行 `md-tool toc <目录路径>`
- **Then**: 在该目录下生成 `TOC.md`，内容包含所有 `.md` 文件的链接列表，按文件名排序
- **Verification**: `programmatic`

### AC-2: TOC 生成层级目录
- **Given**: 一个包含子目录的 MD 文件目录树
- **When**: 运行 `md-tool toc <目录路径> --recursive`
- **Then**: 生成的 TOC 反映目录层级结构，子目录中的文件以缩进形式展示
- **Verification**: `programmatic`

### AC-3: 链接检查——文件存在
- **Given**: 一个 MD 文件包含 `[link](./other.md)` 且目标文件存在
- **When**: 运行 `md-tool check-links <文件路径>`
- **Then**: 输出中该链接标记为通过（PASS）
- **Verification**: `programmatic`

### AC-4: 链接检查——文件缺失
- **Given**: 一个 MD 文件包含 `[link](./missing.md)` 且目标文件不存在
- **When**: 运行 `md-tool check-links <文件路径>`
- **Then**: 输出中该链接标记为错误（ERROR），退出码为非零
- **Verification**: `programmatic`

### AC-5: 链接检查——锚点验证
- **Given**: 一个 MD 文件包含 `[link](./other.md#section)` 且目标文件包含对应标题锚点
- **When**: 运行 `md-tool check-links <文件路径>`
- **Then**: 该链接标记为通过；若锚点不存在则标记为警告（WARN）
- **Verification**: `programmatic`

### AC-6: 文件合并
- **Given**: 三个 MD 文件 `a.md`、`b.md`、`c.md`
- **When**: 运行 `md-tool merge a.md b.md c.md -o output.md`
- **Then**: 生成 `output.md`，内容依次为三个文件的内容，以 `---` 分隔
- **Verification**: `programmatic`

### AC-7: 目录批量合并
- **Given**: 一个包含多个 MD 文件的目录
- **When**: 运行 `md-tool merge <目录路径> -o output.md`
- **Then**: 按文件名排序合并所有 MD 文件
- **Verification**: `programmatic`

### AC-8: PDF 导出
- **Given**: 一个有效的 MD 文件
- **When**: 运行 `md-tool export input.md --format pdf -o output.pdf`
- **Then**: 生成 `output.pdf`，内容与源文件对应，格式可读
- **Verification**: `programmatic`

### AC-9: HTML 导出
- **Given**: 一个有效的 MD 文件
- **When**: 运行 `md-tool export input.md --format html -o output.html`
- **Then**: 生成 `output.html`，为完整 HTML 文档（含 `<html>`、`<head>`、`<body>`）
- **Verification**: `programmatic`

### AC-10: HTML 导出带自定义样式
- **Given**: 一个有效的 MD 文件和一个 CSS 文件
- **When**: 运行 `md-tool export input.md --format html --css style.css -o output.html`
- **Then**: 生成的 HTML 引用或嵌入指定 CSS
- **Verification**: `programmatic`

### AC-11: 帮助信息
- **Given**: 任意状态
- **When**: 运行 `md-tool --help` 或 `md-tool <子命令> --help`
- **Then**: 显示清晰的帮助信息，包含所有参数说明
- **Verification**: `programmatic`

### AC-12: 退出码规范
- **Given**: 命令执行出错（如文件不存在、参数错误）
- **When**: 运行任意命令
- **Then**: 退出码为非零值；成功时退出码为 0
- **Verification**: `programmatic`

## Open Questions
- [ ] PDF 导出方案：优先使用 `weasyprint`（纯 Python）还是 `pdfkit`（依赖 wkhtmltopdf）？
- [ ] TOC 生成的排序方式是否需要支持按文件修改时间排序？
- [ ] 链接检查是否需要支持 URL 格式的外部链接检查（可选功能）？
