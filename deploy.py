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
DEFAULT_APP_ROOT = "/home/site/apps/polypoint"
DEFAULT_REMOTE_SCRIPT = (
    "/home/site/apps/polypoint/deployment/polypoint-deploy/update-app.sh"
)
DEFAULT_BOOTSTRAP_FILES = (
    "deployment/polypoint-deploy/update-app.sh",
    "deployment/polypoint-deploy/app/update-site-app.sh",
    "deployment/polypoint-deploy/app/resolve_git_pull_collisions.py",
    "deployment/polypoint-deploy/patches.yaml",
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
        "--app-root",
        default=DEFAULT_APP_ROOT,
        help="Remote repository root used for bootstrap operations",
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
    parser.add_argument(
        "--no-bootstrap",
        action="store_true",
        help=(
            "Skip pre-refresh of deployment scripts from origin/main and run "
            "the remote script directly"
        ),
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
    app_root: str,
    bootstrap_deploy_scripts: bool,
) -> list[str]:
    """Create SSH command that runs the remote deployment script."""
    remote_command = build_remote_command(
        remote_script=remote_script,
        app_root=app_root,
        bootstrap_deploy_scripts=bootstrap_deploy_scripts,
    )

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


def build_remote_command(
    remote_script: str,
    app_root: str,
    bootstrap_deploy_scripts: bool,
) -> str:
    """Build shell-safe remote command string.

    In bootstrap mode, deployment scripts are refreshed from origin/main before
    executing the deployment entrypoint. This ensures remote deploy logic can be
    updated even when normal pull flow is blocked by file collisions.
    """
    quoted_script = shlex.quote(remote_script)
    if not bootstrap_deploy_scripts:
        return f"set -e; bash {quoted_script}"

    script_path = Path(remote_script)
    app_root_path = Path(app_root)
    quoted_root = shlex.quote(app_root)

    bootstrap_steps = [
        "set -e",
        f"cd {quoted_root}",
        "git fetch origin main",
    ]

    try:
        script_rel = script_path.relative_to(app_root_path).as_posix()
    except ValueError:
        # If script is outside app_root, we cannot safely bootstrap it from
        # origin/main content. Fall back to direct execution after fetch.
        bootstrap_steps.append(f"bash {quoted_script}")
        return "; ".join(bootstrap_steps)

    bootstrap_files = list(DEFAULT_BOOTSTRAP_FILES)
    if script_rel and script_rel not in bootstrap_files:
        bootstrap_files.insert(0, script_rel)

    update_app_rel = "deployment/polypoint-deploy/update-app.sh"
    site_update_rel = "deployment/polypoint-deploy/app/update-site-app.sh"
    resolver_rel = "deployment/polypoint-deploy/app/resolve_git_pull_collisions.py"
    patch_rel = "deployment/polypoint-deploy/patches.yaml"

    bootstrap_steps.extend(
        [
            'BOOTSTRAP_DIR="$(mktemp -d /tmp/polypoint-deploy.XXXXXX)"',
            'chmod 755 "$BOOTSTRAP_DIR"',
            'cleanup_bootstrap(){ rm -rf "$BOOTSTRAP_DIR"; }',
            "trap cleanup_bootstrap EXIT",
        ]
    )

    for rel_path in bootstrap_files:
        rel_q = shlex.quote(rel_path)
        parent = Path(rel_path).parent.as_posix()
        if parent and parent != ".":
            parent_q = shlex.quote(parent)
            bootstrap_steps.append(f'mkdir -p "$BOOTSTRAP_DIR"/{parent_q}')
        bootstrap_steps.append(
            f'git show origin/main:{rel_q} > "$BOOTSTRAP_DIR"/{rel_q}'
        )

    for executable in (update_app_rel, site_update_rel):
        if executable in bootstrap_files:
            executable_q = shlex.quote(executable)
            bootstrap_steps.append(f'chmod +x "$BOOTSTRAP_DIR"/{executable_q}')

    # update-app.sh can switch to the `site` user, so ensure that user can
    # traverse/read the bootstrap tree and execute scripts inside it.
    bootstrap_steps.append('chmod -R a+rX "$BOOTSTRAP_DIR"')

    script_rel_q = shlex.quote(script_rel)
    if script_rel == update_app_rel:
        bootstrap_steps.append(
            'SITE_UPDATE_SCRIPT_OVERRIDE="$BOOTSTRAP_DIR"/'
            f'{shlex.quote(site_update_rel)} '
            'PATCH_FILE_OVERRIDE="$BOOTSTRAP_DIR"/'
            f'{shlex.quote(patch_rel)} '
            'COLLISION_TOOL_OVERRIDE="$BOOTSTRAP_DIR"/'
            f'{shlex.quote(resolver_rel)} '
            f'bash "$BOOTSTRAP_DIR"/{script_rel_q}'
        )
    elif script_rel == site_update_rel:
        bootstrap_steps.append(
            'PATCH_FILE_OVERRIDE="$BOOTSTRAP_DIR"/'
            f'{shlex.quote(patch_rel)} '
            'COLLISION_TOOL_OVERRIDE="$BOOTSTRAP_DIR"/'
            f'{shlex.quote(resolver_rel)} '
            f'bash "$BOOTSTRAP_DIR"/{script_rel_q} {quoted_root}'
        )
    else:
        bootstrap_steps.append(f'bash "$BOOTSTRAP_DIR"/{script_rel_q}')

    return "; ".join(bootstrap_steps)


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
            app_root=args.app_root,
            bootstrap_deploy_scripts=not args.no_bootstrap,
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
