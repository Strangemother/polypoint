"""
Given this format:

```
{
  "meta": {
    "rows": 10,
    "cols": 10,
    "pointSpread": 15,
    "originIndex": 24
  },
  "nodes": [
    {
      "index": 0,
      "row": 0,
      "col": 0,
      "x": 20,
      "y": 20,
      "target": 1,
      "color": null
    },
    {
      "index": 1,
      "row": 0,
      "col": 1,
      "x": 35,
      "y": 20,
      "target": 11,
      "color": null
    }
  ],
  "edges": [
    [0, 1],
    [1, 11],
  ]
}
```

Return this format:


```
{
  "meta": {
    "rows": 10,
    "cols": 10,
    "pointSpread": 15,
    "originIndex": 24
  },
  "nodes": [
    {
      "index": 0,
      "row": 0,
      "col": 0,
      "target": 1,
    },
    {
      "index": 1,
      "row": 0,
      "col": 1,
      "target": 11,
    }
  ],
  "edges": [
    [0, 1],
    [1, 11],
  ]
}
```
"""

import pathlib
import json
import argparse

argp = argparse.ArgumentParser(description="Clean up JSON export by removing unnecessary fields.")
argp.add_argument("input_file", type=pathlib.Path, help="Path to the input JSON file.")
argp.add_argument("output_file", type=pathlib.Path, help="Path to the output JSON file.")


def main(): 
    args = argp.parse_args()

    in_file = pathlib.Path(args.input_file)
    out_file = pathlib.Path(args.output_file)
    
    if in_file.exists() is False:
        print(f"Input file {in_file} does not exist.")
        return
    
    content = json.load(in_file.open('r'))
    clean = clean_content(content)
    print(f"Writing cleaned content to {out_file}...")
    out_file.write_text(json.dumps(clean, indent=2))


def clean_content(content: dict) -> dict:
    # Remove "x", "y", and "color" from each node
    for node in content.get("nodes", []):
        node.pop("x", None)
        node.pop("y", None)
        node.pop("index", None) # index is same as the order.
        node.pop("color", None)
    
    return content

if __name__ == "__main__":
    main()