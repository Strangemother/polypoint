from django.db import models
from trim.models import fields


class SourceReference(models.Model):
    """
    A model to store a single source reference from the tree docs.
    This allows for the storage of source files that can be searched and referenced in the documentation.

    e.g. Store one of these:
        docs/trees/clean/stash/point-js/references.json
    
    ---

    src_file (e.g. 'point.js')
        -> reference (e.g. class)
            -> class_name (e.g. 'Point')
                -> method_name (e.g. 'add')
        -> reference (e.g. function)
            -> function_name (e.g. 'add')
    """
    source_file = fields.chars(nil=False)
    source_crc = fields.chars(nil=False)
    symbol_type = fields.chars(max_length=24, nil=False)
    name = fields.chars(nil=False)
    qualified_name = fields.chars(nil=False)
    owner_name = fields.chars(default="")
    line_start = fields.integer(nil=False)
    kind = fields.chars(max_length=32, default="")
    is_exported = fields.false_bool()
    is_static = fields.false_bool()
    signature = fields.text(default="")
    params_text = fields.text(default="")
    comments_text = fields.text(default="")
    search_text = fields.text(default="")
    ranking = fields.integer(0)
    rank_weight = fields.integer(1)
    created, updated = fields.dt_cu_pair()

    class Meta:
        indexes = [
            models.Index(fields=["name"]),
            models.Index(fields=["qualified_name"]),
            models.Index(fields=["symbol_type", "name"]),
            models.Index(fields=["is_exported"]),
            models.Index(fields=["line_start"]),
            models.Index(fields=["ranking"]),
            models.Index(fields=["rank_weight"]),
        ]

    def __str__(self):
        return self.qualified_name or self.name


class SearchWeightRule(models.Model):
    """DB-backed ranking overrides for symbol targets."""

    target = fields.chars(nil=False)
    weight = fields.integer(0)
    enabled = fields.true_bool()
    notes = fields.text(default="")
    created, updated = fields.dt_cu_pair()

    class Meta:
        indexes = [
            models.Index(fields=["target"]),
            models.Index(fields=["enabled"]),
        ]

    def __str__(self):
        state = "on" if self.enabled else "off"
        return f"{self.target}={self.weight} ({state})"