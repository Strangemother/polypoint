# Tree Parser V2 - Usage Guide

A simplified JavaScript AST parser for generating documentation-friendly output.

## Overview

This parser converts JavaScript Abstract Syntax Trees (AST) into clean, UI-consumable JSON files optimized for documentation systems like Django templates.

## Key Improvements Over V1

- **Simplified Parameters**: Parameters are extracted to minimal format:
  ```json
  {"name": "stage"}
  {"name": "points", "default_value": "[]"}
  {"name": "points", "is_rest": true}
  ```

- **Clean Comments**: Comments are organized by location (header/inner) with line numbers
- **Two Output Formats**: 
  - `program.json` - Complete detailed structure
  - `references.json` - UI-optimized flat structure

- **Less Code**: Simplified processing, easier to extend

## Usage

```python
from run-tree2 import PhaseTree

tree_filepath = Path("../docs/trees/zoom-js-tree.json")
output_dir = Path("../docs/trees/clean/")

t = PhaseTree(tree_filepath=tree_filepath, output_dir=output_dir)
t.run()
```

## Configuration Options

```python
class PhaseTree:
    apply_position = True          # Include position info
    apply_key = False              # Include key objects
    denest_vars = True             # Split var declarations
    simplify_params = True         # Clean parameter format
    convert_comments_to_html = False  # Convert markdown to HTML
```

## Output Structure

### program.json
Complete AST structure with all details:
```json
{
    "defs": [
        {
            "kind": "class",
            "word": "Zoom",
            "parentName": null,
            "body": [...],
            "comments": {...},
            "pos": {...}
        }
    ],
    "types": ["ClassDeclaration"],
    "info": {"filename": "zoom.js", ...}
}
```

### references.json
UI-optimized flat structure for Django templates:
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
                    "kind": "constructor",
                    "params": [
                        {"name": "stage"},
                        {"name": "points", "default_value": "[]"}
                    ],
                    "comments": {
                        "header": [],
                        "inner": []
                    },
                    "static": false,
                    "line": 25
                }
            ],
            "comments": {...},
            "line": 24
        }
    }
}
```

## Supported Node Types

- **ClassDeclaration** - ES6 classes with inheritance
- **MethodDefinition** - Class methods (constructor, method, get, set)
- **PropertyDefinition** - Class properties
- **FunctionDeclaration** - Standalone functions
- **FunctionExpression** - Function expressions
- **VariableDeclaration** - var/let/const (auto-denested)
- **Identifier** - Variable and function names
- **AssignmentPattern** - Default parameters
- **RestElement** - Rest parameters (...args)
- **Literal** - String, number, boolean literals
- **ObjectExpression** - Object literals
- **Property** - Object properties

## Parameter Simplification

### Input (AST):
```json
{
    "type": "AssignmentPattern",
    "left": {"type": "Identifier", "name": "points"},
    "right": {"type": "ArrayExpression", "elements": []}
}
```

### Output (Simplified):
```json
{
    "name": "points",
    "default_value": "[]"
}
```

## Comment Extraction

Comments are extracted based on position:
- **header**: Comments immediately before a definition (max 1 line gap)
- **inner**: Comments within a function/class body

```json
{
    "comments": {
        "header": [
            {
                "text": "Constructor for Zoom class",
                "block": true,
                "line": 24
            }
        ],
        "inner": [
            {
                "text": "Initialize zoom points",
                "block": false,
                "line": 26
            }
        ]
    }
}
```

## Django Template Integration

The `references.json` format is designed to work directly with the Django template at:
`site/beta/docs/templates/docs/src-file.html`

```django
{% for class_name, class_info in references.items %}
    <h2>{{ class_name }}</h2>
    {% if class_info.inherits %}
        <span>extends {{ class_info.inherits }}</span>
    {% endif %}
    
    {% for method in class_info.methods %}
        <h3>{{ method.method_name }}</h3>
        <div class="params">
            {% for param in method.params %}
                <span>{{ param.name }}</span>
                {% if param.default_value %}
                    = <span>{{ param.default_value }}</span>
                {% endif %}
            {% endfor %}
        </div>
    {% endfor %}
{% endfor %}
```

## Extending the Parser

Add a new node handler:

```python
def node_NewNodeType(self, tree, content):
    """Handle NewNodeType nodes"""
    return {
        "kind": "new_type",
        "word": tree['name'],
        "custom_field": self.get_inner_method(tree['child'], content),
        **self.make_position(tree),
    }
```

## Files Generated

```
docs/trees/clean/
└── stash/
    └── zoom-js/
        ├── program.json      # Complete detailed structure
        └── references.json   # UI-optimized flat structure
```

## Next Steps

1. Enable HTML comment conversion: `convert_comments_to_html = True`
2. Process multiple files in batch
3. Add cross-referencing between files
4. Generate inheritance chains
5. Extract type information from JSDoc comments
