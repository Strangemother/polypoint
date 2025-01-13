# Cutting AST Trees

The python `tree.Tree` utility can parse a JS AST created through acorn.js

In its current form the application reads a tree file and slices into smaller _data-cuts_.


---

1. Parse the `point.js` using the acorn parser
    + through the 'parse' button -> "submit tree".
        + sends the acorn AST to the server as a JSON field form POST
    + The JSON is stored into `docs/trees`
2. Load the `docs/trees/point-js-tree.js` through a `Tree`
3. Parse the file

The first file stored:

    docs/trees/point-js-tree.json

Cut into unit assets:

    docs/trees/point-js-tree/
        ast.json
        comments.json
        info.json
        result.json

Then cut the tree into individual classes, stored into "class-cuts".

    docs/trees/point-js-tree/cut-cache/class-cut/Point/[method].json

Each class in the file `point.js` has a unique class-cut

    docs/trees/point-js-tree/cut-cache/class-cut/Positionable/
    docs/trees/point-js-tree/cut-cache/class-cut/Rotation/

The assets within the class-cut is tree information from the main ast.

The verbose files are read into "data-cuts" - a curated version of the same file:

    docs/trees/point-js-tree/cut-cache/data-cut/Point/[method].json

---

The UI reads the data-cut content.