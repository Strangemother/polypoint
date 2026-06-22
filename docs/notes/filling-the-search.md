# Filling The Search Index

## Windows Quick Copy/Paste

Run these from repository root (`polypoint`).

### Fresh Indexing (full pipeline)

```bat
cd js_parser
node parse-all.js

cd ..\py_tools
python run_tree2.py --parse-missed

cd ..\site\beta
man.bat load_search_trees --wipe --dir ../docs/trees/clean/stash/*/references.json
```

### Reindex (no parse, reload references)

```bat
cd site\beta
man.bat load_search_trees --dir ../docs/trees/clean/stash/*/references.json
```

### Weights-only update (fast)

```bat
cd site\beta
man.bat reweight_search_index
```

This document is the practical runbook for building and updating the search index used by the Django docs search.

## What The Pipeline Does

1. Parse source JavaScript files into tree JSON files.
2. Convert tree files into compact reference files.
3. Load reference files into `SourceReference` rows.
4. Build/rebuild SQLite FTS index as part of the load step.

Main outputs:

- `docs/trees/*-js-tree.json`
- `docs/trees/clean/stash/*/references.json`

## One-Time Or Full Rebuild

Run from repository root unless otherwise stated.

### Step 1: Parse JS source to tree JSON

Option A (all files, Linux/macOS shell script):

```bash
./parse_all_files.sh
```

Option B (cross-platform, Node command):

```bash
cd js_parser
node parse-all.js
```

Optional filtered parse:

```bash
cd js_parser
node parse-all.js --filter="point,stage,zoom"
```

### Step 2: Convert trees into references.json

```bash
cd py_tools
python run_tree2.py --parse-missed
```

Or process one tree explicitly:

```bash
cd py_tools
python run_tree2.py ../docs/trees/point-js-tree.json
```

### Step 3: Load search rows in Django

```bash
cd site/beta
python manage.py load_search_trees --dir "clean/stash/*/references.json"
```

For a full reset of `SourceReference` first:

```bash
cd site/beta
python manage.py load_search_trees --wipe --dir "clean/stash/*/references.json"
```

## Incremental Update After Editing One JS File

### Step 1: Parse one source file

```bash
./parse_file.sh point.js
```

### Step 2: Load only that references file

```bash
cd site/beta
python manage.py load_search_trees --dir "clean/stash/point-js/references.json"
```

## Weight Tuning Workflow (No Reparse)

If you only changed `SearchWeightRule` rows (or static `WEIGHTS`), you do not need to re-run parsing.

Fast re-apply to existing search rows:

```bash
cd site/beta
python manage.py reweight_search_index
```

Preview only:

```bash
cd site/beta
python manage.py reweight_search_index --dry-run
```

Optional full base ranking recompute as well:

```bash
cd site/beta
python manage.py reweight_search_index --recompute-base
```

## Decision Table

- Source JS changed: run parse + tree processing + `load_search_trees`.
- References files changed: run `load_search_trees`.
- Only weight rules changed: run `reweight_search_index`.

## Verification Checks

After load/reweight, spot-check expected symbols:

```bash
cd site/beta
python manage.py shell -c "from docs.models import SourceReference; print(SourceReference.objects.filter(name='add').order_by('-rank_weight','-ranking').values('qualified_name','rank_weight','ranking')[:10])"
```

If search ranking still looks stale:

1. Confirm the command summary reports changed rows.
2. Confirm the target row has updated `rank_weight`.
3. Re-run the same query in the UI.

## Windows Notes

On Windows, use equivalent commands from PowerShell or CMD. If your virtual environment is active, `python manage.py ...` is enough.

Typical order on Windows:

1. Run parser commands.
2. Run `python manage.py load_search_trees --dir "clean/stash/*/references.json"`.
3. For weight-only changes, run `python manage.py reweight_search_index`.
