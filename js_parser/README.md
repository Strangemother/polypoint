# Polypoint JavaScript Parser (Node.js)

A Node.js command-line tool for parsing JavaScript source files and generating AST tree files for the Polypoint documentation system.

This is a Node.js port of the browser-based `file-parser.js` that works with the Python documentation generator (`run-tree2.py`).

## Installation

```bash
cd js_parser
npm install
```

## Usage

### Parse a Single File

```bash
# Parse a file by name (looks in ../point_src/)
node parse-file.js point.js

# Parse with relative path
node parse-file.js ../point_src/stage.js

# Parse with absolute path
node parse-file.js /path/to/file.js
```

### Parse All Files

```bash
# Parse all JavaScript files in point_src
node parse-all.js

# Parse only files matching a pattern
node parse-all.js --filter="point,stage"
node parse-all.js --filter="event"
```

### List Available Files

```bash
node parse-file.js --list
```

## Output

Tree files are saved to: `../docs/trees/`

Output format: `<basename>-js-tree.json`

Example:
- Input: `point_src/point.js`
- Output: `docs/trees/point-js-tree.json`

## File Structure

The output JSON contains:
```json
{
    "comments": [...],    // All comments with positions
    "ast": {...},         // Full Acorn AST
    "info": {            // File metadata
        "filename": "point.js",
        "path": "/full/path/to/point.js",
        "size": 12345,
        "parsed_date": "2025-11-02T..."
    }
}
```

## Integration with Python Tools

After generating tree files with this tool, process them with the Python parser:

```bash
# Parse the tree file
cd ../py_tools
python run-tree2.py point-js-tree.json

# Or parse all unprocessed trees
python run-tree2.py --parse-missed
```

## Workflow

1. **Generate AST trees** (JavaScript → JSON):
   ```bash
   cd js_parser
   node parse-all.js
   ```

2. **Process trees** (JSON → Documentation):
   ```bash
   cd ../py_tools
   python run-tree2.py --parse-missed
   ```

3. **Output**: Documentation-ready reference files in `docs/trees/clean/stash/`

## Features

- ✅ Parses JavaScript using Acorn (latest ECMAScript)
- ✅ Extracts classes, methods, properties, and functions
- ✅ Captures all comments with precise locations
- ✅ Handles inheritance (superClass tracking)
- ✅ Compatible with existing Python processing pipeline
- ✅ Batch processing support
- ✅ Flexible file targeting (name, relative, or absolute paths)

## Example Output Statistics

```
Processing: /workspaces/polypoint/point_src/point.js
✓ Created: ../docs/trees/point-js-tree.json (2166.5 KB)
  - 147 comments
  - 4 classes
  - 3 other top-level items
```

## Differences from Browser Version

The Node.js version maintains the same parsing logic as `file-parser.js` but adds:
- File system operations for reading/writing
- Command-line interface
- Batch processing capabilities
- Enhanced error handling
- Progress reporting

The core `TreeReader` class logic is preserved to ensure compatibility.
