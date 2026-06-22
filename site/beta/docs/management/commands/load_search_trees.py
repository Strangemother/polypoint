import glob
import json
import zlib
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.db.utils import OperationalError, ProgrammingError

from docs.models import SearchWeightRule, SourceReference
from docs.ranking import collect_reference_ranking_counts, score_symbol_ranking
from docs.search_text import build_symbol_search_text
from docs.sqlite_search import rebuild_fts_index


# Manual ranking boosters for important symbols.
# Key can be class, function, or qualified method name.
WEIGHTS = {
    "Point": 100,
    "Point.add": 10,
    "Stage": 50,
    "someRandomFunction": 200,
}


class Command(BaseCommand):
    help = "Load API tree references into searchable SourceReference rows."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dir",
            dest="dir_globs",
            nargs="+",
            required=True,
            help="Glob(s) or file path(s), e.g. clean/stash/*/references.json",
        )
        parser.add_argument(
            "--wipe",
            action="store_true",
            help="Wipe SourceReference rows and fully reparse, bypassing CRC checks.",
        )

    def handle(self, *args, **options):
        patterns = options["dir_globs"]
        wipe = bool(options.get("wipe"))
        effective_weights = self._effective_weights()
        tree_files = self._resolve_tree_files(patterns)
        if not tree_files:
            joined = " ".join(patterns)
            raise CommandError(f"No tree files found for pattern(s): {joined}")

        ranking_counts = collect_reference_ranking_counts(
            docs_dir=settings.POLYPOINT_DOCS_DIR,
            theatre_dir=settings.POLYPOINT_THEATRE_DIR,
        )

        summary = {
            "files_total": len(tree_files),
            "files_loaded": 0,
            "files_skipped": 0,
            "rows_wiped": 0,
            "rows_seen": 0,
            "rows_created": 0,
            "rows_updated": 0,
            "rows_deleted": 0,
            "rows_fts": 0,
            "missing_source": 0,
            "missing_crc": 0,
            "crc_mismatch": 0,
            "invalid_json": 0,
        }

        if wipe:
            summary["rows_wiped"], _ = SourceReference.objects.all().delete()
            self.stdout.write(
                self.style.WARNING(
                    f"--wipe enabled: removed {summary['rows_wiped']} existing SourceReference rows"
                )
            )

        for tree_file in tree_files:
            ok = self._load_tree_file(
                tree_file,
                summary,
                ranking_counts,
                effective_weights,
                wipe=wipe,
            )
            if ok:
                summary["files_loaded"] += 1
            else:
                summary["files_skipped"] += 1

        summary["rows_fts"] = rebuild_fts_index()

        self.stdout.write(self.style.SUCCESS("load_search_trees complete"))
        self.stdout.write(
            " ".join(
                [
                    f"files_total={summary['files_total']}",
                    f"files_loaded={summary['files_loaded']}",
                    f"files_skipped={summary['files_skipped']}",
                    f"rows_wiped={summary['rows_wiped']}",
                    f"rows_seen={summary['rows_seen']}",
                    f"rows_created={summary['rows_created']}",
                    f"rows_updated={summary['rows_updated']}",
                    f"rows_deleted={summary['rows_deleted']}",
                    f"rows_fts={summary['rows_fts']}",
                    f"missing_source={summary['missing_source']}",
                    f"missing_crc={summary['missing_crc']}",
                    f"crc_mismatch={summary['crc_mismatch']}",
                    f"invalid_json={summary['invalid_json']}",
                ]
            )
        )

    def _resolve_tree_files(self, patterns):
        if isinstance(patterns, str):
            patterns = [patterns]

        roots = [
            Path(settings.POLYPOINT_DOCS_DIR) / "trees",
            Path(settings.POLYPOINT_DOCS_DIR),
            Path(settings.SITE_DIR),
            Path.cwd(),
        ]

        seen = set()
        found = []

        for pattern in patterns:
            pattern_path = Path(pattern)

            # If the shell expanded the glob to a direct file path, keep it.
            if pattern_path.exists() and pattern_path.is_file():
                path = pattern_path.resolve()
                if path not in seen:
                    seen.add(path)
                    found.append(path)
                continue

            for root in roots:
                expr = pattern if pattern_path.is_absolute() else str(root / pattern)
                for item in sorted(glob.glob(expr)):
                    path = Path(item).resolve()
                    if path.is_file() and path not in seen:
                        seen.add(path)
                        found.append(path)

        return found

    def _load_tree_file(self, tree_file, summary, ranking_counts, effective_weights, wipe=False):
        try:
            payload = json.loads(tree_file.read_text())
        except Exception:
            summary["invalid_json"] += 1
            self.stderr.write(self.style.ERROR(f"Invalid JSON: {tree_file}"))
            return False

        src_file = payload.get("src_file")
        info = payload.get("info") or {}

        if not src_file:
            self.stderr.write(self.style.WARNING(f"Missing src_file in {tree_file}"))
            return False

        source_crc = ""
        if wipe:
            source_crc = str(info.get("crc") or payload.get("source_crc") or "")
            if not source_crc:
                summary["missing_crc"] += 1
        else:
            source_path = self._resolve_source_path(info.get("path"), src_file)
            if not source_path.exists():
                summary["missing_source"] += 1
                self.stderr.write(self.style.WARNING(f"Missing source file for {tree_file}: {source_path}"))
                return False

            source_crc = self._crc(source_path)
            expected_crc = info.get("crc") or payload.get("source_crc")

            if not expected_crc:
                summary["missing_crc"] += 1
            elif str(expected_crc).lower() != source_crc.lower():
                summary["crc_mismatch"] += 1
                self.stderr.write(
                    self.style.WARNING(
                        f"CRC mismatch for {tree_file}: expected={expected_crc} actual={source_crc}"
                    )
                )
                return False

        rows = self._extract_rows(payload, src_file, source_crc, ranking_counts, effective_weights)
        summary["rows_seen"] += len(rows)

        if not rows:
            self.stderr.write(self.style.WARNING(f"No symbols found in {tree_file}"))
            return True

        created, updated, deleted = self._upsert_rows(src_file, rows)
        summary["rows_created"] += created
        summary["rows_updated"] += updated
        summary["rows_deleted"] += deleted

        return True

    def _resolve_source_path(self, info_path, src_file):
        if info_path:
            candidate = str(info_path)
            normalized = candidate.replace("\\", "/")

            # Many tree files store source paths from a Windows machine.
            # If we can find point_src in that path, rebuild a local path from it.
            marker = "point_src/"
            if marker in normalized:
                rel = normalized.split(marker, 1)[1]
                local = (Path(settings.POLYPOINT_SRC_DIR) / rel).resolve()
                if local.exists():
                    return local

            path = Path(candidate)
            if not path.is_absolute():
                path = Path(settings.SITE_DIR) / path
            resolved = path.resolve()
            if resolved.exists():
                return resolved
        return (Path(settings.POLYPOINT_SRC_DIR) / src_file).resolve()

    def _extract_rows(self, payload, src_file, source_crc, ranking_counts, effective_weights):
        refs = payload.get("references") or {}
        rows = []

        classes = refs.get("classes") or {}
        for class_name, class_item in classes.items():
            row = self._class_row(
                src_file,
                source_crc,
                class_name,
                class_item,
                ranking_counts,
                effective_weights,
            )
            rows.append(row)

            for method in class_item.get("methods") or []:
                rows.append(
                    self._method_row(
                        src_file,
                        source_crc,
                        class_name,
                        method,
                        ranking_counts,
                        effective_weights,
                    )
                )

        for func_item in refs.get("functions") or []:
            rows.append(
                self._function_row(src_file, source_crc, func_item, ranking_counts, effective_weights)
            )

        constants = refs.get("constants") or []
        for const_item in constants:
            rows.append(
                self._constant_row(src_file, source_crc, const_item, ranking_counts, effective_weights)
            )

        return self._dedupe_rows(rows)

    def _class_row(self, source_file, source_crc, class_name, class_item, ranking_counts, effective_weights):
        inherits = class_item.get("inherits")
        signature = f"class {class_name}"
        if inherits:
            signature = f"{signature} extends {inherits}"

        comments_text = self._comments_text(class_item.get("comments"))
        search_text = build_symbol_search_text(
            source_file=source_file,
            symbol_type="class",
            name=class_name,
            qualified_name=class_name,
            owner_name="",
            kind="class",
            signature=signature,
            params_text="",
            comments_text=comments_text,
        )

        rank_weight = self._rank_weight(
            name=class_name,
            qualified_name=class_name,
            weights=effective_weights,
        )
        base_ranking = self._ranking(class_name, class_name, ranking_counts)

        return {
            "source_file": source_file,
            "source_crc": source_crc,
            "symbol_type": "class",
            "name": class_name,
            "qualified_name": class_name,
            "owner_name": "",
            "line_start": self._safe_int(class_item.get("line")),
            "kind": "class",
            "is_exported": False,
            "is_static": False,
            "signature": signature,
            "params_text": "",
            "comments_text": comments_text,
            "search_text": search_text,
            "ranking": base_ranking + rank_weight,
            "rank_weight": rank_weight,
        }

    def _method_row(
        self,
        source_file,
        source_crc,
        class_name,
        method,
        ranking_counts,
        effective_weights,
    ):
        # Use the current class bucket as owner so inherited members are
        # represented as reachable API on the child (e.g. Point.add).
        owner_name = class_name or method.get("class_name") or ""
        method_name = method.get("method_name") or "<anonymous>"
        kind = method.get("kind") or "method"
        symbol_type = self._method_symbol_type(kind)
        params = method.get("params") or []
        params_text = json.dumps(params, ensure_ascii=True, separators=(",", ":"))
        signature = self._signature(method_name, params)
        comments_text = self._comments_text(method.get("comments"))
        qualified_name = f"{owner_name}.{method_name}" if owner_name else method_name

        search_text = build_symbol_search_text(
            source_file=source_file,
            symbol_type=symbol_type,
            name=method_name,
            qualified_name=qualified_name,
            owner_name=owner_name,
            kind=kind,
            signature=signature,
            params_text=params_text,
            comments_text=comments_text,
        )

        rank_weight = self._rank_weight(
            name=method_name,
            qualified_name=qualified_name,
            owner_name=owner_name,
            weights=effective_weights,
        )
        base_ranking = self._ranking(method_name, qualified_name, ranking_counts)

        return {
            "source_file": source_file,
            "source_crc": source_crc,
            "symbol_type": symbol_type,
            "name": method_name,
            "qualified_name": qualified_name,
            "owner_name": owner_name,
            "line_start": self._safe_int(method.get("line")),
            "kind": kind,
            "is_exported": False,
            "is_static": bool(method.get("static", False)),
            "signature": signature,
            "params_text": params_text,
            "comments_text": comments_text,
            "search_text": search_text,
            "ranking": base_ranking + rank_weight,
            "rank_weight": rank_weight,
        }

    def _function_row(self, source_file, source_crc, func_item, ranking_counts, effective_weights):
        name = func_item.get("name") or func_item.get("function_name") or "<anonymous>"
        kind = func_item.get("kind") or "function"
        params = func_item.get("params") or []
        params_text = json.dumps(params, ensure_ascii=True, separators=(",", ":"))
        signature = self._signature(name, params)
        comments_text = self._comments_text(func_item.get("comments"))

        search_text = build_symbol_search_text(
            source_file=source_file,
            symbol_type="function",
            name=name,
            qualified_name=name,
            owner_name="",
            kind=kind,
            signature=signature,
            params_text=params_text,
            comments_text=comments_text,
        )

        rank_weight = self._rank_weight(name=name, qualified_name=name, weights=effective_weights)
        base_ranking = self._ranking(name, name, ranking_counts)

        return {
            "source_file": source_file,
            "source_crc": source_crc,
            "symbol_type": "function",
            "name": name,
            "qualified_name": name,
            "owner_name": "",
            "line_start": self._safe_int(func_item.get("line")),
            "kind": kind,
            "is_exported": False,
            "is_static": False,
            "signature": signature,
            "params_text": params_text,
            "comments_text": comments_text,
            "search_text": search_text,
            "ranking": base_ranking + rank_weight,
            "rank_weight": rank_weight,
        }

    def _constant_row(self, source_file, source_crc, const_item, ranking_counts, effective_weights):
        name = const_item.get("name") or "<constant>"
        kind = const_item.get("kind") or "constant"
        comments_text = self._comments_text(const_item.get("comments"))

        search_text = build_symbol_search_text(
            source_file=source_file,
            symbol_type="constant",
            name=name,
            qualified_name=name,
            owner_name="",
            kind=kind,
            signature=name,
            params_text="",
            comments_text=comments_text,
        )

        rank_weight = self._rank_weight(name=name, qualified_name=name, weights=effective_weights)
        base_ranking = self._ranking(name, name, ranking_counts)

        return {
            "source_file": source_file,
            "source_crc": source_crc,
            "symbol_type": "constant",
            "name": name,
            "qualified_name": name,
            "owner_name": "",
            "line_start": self._safe_int(const_item.get("line")),
            "kind": kind,
            "is_exported": False,
            "is_static": False,
            "signature": name,
            "params_text": "",
            "comments_text": comments_text,
            "search_text": search_text,
            "ranking": base_ranking + rank_weight,
            "rank_weight": rank_weight,
        }

    def _dedupe_rows(self, rows):
        # Parser output can contain inherited method duplicates; keep one key entry.
        unique = {}
        for row in rows:
            key = self._key_from_values(
                row["source_file"],
                row["symbol_type"],
                row["qualified_name"],
                row["line_start"],
                row["kind"],
            )
            unique[key] = row
        return list(unique.values())

    def _upsert_rows(self, source_file, rows):
        keys = {
            self._key_from_values(
                r["source_file"], r["symbol_type"], r["qualified_name"], r["line_start"], r["kind"]
            )
            for r in rows
        }

        existing = list(SourceReference.objects.filter(source_file=source_file))
        existing_by_key = {self._key_from_obj(obj): obj for obj in existing}

        to_create = []
        to_update = []

        update_fields = [
            "source_crc",
            "name",
            "owner_name",
            "is_exported",
            "is_static",
            "signature",
            "params_text",
            "comments_text",
            "search_text",
            "ranking",
            "rank_weight",
            "updated",
        ]

        for row in rows:
            key = self._key_from_values(
                row["source_file"],
                row["symbol_type"],
                row["qualified_name"],
                row["line_start"],
                row["kind"],
            )
            current = existing_by_key.get(key)
            if current is None:
                to_create.append(SourceReference(**row))
                continue

            current.source_crc = row["source_crc"]
            current.name = row["name"]
            current.owner_name = row["owner_name"]
            current.is_exported = row["is_exported"]
            current.is_static = row["is_static"]
            current.signature = row["signature"]
            current.params_text = row["params_text"]
            current.comments_text = row["comments_text"]
            current.search_text = row["search_text"]
            current.ranking = row["ranking"]
            current.rank_weight = row["rank_weight"]
            to_update.append(current)

        delete_ids = [obj.id for obj in existing if self._key_from_obj(obj) not in keys]

        with transaction.atomic():
            if to_create:
                SourceReference.objects.bulk_create(to_create, batch_size=1000)
            if to_update:
                SourceReference.objects.bulk_update(to_update, update_fields, batch_size=1000)
            if delete_ids:
                SourceReference.objects.filter(id__in=delete_ids).delete()

        return len(to_create), len(to_update), len(delete_ids)

    def _comments_text(self, comments):
        if not comments:
            return ""

        parts = []
        for key in ("header", "inner"):
            for item in comments.get(key, []) or []:
                if isinstance(item, dict):
                    text = item.get("text")
                    if text:
                        parts.append(text)
                elif isinstance(item, str):
                    parts.append(item)
        return "\n".join(parts)

    def _signature(self, name, params):
        names = []
        for p in params:
            if isinstance(p, dict):
                pname = p.get("name")
                if pname:
                    names.append(str(pname))
        return f"{name}({', '.join(names)})"

    def _method_symbol_type(self, kind):
        if kind == "get":
            return "getter"
        if kind == "set":
            return "setter"
        if kind == "constructor":
            return "constructor"
        return "method"

    def _safe_int(self, value):
        try:
            return int(value)
        except Exception:
            return 0

    def _key_from_obj(self, obj):
        return self._key_from_values(
            obj.source_file,
            obj.symbol_type,
            obj.qualified_name,
            obj.line_start,
            obj.kind,
        )

    def _key_from_values(self, source_file, symbol_type, qualified_name, line_start, kind):
        return (source_file, symbol_type, qualified_name, int(line_start or 0), kind or "")

    def _ranking(self, name, qualified_name, ranking_counts):
        return score_symbol_ranking(name, qualified_name, ranking_counts)

    def _rank_weight(self, name, qualified_name, owner_name="", weights=None):
        weights = weights or WEIGHTS
        # Start with direct target boosts, avoiding duplicate key counting.
        score = 0
        seen = set()
        for key in (name, qualified_name):
            if not key or key in seen:
                continue
            score += int(weights.get(key, 0) or 0)
            seen.add(key)

        # Methods/functions inherit parent boost (e.g. Point -> Point.add).
        if owner_name:
            score += int(weights.get(owner_name, 0) or 0)

        # Keep a stable non-zero default for unweighted entries.
        return score if score > 0 else 1

    def _effective_weights(self):
        weights = dict(WEIGHTS)

        try:
            rules = SearchWeightRule.objects.filter(enabled=True)
            for rule in rules:
                key = (rule.target or "").strip()
                if not key:
                    continue
                # DB rules override static defaults for live tuning.
                weights[key] = int(rule.weight or 0)
        except (OperationalError, ProgrammingError):
            self.stderr.write(
                self.style.WARNING("SearchWeightRule table unavailable; using static WEIGHTS only")
            )

        return weights

    def _crc(self, path):
        checksum = 0
        with path.open("rb") as fobj:
            for chunk in iter(lambda: fobj.read(8192), b""):
                checksum = zlib.crc32(chunk, checksum)
        return f"{checksum & 0xFFFFFFFF:08X}"
