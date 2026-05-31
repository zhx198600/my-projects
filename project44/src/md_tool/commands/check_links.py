import re
import sys
from pathlib import Path


LINK_PATTERN = re.compile(r"\[([^\]]*)\]\(([^)]+)\)")
HEADING_PATTERN = re.compile(r"^\s{0,3}(#{1,6})\s+(.*?)\s*#*\s*$")


def _slugify_heading(text: str) -> str:
    text = text.strip().lower()
    text = re.sub(r"\s+", "-", text)
    text = re.sub(r"[^\w\u4e00-\u9fff-]", "", text)
    text = re.sub(r"-+", "-", text)
    text = text.strip("-")
    return text


def _extract_headings(file_path: Path) -> set:
    try:
        content = file_path.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError):
        return set()
    headings = set()
    counts = {}
    for line in content.splitlines():
        m = HEADING_PATTERN.match(line)
        if m:
            heading_text = m.group(2).strip()
            slug = _slugify_heading(heading_text)
            if not slug:
                continue
            counts[slug] = counts.get(slug, 0) + 1
            headings.add(slug)
            if counts[slug] > 1:
                headings.add(f"{slug}-{counts[slug] - 1}")
    return headings


def _is_external(url: str) -> bool:
    return url.startswith("http://") or url.startswith("https://")


def _is_internal(url: str) -> bool:
    if _is_external(url):
        return False
    if "://" in url:
        return False
    return True


def _format_result(status, file_path, lineno, url):
    if status == "PASS":
        reason = "✓ 有效"
    elif status == "WARN":
        reason = "⚠ 锚点不存在"
    else:
        reason = "✗ 目标文件不存在"
    return f"[{status}] {file_path}:{lineno}  链接「{url}」 → {reason}"


def _check_file(md_path: Path, results: list):
    md_path = md_path.resolve()
    try:
        lines = md_path.read_text(encoding="utf-8").splitlines()
    except (OSError, UnicodeDecodeError) as e:
        results.append(("WARN", str(md_path), 0, f"cannot read: {e}"))
        return

    base_dir = md_path.parent
    for lineno, line in enumerate(lines, start=1):
        for match in LINK_PATTERN.finditer(line):
            url = match.group(2).strip()
            if not url:
                continue
            if not _is_internal(url):
                continue
            if url.startswith("#"):
                anchor = url[1:]
                headings = _extract_headings(md_path)
                if anchor in headings:
                    results.append(("PASS", str(md_path), lineno, url))
                else:
                    results.append(("WARN", str(md_path), lineno, url))
                continue

            if "#" in url:
                file_part, anchor = url.split("#", 1)
            else:
                file_part, anchor = url, ""

            if file_part:
                target_path = (base_dir / file_part).resolve()
                if not target_path.exists():
                    results.append(("ERROR", str(md_path), lineno, url))
                    continue
                if not target_path.is_file():
                    results.append(("WARN", str(md_path), lineno, url))
                    continue
            else:
                target_path = md_path

            if anchor:
                headings = _extract_headings(target_path)
                if anchor in headings:
                    results.append(("PASS", str(md_path), lineno, url))
                else:
                    results.append(("WARN", str(md_path), lineno, url))
            else:
                results.append(("PASS", str(md_path), lineno, url))


def _is_md_file(p: Path) -> bool:
    return p.is_file() and p.suffix.lower() == ".md"


def _collect_md_files(path: Path):
    if path.is_file():
        if _is_md_file(path):
            yield path
    elif path.is_dir():
        entries = []
        for p in path.rglob("*"):
            if _is_md_file(p):
                entries.append(p)
        entries.sort(key=lambda p: str(p).lower())
        for p in entries:
            yield p


def register_check_links(subparsers):
    parser = subparsers.add_parser("check-links", help="Check internal links in Markdown files")
    parser.add_argument("path", help="File or directory to check")
    parser.set_defaults(_handler=cmd_check_links)


def cmd_check_links(args):
    target = Path(args.path)
    if not target.exists():
        print(f"[ERROR] path does not exist: {target}")
        sys.exit(1)

    results = []
    for md_file in _collect_md_files(target):
        _check_file(md_file, results)

    pass_count = 0
    warn_count = 0
    error_count = 0
    for status, file_path, lineno, url in results:
        print(_format_result(status, file_path, lineno, url))
        if status == "PASS":
            pass_count += 1
        elif status == "WARN":
            warn_count += 1
        else:
            error_count += 1

    print(f"\nSummary: {pass_count} passed, {warn_count} warnings, {error_count} errors")

    if error_count > 0:
        sys.exit(1)
    sys.exit(0)
