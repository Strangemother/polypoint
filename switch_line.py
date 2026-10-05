"""Maintain theatre file references and file-pack usage.

Examples:
    mv point_src/pointlistpen.js point_src/pointlist-pen.js
    python switch_line.py rename pointlistpen.js pointlist-pen.js
    python switch_line.py reseat point --dry-run
    python switch_line.py reseat point
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from dataclasses import dataclass
from pathlib import Path, PurePosixPath
from typing import Callable


@dataclass(frozen=True)
class FileEntry:
    line_number: int
    value: str


@dataclass(frozen=True)
class Metadata:
    block_start: int
    block_end: int
    lines: list[str]
    file_entries: list[FileEntry]
    src_dir: str | None


def read_metadata(text: str) -> Metadata | None:
    """Read the leading block comment and locate its ``files`` list."""
    start = len(text) - len(text.lstrip())
    if not text.startswith("/*", start):
        return None
    close = text.find("*/", start + 2)
    if close == -1:
        raise ValueError("unterminated leading metadata comment")

    block_start = start
    block_end = close + 2
    block_lines = text[start + 2 : close].splitlines(keepends=True)
    files_entries: list[FileEntry] = []
    src_dir = None
    files_header = None

    for index, line in enumerate(block_lines):
        src_match = re.match(r"^[ \t]*src_dir\s*:\s*(.*?)\s*$", line.rstrip("\r\n"))
        if src_match:
            src_dir = _unquote(src_match.group(1))
        header = re.match(r"^([ \t]*)files\s*:\s*(?:#.*)?(?:\r?\n)?$", line)
        if header:
            files_header = (index, len(header.group(1).expandtabs(4)))

    if files_header is not None:
        header_index, header_indent = files_header
        for index in range(header_index + 1, len(block_lines)):
            line = block_lines[index]
            stripped = line.strip()
            if stripped == "---":
                break
            if not stripped or stripped.startswith("#"):
                continue
            indent = len(line) - len(line.lstrip(" \t"))
            if len(line[:indent].expandtabs(4)) <= header_indent:
                break

            value_match = re.match(r"^[ \t]*(?:-\s*)?(.*?)(?:\r?\n)?$", line)
            if value_match and value_match.group(1).strip():
                files_entries.append(
                    FileEntry(index, _unquote(value_match.group(1).strip()))
                )

    return Metadata(block_start, block_end, block_lines, files_entries, src_dir)


def _unquote(value: str) -> str:
    if len(value) >= 2 and value[0] == value[-1] and value[0] in {"'", '"'}:
        return value[1:-1]
    return value


def _format_file_entry(line: str, value: str) -> str:
    ending = "\r\n" if line.endswith("\r\n") else "\n" if line.endswith("\n") else ""
    prefix_match = re.match(r"^([ \t]*(?:-\s*)?).*$", line.rstrip("\r\n"))
    prefix = prefix_match.group(1) if prefix_match else ""
    return f"{prefix}{value}{ending}"


def transform_metadata(
    text: str, transform: Callable[[Metadata, FileEntry], str | None]
) -> str:
    metadata = read_metadata(text)
    if metadata is None or not metadata.file_entries:
        return text

    line_updates: dict[int, str | None] = {}
    for entry in metadata.file_entries:
        line_updates[entry.line_number] = transform(metadata, entry)

    lines = []
    for index, line in enumerate(metadata.lines):
        if index not in line_updates:
            lines.append(line)
            continue
        value = line_updates[index]
        if value is not None:
            lines.append(_format_file_entry(line, value))

    new_block = "".join(lines)
    return text[: metadata.block_start + 2] + new_block + text[metadata.block_end - 2 :]


def _source_relative_path(value: str) -> PurePosixPath | None:
    if "://" in value or value.startswith(("/", "\\")):
        return None
    path = PurePosixPath(value.replace("\\", "/"))
    if ".." in path.parts:
        return None
    return path


def _entry_asset(
    value: str,
    base_dir: Path,
    packs: dict[str, list[str]],
    point_src: Path,
    stack: tuple[str, ...] = (),
) -> set[Path]:
    if value in packs:
        if value in stack:
            chain = " -> ".join((*stack, value))
            raise ValueError(f"cyclic file-pack reference: {chain}")
        assets: set[Path] = set()
        for member in packs[value]:
            assets.update(
                _entry_asset(member, point_src, packs, point_src, (*stack, value))
            )
        return assets

    path = PurePosixPath(value.replace("\\", "/"))
    if path.is_absolute() or "://" in value:
        return set()
    return {(base_dir / Path(*path.parts)).resolve()}


def _theatre_entry_base(
    metadata: Metadata, theatre_file: Path, value: str
) -> Path:
    path = PurePosixPath(value.replace("\\", "/"))
    if (
        metadata.src_dir
        and not path.is_absolute()
        and (not path.parts or path.parts[0] not in {".", ".."})
    ):
        return (theatre_file.parent / metadata.src_dir).resolve()
    return theatre_file.parent.resolve()


def _resolve_theatre_entry(
    metadata: Metadata,
    theatre_file: Path,
    value: str,
    packs: dict[str, list[str]],
    point_src: Path,
) -> set[Path]:
    if value in packs:
        return _entry_asset(value, point_src, packs, point_src)
    if "://" in value or value.startswith(("/", "\\")):
        return set()
    base_dir = _theatre_entry_base(metadata, theatre_file, value)
    return _entry_asset(value, base_dir, packs, point_src)


def _load_packs(path: Path) -> dict[str, list[str]]:
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as error:
        raise ValueError(f"file-pack manifest does not exist: {path}") from error
    except json.JSONDecodeError as error:
        raise ValueError(f"invalid JSON in file-pack manifest {path}: {error}") from error

    if not isinstance(data, dict):
        raise ValueError(f"file-pack manifest must contain a JSON object: {path}")
    packs = {}
    for name, members in data.items():
        if not isinstance(members, list) or not all(
            isinstance(member, str) for member in members
        ):
            raise ValueError(f"file pack {name!r} must be a list of strings")
        packs[name] = members
    return packs


def _project_paths(root: Path) -> tuple[Path, Path, Path]:
    return root / "point_src", root / "theatre", root / "point_src" / "files.json"


def _iter_javascript(directory: Path):
    if directory.exists():
        yield from sorted(directory.rglob("*.js"))


def reseat(root: Path, pack_name: str, dry_run: bool = False) -> list[Path]:
    root = root.resolve()
    point_src, theatre_dir, manifest_path = _project_paths(root)
    packs = _load_packs(manifest_path)
    if pack_name not in packs:
        raise ValueError(f"unknown file pack {pack_name!r} in {manifest_path}")

    pack_assets = _entry_asset(pack_name, point_src, packs, point_src)
    if not pack_assets:
        raise ValueError(f"file pack {pack_name!r} contains no file references")

    changes: dict[Path, str] = {}
    for theatre_file in _iter_javascript(theatre_dir):
        original = theatre_file.read_text(encoding="utf-8")
        metadata = read_metadata(original)
        if metadata is None or not metadata.file_entries:
            continue

        matching: list[FileEntry] = []
        existing_pack: list[FileEntry] = []
        for entry in metadata.file_entries:
            if entry.value == pack_name:
                existing_pack.append(entry)
                continue
            assets = _resolve_theatre_entry(
                metadata, theatre_file, entry.value, packs, point_src
            )
            if assets and assets.issubset(pack_assets):
                matching.append(entry)

        candidates = sorted(
            [*matching, *existing_pack], key=lambda entry: entry.line_number
        )
        if not candidates:
            continue
        insert_at = candidates[0].line_number
        removed_lines = {entry.line_number for entry in candidates}
        updated_lines = list(metadata.lines)
        updated_lines[insert_at] = _format_file_entry(
            metadata.lines[insert_at], pack_name
        )
        for line_number in removed_lines - {insert_at}:
            updated_lines[line_number] = ""

        new_block = "".join(updated_lines)
        updated = (
            original[: metadata.block_start + 2]
            + new_block
            + original[metadata.block_end - 2 :]
        )
        if updated != original:
            changes[theatre_file] = updated

    _apply_changes(changes, dry_run)
    return sorted(changes)


def rename_references(
    root: Path, old_name: str, new_name: str, dry_run: bool = False
) -> list[Path]:
    """Rewrite references after the file has been moved in point_src."""
    root = root.resolve()
    point_src, theatre_dir, manifest_path = _project_paths(root)
    old_path = _source_relative_path(old_name)
    new_path = _source_relative_path(new_name)
    if old_path is None or new_path is None:
        raise ValueError("old and new names must be relative paths within point_src")
    if old_path == new_path:
        raise ValueError("old and new names are identical")

    packs = _load_packs(manifest_path)
    manifest_text = manifest_path.read_text(encoding="utf-8")
    old_json = json.dumps(old_path.as_posix())
    new_json = json.dumps(new_path.as_posix())
    updated_manifest = re.sub(
        rf"(?<!\\){re.escape(old_json)}(?!\\)", new_json, manifest_text
    )
    json.loads(updated_manifest)

    changes: dict[Path, str] = {}
    if updated_manifest != manifest_text:
        changes[manifest_path] = updated_manifest

    old_asset = (point_src / Path(*old_path.parts)).resolve()
    new_asset = (point_src / Path(*new_path.parts)).resolve()
    if not dry_run and not new_asset.is_file():
        raise ValueError(
            f"new asset does not exist: {new_asset}; move the file before rewriting references"
        )

    for directory in (point_src, theatre_dir):
        for source_file in _iter_javascript(directory):
            original = source_file.read_text(encoding="utf-8")
            metadata = read_metadata(original)
            if metadata is None or not metadata.file_entries:
                continue

            is_theatre_file = directory == theatre_dir

            def transform(meta: Metadata, entry: FileEntry) -> str | None:
                if entry.value in packs:
                    return entry.value
                if "://" in entry.value or entry.value.startswith(("/", "\\")):
                    return entry.value
                path = PurePosixPath(entry.value.replace("\\", "/"))
                if is_theatre_file:
                    base = _theatre_entry_base(
                        meta, source_file, entry.value
                    )
                else:
                    base = source_file.parent.resolve()
                if (base / Path(*path.parts)).resolve() != old_asset:
                    return entry.value
                return Path(os.path.relpath(new_asset, base)).as_posix()

            updated = transform_metadata(original, transform)
            if updated != original:
                changes[source_file] = updated

    _apply_changes(changes, dry_run)
    return sorted(changes)


def _apply_changes(changes: dict[Path, str], dry_run: bool) -> None:
    for path in sorted(changes):
        if dry_run:
            print(f"would update {path}")
        else:
            path.write_text(changes[path], encoding="utf-8")
            print(f"updated {path}")
    if not changes:
        print("No changes needed.")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Update theatre metadata when file packs or asset filenames change."
    )
    parser.add_argument(
        "--root",
        type=Path,
        default=Path(__file__).resolve().parent,
        help="repository root (defaults to the directory containing this script)",
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    rename_parser = subparsers.add_parser(
        "rename",
        help="rewrite references after moving a file within point_src",
        description=(
            "Rewrite references in point_src metadata, theatre metadata, and "
            "point_src/files.json. Move the asset yourself before running this command."
        ),
    )
    rename_parser.add_argument("old_name", help="old path relative to point_src")
    rename_parser.add_argument("new_name", help="new path relative to point_src")
    rename_parser.add_argument(
        "--dry-run", action="store_true", help="show affected files without writing"
    )

    reseat_parser = subparsers.add_parser(
        "reseat",
        help="replace direct file references with a file-pack name",
    )
    reseat_parser.add_argument("pack_name", help="name from point_src/files.json")
    reseat_parser.add_argument(
        "--dry-run", action="store_true", help="show affected files without writing"
    )
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    try:
        if args.command == "rename":
            changed = rename_references(
                args.root, args.old_name, args.new_name, args.dry_run
            )
        else:
            changed = reseat(args.root, args.pack_name, args.dry_run)
    except (OSError, ValueError) as error:
        print(f"error: {error}", file=sys.stderr)
        return 2

    action = "Would update" if args.dry_run else "Updated"
    print(f"{action} {len(changed)} file(s).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
