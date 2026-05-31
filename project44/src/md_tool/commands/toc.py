import sys
from pathlib import Path


def register_toc(subparsers):
    parser = subparsers.add_parser("toc", help="Generate a table of contents from Markdown files")
    parser.add_argument("path", help="Directory containing Markdown files")
    parser.add_argument("-r", "--recursive", action="store_true", help="Recurse into subdirectories")
    parser.add_argument("-o", "--output", default="TOC.md", help="Output file name (default: TOC.md)")
    parser.set_defaults(_handler=cmd_toc)


def _is_md_file(p: Path) -> bool:
    return p.is_file() and p.suffix.lower() == ".md"


def cmd_toc(args):
    base = Path(args.path).resolve()
    if not base.is_dir():
        print(f"Error: '{args.path}' is not a directory", file=sys.stderr)
        sys.exit(1)

    lines = []

    if args.recursive:
        entries = [p for p in base.rglob("*") if _is_md_file(p) and p.name != args.output]
        entries.sort(key=lambda p: (len(p.relative_to(base).parts) - 1, p.name.lower()))
        for p in entries:
            rel = p.relative_to(base)
            depth = len(rel.parts) - 1
            indent = "  " * depth
            lines.append(f"{indent}- [{p.name}]({rel.as_posix()})")
    else:
        entries = [p for p in base.iterdir() if _is_md_file(p) and p.name != args.output]
        entries.sort(key=lambda p: p.name.lower())
        for p in entries:
            lines.append(f"- [{p.name}]({p.name})")

    if not lines:
        print(f"No Markdown files found in '{base}'")
        return

    output_path = base / args.output
    output_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"TOC written to {output_path}")
