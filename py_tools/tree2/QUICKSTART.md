# Quick Start - Tree Parser V2

## Run the Parser

```bash
cd /workspaces/polypoint/py_tools
python run-tree2.py
```

**Output:**
```
run ../docs/trees/zoom-js-tree.json
Created reference file: ../docs/trees/clean/stash/zoom-js/references.json
```

## Check the Results

```bash
cd /workspaces/polypoint/docs/trees/clean/stash/zoom-js
ls -lh
```

**You'll see:**
- `program.json` (16KB) - Full details
- `references.json` (5.7KB) - UI-ready ⭐

## View the Output

```bash
cat references.json
```

**Example:**
```json
{
    "src_file": "zoom.js",
    "references": {
        "Zoom": {
            "class_name": "Zoom",
            "inherits": null,
            "methods": [
                {
                    "method_name": "constructor",
                    "params": [
                        {"name": "stage"},
                        {"name": "points", "default_value": "[]"},
                        {"name": "factor", "default_value": 1}
                    ],
                    "line": 25
                },
                {
                    "method_name": "add",
                    "params": [
                        {"name": "points", "is_rest": true}
                    ],
                    "line": 34
                }
            ]
        }
    }
}
```

## Key Features

✅ **Simple parameters** - Just name and default  
✅ **Rest parameters** - Marked with `is_rest: true`  
✅ **Line numbers** - For each method and class  
✅ **Clean comments** - Organized by position  
✅ **Inheritance** - Parent class tracked  

## That's It!

The parser is working and producing clean output ready for your Django templates.

See `SUMMARY.md` for full details or `usage.md` for complete documentation.
