from django.core.management.base import BaseCommand
from django.db import transaction
from django.db.utils import OperationalError, ProgrammingError

from docs.management.commands.load_search_trees import WEIGHTS
from docs.models import SearchWeightRule, SourceReference
from docs.ranking import collect_reference_ranking_counts, score_symbol_ranking


class Command(BaseCommand):
    help = "Re-apply search weights/ranking to existing SourceReference rows without reparsing trees."

    def add_arguments(self, parser):
        parser.add_argument(
            "--batch-size",
            type=int,
            default=1000,
            help="Rows per iterator/bulk update batch.",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Compute and report changes without writing updates.",
        )
        parser.add_argument(
            "--recompute-base",
            action="store_true",
            help=(
                "Recompute base ranking from reference counts before applying weights. "
                "Default mode keeps existing base ranking and only re-applies weight deltas."
            ),
        )

    def handle(self, *args, **options):
        batch_size = max(int(options.get("batch_size") or 1000), 1)
        dry_run = bool(options.get("dry_run"))
        recompute_base = bool(options.get("recompute_base"))

        weights = self._effective_weights()

        ranking_counts = None
        if recompute_base:
            ranking_counts = collect_reference_ranking_counts()

        qs = SourceReference.objects.all().only(
            "id",
            "name",
            "qualified_name",
            "owner_name",
            "rank_weight",
            "ranking",
        )

        scanned = 0
        changed = 0
        changed_weight = 0
        changed_ranking = 0
        pending = []

        for row in qs.iterator(chunk_size=batch_size):
            scanned += 1

            old_weight = int(row.rank_weight or 1)
            old_ranking = int(row.ranking or 0)

            new_weight = self._rank_weight(
                name=row.name,
                qualified_name=row.qualified_name,
                owner_name=row.owner_name,
                weights=weights,
            )

            if recompute_base:
                base_ranking = score_symbol_ranking(
                    row.name,
                    row.qualified_name,
                    ranking_counts,
                )
            else:
                # Fast mode: preserve the stored base component and only swap weight.
                base_ranking = old_ranking - old_weight

            new_ranking = int(base_ranking) + int(new_weight)

            weight_changed = new_weight != old_weight
            ranking_changed = new_ranking != old_ranking
            if not (weight_changed or ranking_changed):
                continue

            changed += 1
            if weight_changed:
                changed_weight += 1
            if ranking_changed:
                changed_ranking += 1

            row.rank_weight = new_weight
            row.ranking = new_ranking
            pending.append(row)

            if not dry_run and len(pending) >= batch_size:
                self._flush(pending, batch_size=batch_size)
                pending = []

        if not dry_run and pending:
            self._flush(pending, batch_size=batch_size)

        mode = "recompute-base" if recompute_base else "fast-delta"
        action = "dry-run" if dry_run else "updated"
        self.stdout.write(
            self.style.SUCCESS(
                " ".join(
                    [
                        "reweight_search_index complete",
                        f"mode={mode}",
                        f"action={action}",
                        f"rows_scanned={scanned}",
                        f"rows_changed={changed}",
                        f"weights_changed={changed_weight}",
                        f"rankings_changed={changed_ranking}",
                    ]
                )
            )
        )

    def _flush(self, rows, batch_size=1000):
        with transaction.atomic():
            SourceReference.objects.bulk_update(
                rows,
                ["rank_weight", "ranking", "updated"],
                batch_size=batch_size,
            )

    def _rank_weight(self, name, qualified_name, owner_name="", weights=None):
        weights = weights or WEIGHTS
        score = 0
        seen = set()
        for key in (name, qualified_name):
            if not key or key in seen:
                continue
            score += int(weights.get(key, 0) or 0)
            seen.add(key)

        if owner_name:
            score += int(weights.get(owner_name, 0) or 0)

        return score if score > 0 else 1

    def _effective_weights(self):
        weights = dict(WEIGHTS)

        try:
            rules = SearchWeightRule.objects.filter(enabled=True)
            for rule in rules:
                key = (rule.target or "").strip()
                if not key:
                    continue
                weights[key] = int(rule.weight or 0)
        except (OperationalError, ProgrammingError):
            self.stderr.write(
                self.style.WARNING("SearchWeightRule table unavailable; using static WEIGHTS only")
            )

        return weights
