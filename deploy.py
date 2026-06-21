#!/usr/bin/env python3
"""One-click remote deployment launcher.

This script connects to the production server via SSH and executes the
existing deployment script:

    /home/site/apps/polypoint/deployment/polypoint-deploy/update-app.sh

Usage:
    python deploy.py
    python deploy.py --host polypointjs.com --port 32432 --user root
"""

from __future__ import annotations

import argparse
import shlex
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Sequence

DEFAULT_HOST = "polypointjs.com"
DEFAULT_PORT = 32432
DEFAULT_USER = "root"
DEFAULT_REMOTE_SCRIPT = (
    "/home/site/apps/polypoint/deployment/polypoint-deploy/update-app.sh"
)


class DeployError(RuntimeError):
    """Raised when deployment execution fails."""


def build_parser() -> argparse.ArgumentParser:
    """Build and return CLI argument parser."""
    parser = argparse.ArgumentParser(
        description=(
            "SSH into remote server and run the existing update-app.sh script."
        )
    )
    parser.add_argument("--host", default=DEFAULT_HOST, help="Remote SSH host")
    parser.add_argument(
        "--port",
        type=int,
        default=DEFAULT_PORT,
        help="Remote SSH port",
    )
    parser.add_argument("--user", default=DEFAULT_USER, help="Remote SSH user")
    parser.add_argument(
        "--script",
        default=DEFAULT_REMOTE_SCRIPT,
        help="Absolute path to remote deployment script",
    )
    parser.add_argument(
        "--identity-file",
        type=Path,
        default=None,
        help="Optional SSH private key path",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print SSH command and exit without running deployment",
    )
    return parser


def ensure_ssh_available() -> None:
    """Validate that the local SSH client is installed."""
    if shutil.which("ssh"):
        return
    raise DeployError(
        "SSH client not found on PATH. Install OpenSSH and try again."
    )


def build_ssh_command(
    host: str,
    port: int,
    user: str,
    remote_script: str,
    identity_file: Path | None,
) -> list[str]:
    """Create SSH command that runs the remote deployment script."""
    remote_command = f"set -e; bash {shlex.quote(remote_script)}"

    command: list[str] = [
        "ssh",
        "-p",
        str(port),
        f"{user}@{host}",
        remote_command,
    ]

    if identity_file is not None:
        command[1:1] = ["-i", str(identity_file.expanduser().resolve())]

    return command


def run_command(command: Sequence[str]) -> None:
    """Run a shell command and stream output directly to terminal."""
    pretty = " ".join(command)
    print(f"$ {pretty}")

    result = subprocess.run(command, check=False)
    if result.returncode != 0:
        raise DeployError(
            f"Remote deployment command failed with exit code {result.returncode}."
        )


def main() -> int:
    """CLI entrypoint."""
    parser = build_parser()
    args = parser.parse_args()

    try:
        ensure_ssh_available()

        command = build_ssh_command(
            host=args.host,
            port=args.port,
            user=args.user,
            remote_script=args.script,
            identity_file=args.identity_file,
        )

        if args.dry_run:
            print("Dry run: remote deployment command not executed.")
            print(" ".join(command))
            return 0

        print("=== Remote deployment start ===")
        run_command(command)
        print("=== Remote deployment complete ===")
        return 0
    except DeployError as error:
        print(f"Deployment failed: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
