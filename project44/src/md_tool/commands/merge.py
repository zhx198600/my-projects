import sys
from pathlib import Path


def register_merge(subparsers):
    parser = subparsers.add_parser("merge", help="Merge multiple Markdown files into one")
    parser.add_argument("inputs", nargs="+", help="Input files or directories")
    parser.add_argument("-o", "--output", default="merged.md", help="Output file name (default: merged.md)")
    parser.add_argument("--separator", default="---", help="Separator between files (default: ---)")
    parser.set_defaults(_handler=cmd_merge)


def _collect_files(input_path: Path):
    if not input_path.exists():
        print(f"[ERROR] path does not exist: {input_path}")
        sys.exit(1)
    if input_path.is_file():
        return [input_path]
    if input_path.is_dir():
        files = sorted(input_path.glob("*.md"), key=lambda p: p.name.lower())
        return files
    print(f"[ERROR] unsupported path type: {input_path}")
    sys.exit(1)


def cmd_merge(args):
    all_files = []
    for inp in args.inputs:
        p = Path(inp)
        all_files.extend(_collect_files(p))

    separator_block = f"\n{args.separator}\n\n"

    parts = []
    for f in all_files:
        try:
            content = f.read_text(encoding="utf-8")
        except (OSError, UnicodeDecodeError) as e:
            print(f"[ERROR] cannot read file {f}: {e}")
            sys.exit(1)
        parts.append(content)

    merged = separator_block.join(parts)

    output_path = Path(args.output)
    try:
        output_path.write_text(merged, encoding="utf-8")
    except OSError as e:
        print(f"[ERROR] cannot write output file {output_path}: {e}")
        sys.exit(1)

    print(f"Merged {len(parts)} file(s) into {output_path}")
    sys.exit(0)
