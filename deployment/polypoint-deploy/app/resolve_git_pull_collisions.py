#!/usr/bin/env python3
"""Resolve git pull working-tree collisions using patches.yaml rules.

Supported actions:
- replace: discard local changes for the colliding path and continue.
- stop: stop deployment immediately.

Future actions (not auto-resolved in this script yet):
- ignore
- commit
"""

from __future__ import annotations

import argparse
import fnmatch
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path


SUPPORTED_ACTIONS = {"replace", "stop", "ignore", "commit"}


class CollisionResolutionError(RuntimeError):
    """Raised when collision handling cannot continue safely."""


@dataclass(frozen=True)
class PatchRule:
    name: str
    pattern: str
    action: str


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Resolve git pull collision file paths using deployment patch rules."
        )
    )
    parser.add_argument(
        "--repo-root",
        type=Path,
        required=True,
        help="Absolute path to repository root.",
    )
    parser.add_argument(
        "--patch-file",
        type=Path,
        required=True,
        help="Path to patches.yaml rule file.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print chosen actions without modifying files.",
    )
    parser.add_argument(
        "files",
        nargs="+",
        help="Collision file paths reported by git pull.",
    )
    return parser.parse_args()


def strip_comments(raw_line: str) -> str:
    content, *_ = raw_line.split("#", 1)
    return content.rstrip()


def parse_patches_yaml(path: Path) -> dict[str, dict[str, str]]:
    if not path.exists():
        raise CollisionResolutionError(f"Patch config not found: {path}")

    sections: dict[str, dict[str, str]] = {}
    current_section: str | None = None

    for line_number, raw_line in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
        line = strip_comments(raw_line)
        if not line.strip():
            continue

        is_top_level = line == line.lstrip(" \t")
        if is_top_level and line.endswith(":"):
            current_section = line[:-1].strip()
            if not current_section:
                raise CollisionResolutionError(
                    f"Invalid empty section key in {path}:{line_number}"
                )
            sections[current_section] = {}
            continue

        if current_section is None:
            raise CollisionResolutionError(
                f"Invalid YAML content before section in {path}:{line_number}"
            )

        stripped = line.strip()
        if ":" not in stripped:
            raise CollisionResolutionError(
                f"Invalid YAML key/value in {path}:{line_number}: {raw_line}"
            )

        key, value = stripped.split(":", 1)
        key = key.strip()
        value = value.strip().strip('"\'')
        if not key:
            raise CollisionResolutionError(
                f"Invalid empty key in {path}:{line_number}"
            )
        sections[current_section][key] = value

    return sections


def build_rules(sections: dict[str, dict[str, str]]) -> tuple[list[PatchRule], PatchRule]:
    default_section = sections.get("default", {})
    default_pattern = default_section.get("pattern", "*").strip() or "*"
    default_action = default_section.get("action", "stop").strip().lower() or "stop"

    if default_action not in SUPPORTED_ACTIONS:
        raise CollisionResolutionError(
            f"Unsupported default action '{default_action}'. "
            f"Supported: {sorted(SUPPORTED_ACTIONS)}"
        )

    default_rule = PatchRule(name="default", pattern=default_pattern, action=default_action)

    rules: list[PatchRule] = []
    for section_name, values in sections.items():
        if section_name == "default":
            continue

        pattern = (values.get("pattern") or section_name).strip()
        action = (values.get("action") or default_action).strip().lower()
        if not pattern:
            raise CollisionResolutionError(
                f"Rule '{section_name}' must define a non-empty pattern."
            )
        if action not in SUPPORTED_ACTIONS:
            raise CollisionResolutionError(
                f"Rule '{section_name}' has unsupported action '{action}'. "
                f"Supported: {sorted(SUPPORTED_ACTIONS)}"
            )

        rules.append(PatchRule(name=section_name, pattern=pattern, action=action))

    return rules, default_rule


