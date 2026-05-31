import sys
from pathlib import Path

import markdown


def register_export(subparsers):
    parser = subparsers.add_parser("export", help="Export Markdown files to HTML or PDF")
    parser.add_argument("input", help="Input Markdown file")
    parser.add_argument("-f", "--format", choices=["html", "pdf"], required=True, help="Output format")
    parser.add_argument("-o", "--output", required=True, help="Output file path")
    parser.add_argument("--css", help="Path to custom CSS file")
    parser.set_defaults(_handler=cmd_export)


def _build_html(md_path: Path, css_path):
    if not md_path.exists() or not md_path.is_file():
        print(f"[ERROR] input file does not exist: {md_path}")
        sys.exit(1)

    try:
        text = md_path.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError) as e:
        print(f"[ERROR] cannot read file {md_path}: {e}")
        sys.exit(1)

    html_content = markdown.markdown(
        text, extensions=["extra", "fenced_code", "tables"]
    )

    css_block = ""
    if css_path:
        css_file = Path(css_path)
        if not css_file.exists() or not css_file.is_file():
            print(f"[ERROR] css file does not exist: {css_file}")
            sys.exit(1)
        try:
            css_text = css_file.read_text(encoding="utf-8")
        except (OSError, UnicodeDecodeError) as e:
            print(f"[ERROR] cannot read css file {css_file}: {e}")
            sys.exit(1)
        css_block = f"\n<style>\n{css_text}\n</style>\n"

    title = md_path.stem
    full_html = (
        "<!DOCTYPE html>\n"
        "<html>\n"
        f"<head><meta charset=\"utf-8\"><title>{title}</title>{css_block}</head>\n"
        "<body>\n"
        f"{html_content}\n"
        "</body>\n"
        "</html>"
    )
    return full_html


def _write_output(path: Path, content: str):
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
    except OSError:
        pass
    try:
        if isinstance(content, str):
            path.write_text(content, encoding="utf-8")
        else:
            path.write_bytes(content)
    except OSError as e:
        print(f"[ERROR] cannot write output file {path}: {e}")
        sys.exit(1)


def cmd_export(args):
    md_path = Path(args.input)
    if not md_path.exists() or not md_path.is_file():
        print(f"[ERROR] input file does not exist: {md_path}")
        sys.exit(1)

    output_path = Path(args.output)
    full_html = _build_html(md_path, args.css)

    if args.format == "html":
        _write_output(output_path, full_html)
        print(f"Exported HTML to {output_path}")
        sys.exit(0)

    if args.format == "pdf":
        output_existed = output_path.exists()
        weasyprint_available = False

        try:
            import weasyprint  # type: ignore

            weasyprint_available = True
            try:
                document = weasyprint.HTML(string=full_html, base_url=str(md_path.parent))
                pdf_bytes = document.write_pdf()
                _write_output(output_path, pdf_bytes)
                print(f"Exported PDF to {output_path} (via weasyprint)")
                sys.exit(0)
            except Exception as e:
                print(f"[WARN] weasyprint failed: {e}, trying pdfkit...")
                if output_path.exists() and not output_existed:
                    try:
                        output_path.unlink()
                    except OSError:
                        pass
        except (ImportError, OSError):
            pass

        try:
            import pdfkit  # type: ignore

            try:
                pdfkit.from_string(full_html, str(output_path))
                print(f"Exported PDF to {output_path} (via pdfkit)")
                sys.exit(0)
            except Exception as e:
                print(f"[WARN] pdfkit failed: {e}")
                if output_path.exists() and not output_existed:
                    try:
                        output_path.unlink()
                    except OSError:
                        pass
        except ImportError:
            pass

        if weasyprint_available:
            print(
                "[ERROR] PDF generation failed. "
                "weasyprint is installed but encountered errors. "
                "Check that all required system libraries are installed "
                "(pango, cairo, etc.)."
            )
        else:
            print(
                "[ERROR] no PDF backend available. "
                "Install one of:\n"
                "  - pip install weasyprint\n"
                "  - pip install pdfkit && brew install wkhtmltopdf"
            )
        sys.exit(1)
