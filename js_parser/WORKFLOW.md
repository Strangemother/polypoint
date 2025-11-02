# Complete Workflow Example

This document demonstrates the full workflow from JavaScript source to documentation.

## Step 1: Parse JavaScript Source to AST Tree

### Single File
```bash
cd js_parser

# Parse a specific file
node parse-file.js point.js

# Or use the shell wrapper
./parse.sh stage.js
```

### Multiple Files
```bash
# Parse all files
node parse-all.js

# Parse files matching a pattern
node parse-all.js --filter="point,stage,zoom"
```

### Output
Tree files are created in `docs/trees/`:
- `point-js-tree.json` (2166.5 KB)
- `stage-js-tree.json` (1284.7 KB)
- `zoom-js-tree.json` (827.8 KB)

## Step 2: Process AST Trees to Documentation

```bash
cd ../py_tools

# Process a specific tree
python run-tree2.py point-js-tree.json

# Or process all unprocessed trees
python run-tree2.py --parse-missed
```

### Output
Reference files are created in `docs/trees/clean/stash/`:
- `point-js/references.json` (5.7 KB - 99.7% smaller!)
- `stage-js/references.json` (47 KB - 96.3% smaller!)
- `zoom-js/references.json` (8.5 KB - 98.9% smaller!)

## Complete Example

```bash
# 1. Parse JavaScript files
cd /workspaces/polypoint/js_parser
node parse-all.js --filter="events,random"

# Output:
# ✓ Created: ../docs/trees/events-js-tree.json (451.4 KB)
# ✓ Created: ../docs/trees/random-js-tree.json (725.5 KB)

# 2. Generate documentation references
cd ../py_tools
python run-tree2.py --parse-missed

# Output:
# ✓ Successfully processed events-js-tree.json
# ✓ Successfully processed random-js-tree.json
```

## File Flow Diagram

```
point_src/point.js (44 KB)
         ↓
    [parse-file.js]
         ↓
docs/trees/point-js-tree.json (2166 KB)
         ↓
    [run-tree2.py]
         ↓
docs/trees/clean/stash/point-js/references.json (5.7 KB)
         ↓
    [Django Templates]
         ↓
    Documentation Website
```

## Tool Comparison

### JavaScript Parser (parse-file.js)
- **Purpose**: Convert JS source → AST JSON
- **Input**: `point_src/*.js`
- **Output**: `docs/trees/*-js-tree.json`
- **Technology**: Node.js + Acorn
- **Size change**: 44 KB → 2166 KB (expansion for AST details)

### Python Processor (run-tree2.py)
- **Purpose**: Convert AST JSON → Documentation JSON
- **Input**: `docs/trees/*-js-tree.json`
- **Output**: `docs/trees/clean/stash/*/references.json`
- **Technology**: Python 3
- **Size change**: 2166 KB → 5.7 KB (99.7% compression!)

## Automation Options

### Parse All New JavaScript Files
```bash
#!/bin/bash
# parse-new-js.sh

cd js_parser
node parse-all.js

cd ../py_tools
python run-tree2.py --parse-missed
```

### Watch for Changes (requires inotify-tools)
```bash
#!/bin/bash
# watch-and-parse.sh

inotifywait -m -e modify ../point_src/*.js |
while read path action file; do
    echo "Change detected in $file"
    cd /workspaces/polypoint/js_parser
    node parse-file.js "$file"
    
    cd /workspaces/polypoint/py_tools
    python run-tree2.py --parse-missed
done
```

## Quick Reference

| Command | Purpose |
|---------|---------|
| `node parse-file.js --list` | List all available JS files |
| `node parse-file.js point.js` | Parse single file |
| `node parse-all.js` | Parse all JS files |
| `python run-tree2.py --list` | List all tree files |
| `python run-tree2.py --parse-missed` | Process unprocessed trees |
| `python run-tree2.py point-js-tree.json` | Process specific tree |

## Maintenance

### Update Source Files
When JavaScript source files in `point_src/` are updated:
1. Re-parse with `parse-file.js`
2. Re-process with `run-tree2.py`

### Check for Unprocessed Files
```bash
# Check what needs processing
cd py_tools
python run-tree2.py --list
```

### Verify Output
```bash
# Check generated references
ls -lh docs/trees/clean/stash/*/references.json

# View a reference file
head -50 docs/trees/clean/stash/point-js/references.json
```