def normalize_repo_relative(repo_root: Path, raw_path: str) -> Path:
    cleaned = raw_path.strip().replace("\\", "/")
    rel = Path(cleaned)
    if rel.is_absolute():
        raise CollisionResolutionError(f"Absolute paths are not allowed: {raw_path}")

    root_resolved = repo_root.resolve()
    resolved = (repo_root / rel).resolve()
    if resolved != root_resolved and root_resolved not in resolved.parents:
        raise CollisionResolutionError(f"Path escapes repository root: {raw_path}")

    return resolved.relative_to(root_resolved)


def resolve_rule(path: Path, rules: list[PatchRule], default_rule: PatchRule) -> PatchRule:
    path_text = path.as_posix()
    basename = path.name

    for rule in rules:
        if fnmatch.fnmatch(path_text, rule.pattern) or fnmatch.fnmatch(
            basename, rule.pattern
        ):
            return rule

    if fnmatch.fnmatch(path_text, default_rule.pattern) or fnmatch.fnmatch(
        basename, default_rule.pattern
    ):
        return default_rule

    return PatchRule(name="implicit-default", pattern="*", action="stop")


def run_git(repo_root: Path, args: list[str]) -> None:
    command = ["git", "-C", str(repo_root), *args]
    result = subprocess.run(command, check=False, text=True, capture_output=True)
    if result.returncode == 0:
        return

    stderr = result.stderr.strip()
    stdout = result.stdout.strip()
    output = stderr or stdout or "(no output)"
    raise CollisionResolutionError(
        f"Command failed ({result.returncode}): {' '.join(command)}\n{output}"
    )


def is_tracked(repo_root: Path, path: Path) -> bool:
    command = [
        "git",
        "-C",
        str(repo_root),
        "ls-files",
        "--error-unmatch",
        "--",
        path.as_posix(),
    ]
    result = subprocess.run(command, check=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return result.returncode == 0


def apply_replace(repo_root: Path, path: Path, dry_run: bool) -> None:
    path_text = path.as_posix()
    if dry_run:
        print(f"[dry-run] replace {path_text}")
        return

    if is_tracked(repo_root, path):
        run_git(repo_root, ["checkout", "--", path_text])
        print(f"Replaced tracked path from HEAD: {path_text}")
        return

    # Remove untracked path when merge complains about untracked overwrite.
    run_git(repo_root, ["clean", "-fd", "--", path_text])
    print(f"Removed untracked path: {path_text}")


def apply_action(repo_root: Path, path: Path, rule: PatchRule, dry_run: bool) -> None:
    print(
        f"Collision rule match: file={path.as_posix()} "
        f"rule={rule.name} pattern={rule.pattern} action={rule.action}"
    )

    if rule.action == "replace":
        apply_replace(repo_root, path, dry_run)
        return

    if rule.action == "stop":
        raise CollisionResolutionError(
            f"Stopping due to rule '{rule.name}' for {path.as_posix()}"
        )

    if rule.action in {"ignore", "commit"}:
        raise CollisionResolutionError(
            f"Action '{rule.action}' is not implemented for auto-continue yet "
            f"(file: {path.as_posix()}, rule: {rule.name})."
        )

    raise CollisionResolutionError(
        f"Unhandled action '{rule.action}' for {path.as_posix()}"
    )


def main() -> int:
    args = parse_args()

    repo_root = args.repo_root.expanduser().resolve()
    patch_file = args.patch_file.expanduser().resolve()

    if not repo_root.exists():
        raise CollisionResolutionError(f"Repository root does not exist: {repo_root}")

    sections = parse_patches_yaml(patch_file)
    rules, default_rule = build_rules(sections)

    print(f"Using patch config: {patch_file}")
    print(
        f"Default rule: pattern={default_rule.pattern} "
        f"action={default_rule.action}"
    )

    for raw_file in args.files:
        rel_path = normalize_repo_relative(repo_root, raw_file)
        rule = resolve_rule(rel_path, rules, default_rule)
        apply_action(repo_root, rel_path, rule, args.dry_run)

    print("Collision handling completed.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except CollisionResolutionError as error:
        print(f"Collision handling failed: {error}", file=sys.stderr)
        raise SystemExit(1)
