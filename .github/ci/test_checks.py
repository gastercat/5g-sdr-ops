"""Integration checks in disposable Git repositories; never touch Lab Runtime."""

import hashlib
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

import yaml

CI = Path(__file__).resolve().parent
ROOT = CI.parent.parent


class ChecksTest(unittest.TestCase):
    def setUp(self):
        self.sandbox = tempfile.TemporaryDirectory(prefix="docs-ci-test-")
        self.addCleanup(self.sandbox.cleanup)
        self.root = Path(self.sandbox.name)
        self.env = os.environ.copy()
        for key in ("CI_BASE_SHA", "CI_HEAD_SHA", "GITHUB_EVENT_NAME",
                    "GITLEAKS_CONFIG", "GITLEAKS_CONFIG_TOML"):
            self.env.pop(key, None)
        self.env.update({"GIT_CONFIG_NOSYSTEM": "1", "GIT_CONFIG_GLOBAL": os.devnull})
        self.git("init", "--quiet")
        self.git("config", "user.name", "CI Fixture")
        self.git("config", "user.email", "ci-fixture@example.invalid")
        for name in (".markdownlint-cli2.jsonc", ".yamllint.yml"):
            shutil.copyfile(ROOT / name, self.root / name)
        self.write("README.md", "# Fixture\n\n[Target](target.md)\n\n```text\nexample\n```\n")
        self.write("target.md", "# Target\n")
        self.write("evidence.yaml", "status: OBSERVED\n")
        self.base = self.commit()

    def write(self, name, content):
        target = self.root / name
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(content)

    def git(self, *args):
        return subprocess.check_output(["git", *args], cwd=self.root, env=self.env).decode().strip()

    def commit(self):
        self.git("add", ".")
        self.git("-c", "core.hooksPath=/dev/null", "-c", "commit.gpgSign=false",
                 "commit", "--quiet", "-m", "Synthetic CI fixture")
        return self.git("rev-parse", "HEAD")

    def check(self, name, *args, success=True):
        result = subprocess.run([sys.executable, str(CI / "checks.py"), name, *args],
                                cwd=self.root, env=self.env, text=True,
                                stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
        if success:
            self.assertEqual(result.returncode, 0, result.stdout)
        else:
            self.assertNotEqual(result.returncode, 0, "Expected failure, check passed.")
        return result.stdout

    def snapshot(self):
        return {str(p.relative_to(self.root)): hashlib.sha256(p.read_bytes()).hexdigest()
                for p in self.root.rglob("*") if p.is_file()
                and ".git" not in p.relative_to(self.root).parts}

    def test_valid_repository_checks_do_not_write_files(self):
        before = self.snapshot()
        for name in ("docs-quality", "local-links", "secret-scan"):
            self.check(name)
        self.assertEqual(before, self.snapshot())

    def test_markdown_rules(self):
        for content in ("# Invalid \n", "# Invalid\n\n\tbad\n",
                        "# Invalid\n\n```\nno language\n```\n"):
            with self.subTest(content=repr(content)):
                self.write("invalid.md", content)
                self.check("docs-quality", success=False)

    def test_legal_markdown_line_break(self):
        self.write("valid.md", "# Valid\n\nFirst line  \nSecond line\n")
        self.check("docs-quality")

    def test_yaml_syntax_and_duplicate_keys(self):
        for content in ("key: [unterminated\n", "key: first\nkey: second\n"):
            with self.subTest(content=repr(content)):
                self.write("invalid.yaml", content)
                self.check("docs-quality", success=False)

    def test_whitespace_in_committed_non_markdown_diff(self):
        self.write("example.conf", "value = invalid \n")
        head = self.commit()
        self.check("docs-quality", "--base", self.base, "--head", head, success=False)

    def test_deleted_link_target(self):
        (self.root / "target.md").unlink()
        self.check("local-links", success=False)

    def test_hidden_documents_and_missing_images(self):
        self.write(".github/hidden.md", "# Hidden\n\n![Missing](absent.png)\n")
        self.check("local-links", success=False)

    def test_reference_links_spaces_and_offline_external_links(self):
        self.write("with spaces.md", "# Target\n")
        self.write("README.md", "# Fixture\n\n[Space][ref]\n\n"
                   "[ref]: <with spaces.md>\n\n"
                   "[Offline](https://example.invalid/not-requested)\n")
        self.check("local-links")
        (self.root / "with spaces.md").unlink()
        self.check("local-links", success=False)

    def test_historical_exception_is_exact(self):
        self.write("PROGRESS.md", "# History\n\n"
                   "[PCAP](.local/lab02-b3c/lab02-ue-mac-finalized.pcap)\n")
        self.check("local-links")
        self.write("PROGRESS.md", "# History\n\n[Missing](.local/lab02-b3c/other.pcap)\n")
        self.check("local-links", success=False)

    def synthetic_secret(self):
        # Construct synthetic scanner input at runtime; never commit real secrets.
        return "ghp_" + "Ab1Cd2Ef3Gh4Ij5Kl6Mn7Op8Qr9St0Uv1Wx2"

    def test_secret_detection_redaction_and_inline_allow_rejection(self):
        token = self.synthetic_secret()
        self.write("credential.txt", "github_token = " + token + " # gitleaks:allow\n")
        output = self.check("secret-scan", success=False)
        self.assertNotIn(token, output)
        self.assertIn("leak", output.lower())

    def test_added_then_deleted_secret_is_detected_in_history(self):
        token = self.synthetic_secret()
        self.write("credential.txt", "github_token = " + token + "\n")
        self.commit()
        (self.root / "credential.txt").unlink()
        head = self.commit()
        self.check("secret-scan")
        output = self.check("secret-scan", "--base", self.base, "--head", head, success=False)
        self.assertNotIn(token, output)
        self.assertIn("leak", output.lower())

    def test_invalid_or_missing_pr_base_fails_closed(self):
        self.check("secret-scan", "--base", "not-a-commit", success=False)
        self.check("secret-scan", "--base", "0" * 40, success=False)
        self.env["GITHUB_EVENT_NAME"] = "pull_request"
        self.check("secret-scan", success=False)

    def test_symlink_is_not_followed(self):
        (self.root / "linked.md").symlink_to("target.md")
        self.check("local-links", success=False)

    def test_workflow_always_schedules_three_required_checks(self):
        workflow = yaml.load((ROOT / ".github/workflows/docs-ci.yml").read_text(),
                             Loader=yaml.BaseLoader)
        self.assertEqual(set(workflow["on"]), {"pull_request", "push", "workflow_dispatch"})
        for event in ("pull_request", "push"):
            self.assertEqual(workflow["on"][event], {"branches": ["main"]})
        self.assertEqual(workflow["permissions"], {"contents": "read"})
        expected = {"docs-quality", "local-links", "secret-scan"}
        self.assertEqual(set(workflow["jobs"]), expected)
        for name, job in workflow["jobs"].items():
            self.assertEqual(job["name"], name)
            self.assertNotIn("if", job)
            self.assertNotIn("continue-on-error", job)
            for step in job["steps"]:
                if "uses" in step:
                    self.assertRegex(step["uses"], r"@[0-9a-f]{40}$")
                if step.get("uses", "").startswith("actions/checkout@"):
                    self.assertEqual(step["with"]["fetch-depth"], "0")
                    self.assertEqual(step["with"]["persist-credentials"], "false")


if __name__ == "__main__":
    unittest.main(verbosity=2)
