# Markdown Toolkit (md-tool) - 验证清单

- [x] Checkpoint 1: `md-tool --help` 显示四个子命令（toc, check-links, merge, export）和参数说明
- [x] Checkpoint 2: `md-tool toc <dir>` 在目标目录生成 TOC.md，内容按文件名排序，链接格式正确
- [x] Checkpoint 3: `md-tool toc <dir> --recursive` 递归扫描子目录，子目录文件以缩进形式展示
- [x] Checkpoint 4: `md-tool check-links <file>` 对存在的内部链接输出 PASS，对不存在的链接输出 ERROR
- [x] Checkpoint 5: `md-tool check-links` 检测到错误链接时退出码为非零
- [x] Checkpoint 6: `md-tool check-links` 正确识别标题锚点（存在=PASS，不存在=WARN）
- [x] Checkpoint 7: `md-tool merge a.md b.md -o out.md` 按顺序合并两个文件，文件间以 `---` 分隔
- [x] Checkpoint 8: `md-tool merge <dir> -o out.md` 按文件名排序合并目录内所有 MD 文件
- [x] Checkpoint 9: `md-tool export input.md --format html -o out.html` 生成完整 HTML 文档（含 DOCTYPE）
- [x] Checkpoint 10: `md-tool export input.md --format html --css style.css -o out.html` 输出 HTML 包含 CSS 样式
- [x] Checkpoint 11: `md-tool export input.md --format pdf -o out.pdf` 生成有效的 PDF 文件（或提供清晰的安装提示）
- [x] Checkpoint 12: 所有子命令在无效输入（文件不存在、格式错误等）时退出码非零
- [x] Checkpoint 13: 集成测试脚本全部通过
