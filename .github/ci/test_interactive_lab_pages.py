"""Run the real PR package step against disposable mixed-content PRs."""
import os
from pathlib import Path
import subprocess
import tempfile
import textwrap
import unittest

ROOT = Path(__file__).resolve().parents[2]
workflow = (ROOT / '.github/workflows/docs-ci.yml').read_text()
step = workflow.split('      - name: Validate Interactive Lab release scope and package\n', 1)[1]
SCRIPT = textwrap.dedent(step.split('        run: |\n', 1)[1].split('      - name:', 1)[0])


class PackageTest(unittest.TestCase):
    def run_case(self, site_change, manual_change, unexpected=False, broken_js=False, bulk=0, grep_status=None):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            def git(*args):
                return subprocess.check_output(['git', '-c', 'commit.gpgSign=false', *args], cwd=root, text=True).strip()
            git('init', '-q')
            git('config', 'user.name', 'CI Fixture')
            git('config', 'user.email', 'fixture@example.invalid')
            site = root / 'exploration/5g-sdr-interactive-lab'
            for name in ('css', 'js', 'assets'):
                (site / name).mkdir(parents=True)
                (site / name / '.keep').touch()
            for name in ('index.html', 'evidence.html', 'lab03-ota.html'):
                (site / name).write_text('<!doctype html>')
            (site / 'js/app.js').write_text('const fixture = true;')
            git('add', '.')
            git('commit', '-qm', 'baseline')
            base = git('rev-parse', 'HEAD')
            if site_change:
                (site / 'index.html').write_text('<!doctype html><title>Changed</title>')
            if manual_change:
                (root / 'student-manual.md').write_text('# Synthetic manual fixture\n')
            if broken_js:
                (site / 'js/app.js').write_text('const fixture = ;')
            for number in range(bulk):
                (root / 'zz').mkdir(exist_ok=True)
                (root / f'zz/synthetic-documentation-file-name-for-pipe-buffer-{number}.md').write_text('x\n')
            git('add', '.')
            git('commit', '-qm', 'change')
            runner = root / 'runner'
            if unexpected:
                artifact = runner / 'interactive-lab-site-pr-check'
                artifact.mkdir(parents=True)
                (artifact / 'unexpected.txt').write_text('must reject')
            path = os.environ['PATH']
            if grep_status is not None:
                # Stand-in grep that reports the given status without matching anything.
                tools = Path(tmp) / 'tools'
                tools.mkdir()
                (tools / 'grep').write_text(f'#!/bin/sh\nexit {grep_status}\n')
                (tools / 'grep').chmod(0o755)
                path = f'{tools}{os.pathsep}{path}'
            result = subprocess.run(['bash', '-c', SCRIPT], cwd=root, env={**os.environ, 'PATH': path, 'CI_BASE_SHA': base, 'CI_HEAD_SHA': git('rev-parse', 'HEAD'), 'RUNNER_TEMP': str(runner)}, capture_output=True, text=True)
            self.assertEqual(result.returncode == 0, not (unexpected or broken_js or grep_status not in (None, 1)), result.stdout + result.stderr)

    def test_a_website_only(self):
        self.run_case(True, False)

    def test_b_document_only(self):
        self.run_case(False, True)

    def test_c_website_and_manual(self):
        self.run_case(True, True)

    def test_d_unexpected_artifact_rejected(self):
        self.run_case(True, False, True)

    def test_e_invalid_site_script_rejected(self):
        self.run_case(True, False, broken_js=True)

    def test_f_large_pr_does_not_skip_site_check(self):
        # A changed-path list beyond the pipe buffer must not hide the site change.
        self.run_case(True, False, broken_js=True, bulk=3000)

    def test_g_scope_detection_error_fails_closed(self):
        # Only "no match" may skip; a grep error must fail even for a documentation-only PR.
        self.run_case(False, True, grep_status=1)
        self.run_case(False, True, grep_status=2)


if __name__ == '__main__':
    unittest.main(verbosity=2)
