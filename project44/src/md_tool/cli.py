import argparse
import sys

from md_tool.commands.toc import register_toc
from md_tool.commands.check_links import register_check_links
from md_tool.commands.merge import register_merge
from md_tool.commands.export import register_export


def main():
    parser = argparse.ArgumentParser(
        prog="md-tool",
        description="Markdown Toolkit - A CLI tool for processing Markdown files",
    )
    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    register_toc(subparsers)
    register_check_links(subparsers)
    register_merge(subparsers)
    register_export(subparsers)

    args = parser.parse_args()

    if args.command is None:
        parser.print_help()
        sys.exit(1)

    handler = getattr(args, "_handler", None)
    if handler:
        handler(args)
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()
