"""Install checksum-pinned Linux x86_64 CI binaries into an explicit directory."""

import argparse
import hashlib
import json
from pathlib import Path
import platform
import shutil
import subprocess
import tarfile
import tempfile


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("tool", choices=("lychee", "gitleaks"))
    parser.add_argument("destination", type=Path)
    args = parser.parse_args()
    if platform.system() != "Linux" or platform.machine() != "x86_64":
        parser.error("Pinned binaries require Linux x86_64 (CI: Ubuntu 24.04).")
    manifest = json.loads(Path(__file__).with_name("binaries.json").read_text())
    tool = manifest[args.tool]
    with tempfile.TemporaryDirectory(prefix="docs-ci-download-") as directory:
        archive = Path(directory) / "tool.tar.gz"
        subprocess.run([
            "curl", "--fail", "--location", "--silent", "--show-error",
            "--retry", "3", "--connect-timeout", "20", "--max-time", "180",
            "--proto", "=https", "--proto-redir", "=https",
            "--output", str(archive), tool["url"],
        ], check=True)
        if hashlib.sha256(archive.read_bytes()).hexdigest() != tool["sha256"]:
            raise SystemExit("Download SHA-256 mismatch; refusing to install.")
        with tarfile.open(archive) as bundle:
            candidates = [m for m in bundle.getmembers()
                          if m.isfile() and Path(m.name).name == args.tool]
            if len(candidates) != 1:
                raise SystemExit("Expected exactly one regular executable in archive.")
            args.destination.mkdir(parents=True, exist_ok=True)
            executable = args.destination / args.tool
            with bundle.extractfile(candidates[0]) as source, executable.open("wb") as target:
                shutil.copyfileobj(source, target)
            executable.chmod(0o755)
    print(f"Installed {args.tool} {tool['version']} (SHA-256 verified).")


if __name__ == "__main__":
    main()
