#!/usr/bin/env python3
"""One-click deployment entrypoint for Linux and Windows.

Usage:
    python deploy.py
"""

from __future__ import annotations

import os
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Iterable


REPO_ROOT = Path(__file__).resolve().parent
DEFAULT_APP_DIR = Path("/home/site/apps/polypoint")
GUNICORN_SERVICE = "gunicorn-polypointjs-com.service"


class DeployError(RuntimeError):
    """Raised when a deployment step fails."""


def run_command(
    command: Iterable[str],
    *,
    cwd: Path | None = None,
    check: bool = True,
) -> subprocess.CompletedProcess[str]:
    """Run a command and stream output to the console."""
    pretty = " ".join(command)
    location = f" (cwd={cwd})" if cwd else ""
    print(f"$ {pretty}{location}")
    result = subprocess.run(
        list(command),
        cwd=str(cwd) if cwd else None,
        check=False,
        text=True,
    )
    if check and result.returncode != 0:
        raise DeployError(
            f"Command failed with exit code {result.returncode}: {pretty}"
        )
    return result


def detect_app_dir() -> Path:
    """Select deployment app directory for the current machine."""
    if DEFAULT_APP_DIR.exists():
        return DEFAULT_APP_DIR
    return REPO_ROOT


def find_python_executable(app_dir: Path) -> str:
    """Prefer project virtualenv Python; otherwise use current interpreter."""
    if os.name == "nt":
        venv_python = app_dir / ".venv" / "Scripts" / "python.exe"
    else:
        venv_python = app_dir / ".venv" / "bin" / "python"

    if venv_python.exists():
        return str(venv_python)
    return sys.executable


def pull_latest_code(app_dir: Path) -> None:
    """Fetch and merge latest code from origin/main."""
    print("-> Pulling latest code...")
    run_command(["git", "-C", str(app_dir), "pull", "--no-ff", "origin", "main"])


def collect_static_files(app_dir: Path, python_executable: str) -> None:
    """Run Django collectstatic if the beta site exists."""
    site_beta = app_dir / "site" / "beta"
    manage_py = site_beta / "manage.py"

    if not manage_py.exists():
        print("-> Skipping collectstatic: site/beta/manage.py not found.")
        return

    print("-> Collecting static files...")
    run_command(
        [python_executable, "manage.py", "collectstatic", "--noinput"],
        cwd=site_beta,
    )


def restart_services() -> None:
    """Restart gunicorn and nginx on Linux hosts with systemd."""
    if os.name == "nt":
        print("-> Windows detected: skipping systemctl service restarts.")
        return

    systemctl = shutil.which("systemctl")
    if not systemctl:
        print("-> systemctl not found: skipping service restarts.")
        return

    is_root = os.geteuid() == 0
    prefix = [] if is_root else (["sudo"] if shutil.which("sudo") else None)
    if prefix is None:
        print("-> Non-root user without sudo: skipping service restarts.")
        return

    print("-> Restarting gunicorn service...")
    run_command(prefix + [systemctl, "restart", GUNICORN_SERVICE])

    print("-> Restarting nginx...")
    run_command(prefix + [systemctl, "restart", "nginx"])

    print("-> Checking gunicorn service status...")
    run_command(prefix + [systemctl, "status", GUNICORN_SERVICE, "--no-pager"])


def main() -> int:
    """Execute one-click deployment flow."""
    print("=== Starting One-Click Deployment ===\n")

    app_dir = detect_app_dir()
    python_executable = find_python_executable(app_dir)

    try:
        pull_latest_code(app_dir)
        collect_static_files(app_dir, python_executable)
        restart_services()
    except DeployError as error:
        print(f"\nDeployment failed: {error}")
        return 1

    print("\n✓ Deployment completed successfully!")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
