"""Run the same repository quality checks locally and in GitHub Actions."""

import argparse
import os
from pathlib import Path
import re
import shutil
import subprocess
import tempfile

CONFIG = Path(__file__).resolve().parent


def git(*args):
    return subprocess.check_output(["git", *args])


def files():
    # In CI all inputs are tracked. Locally also cover new, non-ignored files.
    names = git("ls-files", "--cached", "--others", "--exclude-standard", "-z")
    result = []
    for name in sorted(set(os.fsdecode(n) for n in names.split(b"\0") if n)):
        path = Path(name)
        if path.is_symlink():
            raise SystemExit(f"Symlink requires explicit review, cannot scan: {name}")
        if path.is_file():
            result.append(name)
    return result


def run(command):
    subprocess.run([str(arg) for arg in command], check=True)


def commit(ref):
    return git("rev-parse", "--verify", "--end-of-options", f"{ref}^{{commit}}").decode().strip()


def quality(names, base, head):
    markdown = ["./" + p for p in names if p.lower().endswith(".md")]
    yaml = ["./" + p for p in names if p.lower().endswith((".yml", ".yaml"))]
    if markdown:
        run([CONFIG / "node_modules/.bin/markdownlint-cli2", *markdown])
    if yaml:
        run(["yamllint", "--strict", "--config-file", ".yamllint.yml", *yaml])
    if base:
        run(["git", "diff", "--check", f"{base}...{head}", "--"])
    else:
        # Local edits; manual CI runs have a clean tree and no PR range.
        run(["git", "diff", "--check", head, "--"])


def links(names):
    markdown = ["./" + p for p in names if p.lower().endswith(".md")]
    if not markdown:
        raise SystemExit("No Markdown files found; refusing an empty check.")
    # Only this exact target is a documented historical, untracked artifact.
    # Anchor the regex to this checkout's root, not an arbitrary .local suffix.
    historical = Path(".local/lab02-b3c/lab02-ue-mac-finalized.pcap").resolve().as_uri()
    run(["lychee", "--offline", "--no-progress", "--hidden", "--no-ignore",
         "--include-fragments=none", "--root-dir", str(Path.cwd()),
         "--exclude", "^" + re.escape(historical) + "$", "--", *markdown])


def secrets(names, base, head):
    # Stage only repository inputs; do not scan .git, ignored credentials or tools.
    with tempfile.TemporaryDirectory(prefix="docs-ci-scan-") as directory:
        target = Path(directory)
        for name in names:
            destination = target / name
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(name, destination)
        run(["gitleaks", "dir", "--redact=100", "--no-banner", "--verbose",
             "--ignore-gitleaks-allow", str(target)])
    if base:
        # Scan every introduced commit, including secrets deleted in later commits.
        run(["gitleaks", "git", "--redact=100", "--no-banner", "--verbose",
             "--ignore-gitleaks-allow", f"--log-opts={base}..{head}", "."])
    else:
        print("No commit range supplied: current files scanned; history not checked.")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("check", choices=("docs-quality", "local-links", "secret-scan"))
    parser.add_argument("--base", default=os.environ.get("CI_BASE_SHA", ""))
    parser.add_argument("--head", default=os.environ.get("CI_HEAD_SHA", "HEAD"))
    args = parser.parse_args()
    os.chdir(git("rev-parse", "--show-toplevel").decode().strip())
    head = commit(args.head)
    # A missing/zero base must not silently skip PR history scanning.
    if os.environ.get("GITHUB_EVENT_NAME") == "pull_request" and not args.base:
        parser.error("pull_request requires CI_BASE_SHA")
    if args.base and set(args.base) == {"0"}:
        parser.error("New-branch push has no base; supply a reviewed commit range.")
    base = commit(args.base) if args.base else None
    names = files()
    if args.check == "docs-quality":
        quality(names, base, head)
    elif args.check == "local-links":
        links(names)
    else:
        secrets(names, base, head)


if __name__ == "__main__":
    try:
        main()
    except subprocess.CalledProcessError as error:
        # Avoid echoing commands or potentially sensitive scanner content.
        raise SystemExit(error.returncode) from None
