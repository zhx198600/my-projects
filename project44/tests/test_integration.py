import os
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path


class TestIntegration(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.project_root = Path(__file__).resolve().parent.parent
        cls.fixtures_dir = cls.project_root / "tests" / "fixtures" / "docs"
        cls.temp_dir = Path(tempfile.mkdtemp(prefix="mdtool_test_"))
        cls.env = os.environ.copy()
        cls.env["PYTHONPATH"] = str(cls.project_root / "src")

    @classmethod
    def tearDownClass(cls):
        shutil.rmtree(cls.temp_dir, ignore_errors=True)

    def _run(self, args):
        cmd = ["python", "-m", "md_tool"] + args
        result = subprocess.run(
            cmd,
            cwd=str(self.project_root),
            env=self.env,
            capture_output=True,
            text=True,
        )
        return result

    def test_toc_non_recursive(self):
        output = self.temp_dir / "TOC_nonrecursive.md"
        result = self._run(["toc", str(self.fixtures_dir), "-o", str(output)])
        self.assertEqual(result.returncode, 0, msg=result.stderr)
        self.assertTrue(output.exists())
        content = output.read_text()
        self.assertIn("[guide.md](guide.md)", content)
        self.assertIn("[intro.md](intro.md)", content)
        self.assertIn("[ref.md](ref.md)", content)

    def test_toc_recursive(self):
        output = self.temp_dir / "TOC_recursive.md"
        result = self._run(["toc", str(self.fixtures_dir), "-r", "-o", str(output)])
        self.assertEqual(result.returncode, 0, msg=result.stderr)
        self.assertTrue(output.exists())
        content = output.read_text()
        self.assertIn("[tips.md]", content)
        self.assertIn("  - ", content)

    def test_check_links_pass(self):
        guide = self.fixtures_dir / "guide.md"
        result = self._run(["check-links", str(guide)])
        self.assertIn("[PASS]", result.stdout)
        self.assertIn("./intro.md", result.stdout)

    def test_check_links_error(self):
        guide = self.fixtures_dir / "guide.md"
        result = self._run(["check-links", str(guide)])
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("[ERROR]", result.stdout)
        self.assertIn("./notfound.md", result.stdout)

    def test_check_links_anchor(self):
        guide = self.fixtures_dir / "guide.md"
        result = self._run(["check-links", str(guide)])
        self.assertIn("[PASS]", result.stdout)
        self.assertIn("#api-reference", result.stdout)

    def test_merge_files(self):
        output = self.temp_dir / "merged_files.md"
        intro = self.fixtures_dir / "intro.md"
        guide = self.fixtures_dir / "guide.md"
        result = self._run(["merge", str(intro), str(guide), "-o", str(output)])
        self.assertEqual(result.returncode, 0, msg=result.stderr)
        self.assertTrue(output.exists())
        content = output.read_text()
        self.assertIn("Introduction", content)
        self.assertIn("Guide", content)
        self.assertIn("---", content)

    def test_merge_directory(self):
        output = self.temp_dir / "merged_dir.md"
        result = self._run(["merge", str(self.fixtures_dir), "-o", str(output)])
        self.assertEqual(result.returncode, 0, msg=result.stderr)
        self.assertTrue(output.exists())
        content = output.read_text()
        guide_pos = content.find("Guide")
        intro_pos = content.find("Introduction")
        ref_pos = content.find("API Reference")
        self.assertLess(guide_pos, intro_pos)
        self.assertLess(intro_pos, ref_pos)

    def test_export_html(self):
        output = self.temp_dir / "intro.html"
        intro = self.fixtures_dir / "intro.md"
        result = self._run(["export", str(intro), "-f", "html", "-o", str(output)])
        self.assertEqual(result.returncode, 0, msg=result.stderr)
        self.assertTrue(output.exists())
        content = output.read_text()
        self.assertIn("<!DOCTYPE html>", content)

    def test_export_html_with_css(self):
        css_file = self.temp_dir / "test.css"
        css_file.write_text("body { color: red; }")
        output = self.temp_dir / "intro_css.html"
        intro = self.fixtures_dir / "intro.md"
        result = self._run([
            "export", str(intro), "-f", "html", "-o", str(output),
            "--css", str(css_file),
        ])
        self.assertEqual(result.returncode, 0, msg=result.stderr)
        self.assertTrue(output.exists())
        content = output.read_text()
        self.assertIn("<style>", content)
        self.assertIn("color: red", content)

    def test_export_pdf_unavailable(self):
        output = self.temp_dir / "intro.pdf"
        intro = self.fixtures_dir / "intro.md"
        result = self._run(["export", str(intro), "-f", "pdf", "-o", str(output)])
        self.assertNotEqual(result.returncode, 0)
        combined = (result.stdout + result.stderr).lower()
        self.assertTrue(
            "no pdf backend" in combined or "pdf generation failed" in combined
        )

    def test_error_handling(self):
        result = self._run(["toc", "/nonexistent/path"])
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("Error", result.stderr)

        result = self._run(["check-links", "/nonexistent/file.md"])
        self.assertNotEqual(result.returncode, 0)

        result = self._run([
            "merge", "/nonexistent/file.md",
            "-o", str(self.temp_dir / "out.md"),
        ])
        self.assertNotEqual(result.returncode, 0)

        result = self._run([
            "export", "/nonexistent/file.md",
            "-f", "html", "-o", str(self.temp_dir / "out.html"),
        ])
        self.assertNotEqual(result.returncode, 0)


if __name__ == "__main__":
    unittest.main()
