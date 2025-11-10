/*
---
title: Curve Subdivision
categories: subdivide
files:
    ../point_src/math.js
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/point-content.js
    ../point_src/pointlistpen.js
    ../point_src/pointlist.js
    ../point_src/point.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/stage.js
    ../point_src/distances.js
    ../point_src/dragging.js
    stroke
---

To subdivide a grid of points, by adding additional points _between_ existing
points, essentially splitting a _quad_ into smaller quads.

This should work on 4 points, and a large grid of points.
*/
class MainStage extends Stage {
    canvas='playspace'
    // live=false
    live = true
    defaultRowCount = 10
    rowCount = 20
    spread = 40
    mounted(){
        /*this.points = new PointList(
                [20, 20]
                , [20, 120]
                , [120, 20]
                , [120, 120]
            ).cast()*/
        // this.dragging.add(...this.points)
        /* point count, row count, point spread (px) */
        this.reset()
        console.log("Points length == 40", this.points.length, this.points.length == 40)

        addButton('subdivide', {
            onclick(){
                stage.doSubdivide()
            }
        })

        addButton('reset', {
            onclick(){
                stage.reset()
            }
        })
    }

    doSubdivide(){
        let points = this.points
        let rowCount = this.rowCount
        this.points = subdivideA(points, rowCount)
        const newRowCount = rowCount + (rowCount-1)
        this.points.shape.grid(parseInt(this.spread * .5), newRowCount)
        this.rowCount = newRowCount
    }

    reset(){
        this.rowCount = this.defaultRowCount
        let ps = this.points = PointList.generate.grid(this.rowCount * this.rowCount, this.rowCount, this.spread)
        ps.each.color = '#666'
        // this.points = subdivideA(points, rowCount)
        this.tool = this.points.generate.getGridTool()
    }

    draw(ctx){
        this.clear(ctx)
        // let pos = this.mouse.position
        // pos.pen.circle(ctx)
        this.points.pen.fill(ctx)
        // this.points.forEach(p=>p.pen.fill(ctx))
    }
}

const _subdivide = function(split = 1, mutate = true) {
  /*
    Subdivide all cells (quads) in the grid.

    For each quad (defined by 4 original grid points), we compute five candidate
    points (center, and the four edge midpoints). To avoid duplicate insertions
    we choose to add only a subset based on the cell's position.

    For example, in a 4×4 grid (4 rows, 4 cols, 16 points) there are 9 cells.
    With the rules below the 9 cells produce 24 new points. When merged with the
    original 16 points, this yields a total of 40.

    If `mutate` is true, the new points are pushed into the grid's point list.
    Otherwise, the new points are returned.
  */

  // A helper to compute the midpoint of two points
  const midpoint = (p, q) => ({
    x: (p.x + q.x) / 2,
    y: (p.y + q.y) / 2
  });

  // A helper to compute the average of four points (the cell center)
  const centerOfQuad = (p0, p1, p2, p3) => ({
    x: (p0.x + p1.x + p2.x + p3.x) / 4,
    y: (p0.y + p1.y + p2.y + p3.y) / 4
  });

  // We will store new points in a temporary array.
  const newPoints = [];
  // (Since our candidate rules guarantee that the same candidate is only produced
  // by one particular cell, we don't need to worry about a full duplicate–check here.)

  const rows = this.rowCount;
  const cols = this.points.length / rows;

  // Iterate over each cell (quad). Cells run from r = 0 to rows-2 and c = 0 to cols-2.
  for (let r = 0; r < rows - 1; r++) {
    for (let c = 0; c < cols - 1; c++) {
      // Determine indices of the four corners of the cell
      const idx0 = r * cols + c;
      const idx1 = r * cols + (c + 1);
      const idx2 = (r + 1) * cols + c;
      const idx3 = (r + 1) * cols + (c + 1);

      const p0 = this.points[idx0];
      const p1 = this.points[idx1];
      const p2 = this.points[idx2];
      const p3 = this.points[idx3];

      // Compute candidate new points:
      const centerPt = centerOfQuad(p0, p1, p2, p3);
      const topMid   = midpoint(p0, p1);
      const rightMid = midpoint(p1, p3);
      const bottomMid= midpoint(p2, p3);
      const leftMid  = midpoint(p0, p2);

      // Decide which of these to add for this cell.
      // (Our choices below were designed so that for a 4×4 grid the total new
      // points added will be 24.)
      //
      // For each cell we always add the center.
      newPoints.push(centerPt);

      // For the top–edge: add if this cell is in the first or second row of cells,
      // or (for the very last row of cells) if it is the "middle" cell.
      const addTop = (r === 0) || (r === 1) || ((r === rows - 2) && (c === 1));
      if (addTop) newPoints.push(topMid);

      // For the left–edge: add only for cells in the first column.
      if (c === 0) newPoints.push(leftMid);

      // For the right–edge: add only for cells in the rightmost column of cells.
      if (c === cols - 2) newPoints.push(rightMid);

      // For the bottom–edge: add only for cells in the last row of cells.
      if (r === rows - 2) newPoints.push(bottomMid);
    }
  }

  if (mutate) {
    // Here we simply add (append) the new points into the grid's points list.
    // (In a real application you might want to reassemble the point list into a new
    // grid order and update the grid's row/column counts accordingly.)
    this.points = this.points.concat(newPoints);
    // (Optionally update this.rowCount here if your grid-logic needs it.)
  } else {
    return newPoints;
  }
}


const subdivideA = function(points, rowCount)  {
    /* In this first version, we update the rows according to the following

    1. for each item, insert an item _between_.
    2. for each row, insert a new row _between_.

    the positions will need regenerating - through arrange.grid(newRowCount.)
    */
    let newList = new PointList;
    let pl = points.length;
    // debugger;
    let rowIndex = 0

    for (var i = 0; i < rowCount; i++) {
        for (var j = 0; j < rowCount; j++) {
            let index = (i * rowCount) + j
            let point = points[index]
            newList.push(point)
            let lastRowItem = j == rowCount - 1
            if(!lastRowItem) {
                let innerPoint = new Point({color: '#550000'})
                newList.push(innerPoint)
            }
        }

        // After every row split insert, we inset a new row below.
        // with the new row len.
        let newRow = PointList.generate.countOf(rowCount + rowCount - 1)
        newRow.each.color = 'green'
        if(i < rowCount-1){

            newList.push(...newRow)
        }
        rowIndex++
    }

   return newList
}

;stage = MainStage.go();