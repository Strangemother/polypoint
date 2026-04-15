/* Written by Claude Opus 4.6 High - prompted by Jay.

Export the baked OriginShift maze to a plain JSON-friendly object.
The result contains the grid metadata, node positions with connectivity,
and a pre-computed edge list for consumers in other languages.

Usage:

    let data = os.export()
    let json = JSON.stringify(data)

The export captures the state _after_ baking. A typical flow:

    os.rebake(stage)
    let data = os.export()

Or use the return value of rebake directly:

    let data = os.rebake(stage)

---

Output shape:

    {
        meta: { rows, cols, pointSpread, originIndex },
        nodes: [
            { index, row, col, x, y, target, color },
            ...
        ],
        edges: [ [fromIndex, toIndex], ... ]
    }

- `nodes[i].target` is the index of the node this cell points to
  (null for the origin).
- `edges` lists every open passage as an undirected pair `[a, b]`.
  Two adjacent cells share an open passage when one points at the other.
*/


const originShiftExport = function(os, conf) {
    conf = conf || os.conf
    let pl = os.pointList
    let cols = conf.cols
    let nodes = new Array(pl.length)
    let edges = []

    for(let i = 0; i < pl.length; i++) {
        let p = pl[i]
        let target = p.target != null ? p.target : null
        nodes[i] = {
            index: i
            , row: Math.floor(i / cols)
            , col: i % cols
            , x: p.x
            , y: p.y
            , target: target
            , color: p.lineColor || null
        }
        if(target != null) {
            edges.push([i, target])
        }
    }

    return {
        meta: {
            rows: conf.rows
            , cols: cols
            , pointSpread: conf.pointSpread
            , originIndex: os.origin
        }
        , nodes
        , edges
    }
}


OriginShift.prototype.export = function(conf) {
    return originShiftExport(this, conf)
}


/*
Import a previously exported bake into an OriginShift instance,
reproducing the maze state for display.

Usage:

    // From an object
    os.loadBake(data)
    stage.draw(stage.ctx)

    // From a JSON string
    os.loadBake(JSON.parse(jsonString))
    stage.draw(stage.ctx)

    // With a stage reference (auto-redraws)
    os.loadBake(data, stage)

The data must match the shape produced by `os.export()`.
The conf (rows, cols, pointSpread) is updated from `data.meta`,
then each node's position, target, color, and rotation are restored.
*/
const originShiftImport = function(os, data, stage) {
    let meta = data.meta
    let nodes = data.nodes
    let conf = os.conf

    /* Apply grid dimensions from the import. */
    conf.rows = meta.rows
    conf.cols = meta.cols
    conf.pointSpread = meta.pointSpread

    /* Rebuild the grid at the correct size. */
    os.init()

    let pl = os.pointList
    os.origin = meta.originIndex

    /* Walk every node and restore its baked state. */
    for(let i = 0; i < nodes.length; i++) {
        let node = nodes[i]
        let p = pl[i]

        p.x = node.x
        p.y = node.y
        p.hit = true

        if(node.target != null) {
            p.target = node.target
            if(node.color) {
                p.lineColor = node.color
            }
            /* Restore the rotation so the renderer draws
            the line toward the target point. */
            p.lookAt(pl[node.target])
        }
    }

    /* If a stage was provided, redraw immediately. */
    stage && stage.draw(stage.ctx)

    return os
}


OriginShift.prototype.loadBake = function(data, stage) {
    return originShiftImport(this, data, stage)
}
