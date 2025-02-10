
import tree
from tree.convert import Convert
from pathlib import Path

doc_path = Path("C:/Users/jay/Documents/projects/polypoint/docs/")

filepath = doc_path / "trees/ast-demo-js-tree/cut-cache/data-cut/_info.json"
# filepath = doc_path / "trees/point-js-tree/cut-cache/data-cut/_info.json"
output_dir = doc_path / "trees/clean/"

try:
    tree.run_test(tree_filepath=filepath, output_dir=output_dir)
except tree.MissingFile as err:
    m = "Ensure the doc/tree-file exists, by parsing the acorn tree in the view."
    print(f'\n\n\t -- {err}\n\t -- {m} -- \n\n')
    raise err


# Convert().flatten(filepath, output_dir)

