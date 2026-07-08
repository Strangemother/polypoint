
class GridTools {

    constructor(parent, width, pos) {
        this.parent = parent;
        this.width = width;
        this.initPosition = pos;
    }

    /* Return a pointlist of the items within the pseudo grid

        let gridTools = new GridTools(pointList, 10)
        let columnPointList = gridTools.getColumn(gridTools.width-1)
        columnPointList.setMany(DOWN_DEG, 'rotation')

    */
    getColumn(index) {
        if(index<0) {
            /* allow index -1 etc, to reduce from the right. */
            index = this.width + index
        }

        let items = new PointList()
        let modIndex = index % this.width
        for (var i = 0; i < this.parent.length; i+=this.width) {
            let l = this.getRow(i)
            items.push(l[modIndex])
        }

        return items
    }

    getRow(i){
        return this.parent.slice(i, i+this.width)
    }

    /* Splice a segment from the grid in the form of a rectagle*/
    getRect(){}

    subdivide(split=1, mutate=true) {
        /* Subdivide all cells within the grid by the given `split` integer.
        This adds up to 5 points to divide a _quad_ into 4 equal quads.

        if `mutate` is true, the new points are inserted into the grid, accounting
        for the row count offset.

        If mutate is false, return the new points.

            points = PointList.generate.grid(16, 4, 50)
            points.getGridTool().subdivide(1, true)
            // points.length == 40
        */

    }


    /* Given a point, or index, return the siblings of the grid

        `rowCount` or `total` is required
    */
    getSiblings(index, columnCount=this.width, rowCount, total, expand=false) {
        let rc = rowCount==undefined? columnCount: rowCount
        total = total == undefined? rc * columnCount: total

        const currentRow = Math.floor(index / columnCount)
            , currentColumn = index % columnCount
            , size  = total
            /* Up must step back as many cells as a column*/
            , up    = index - columnCount
            , left  = index - 1
            , right = index + 1
            , down  = index + columnCount
            , res = {}
            // , res = []
            ;

        // console.log(index, 'up', up, 'left', left, 'right', right, 'down', down)
        const inBounds = (v) => (v >= 0) && (v < total);
        const boundPush = (n, v) => {
            if(inBounds(v)) {
                res[n] = v
                // res.push(v)
            }};

        boundPush('up', up);
        boundPush('down', down);

        // left should be the same column
        let leftCol = left % total;
        let leftRow = Math.floor(left / columnCount);
        (currentRow == leftRow) && boundPush('left', left);
        // if most right (col ==  total), right cannot be applied.
        (currentColumn != columnCount-1) && boundPush('right', right);

        if(expand) {
            return res;
        }

        return Object.values(res).sort()
    }

    getSiblings8(index, columnCount = this.width, rowCount, total) {
        // If rowCount is not given, assume a square grid rowCount == columnCount
        const rc = (rowCount == null) ? columnCount : rowCount;
        // If total is not given, it is rc*columnCount by default
        total = (total == null) ? rc * columnCount : total;

        const currentRow    = Math.floor(index / columnCount);
        const currentColumn = index % columnCount;
        const res           = [];

        // Offsets in the range -1 to 1, excluding (0, 0).
        for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
            for (let colOffset = -1; colOffset <= 1; colOffset++) {
              // Skip the origin cell itself.
              if (rowOffset === 0 && colOffset === 0) continue;

              const newRow    = currentRow    + rowOffset;
              const newColumn = currentColumn + colOffset;

              // Check that the new coordinates are within the grid boundaries.
              if (newRow >= 0 && newRow < rc && newColumn >= 0 && newColumn < columnCount) {
                const neighborIndex = newRow * columnCount + newColumn;
                // Also ensure this index is within the total number of cells.
                if (neighborIndex >= 0 && neighborIndex < total) {
                  res.push(neighborIndex);
                }
              }
            }
        }

        return res.sort((a, b) => a - b);
    }
}



class PointListGenerator {

    constructor(parent) {
        this.parent = parent;

    }

    _distanceToPointFunction(distance) {

        let f = (i) => {
            return point(0, distance*i);
        }

        if(isPoint(distance)) {
            /* If the given object is a _point_, each step is
            multiplied. */
            f = (i) => {
                return distance.multiply(i)
            }

            return f
        }

        if(isFunction(distance)) {
            return distance
        }

        return f;
    }

    radius(count, radius, origin) {
        /* Synonymous to:

            randomPoints = PointList.generate.random(pointCount)
            // Alter the positions of all the points, a radius of 100, at a position
            randomPoints.shape.radius(100, point(200,200))
        */

        let res = this.random(count)
        // let res = PointList.generate.random(count)
        res.shape.radius(radius, origin)
        return res

    }

    countOf(count) {
        /* Genrate a count of points, without editing the values. */

        let PointListClass = (this.parent? this.parent.constructor: PointList);
        let res = new PointListClass
        for(let i = 0; i<=count-1; i++){
            let p = new Point;
            res.push(p)
        }
        return res
    }

    list(count=5, distance=10, origin=undefined) {
        /*
            Generate a list of points to a _count_.

            PointList.generate.list(100)

        Provide an offset per step:

            PointList.generate.list(100, distance=10)
            PointList.generate.list(100, distance=point(10,10))

        */

        let PointListClass = (this.parent? this.parent.constructor: PointList);
        let res = new PointListClass
        let f = this._distanceToPointFunction(distance)
        for(let i = 0; i<=count-1; i++){
            let p = f(i)
            res.push(p)
        }

        origin && res.offset(origin)
        return res
    }

    random(count, multiplier=100, offset={x:0, y:0, radius: 0, rotation: 0}) {
        /*Generate a set of random points

            PointList.generate.random(10)

        Apply a multipler and offset:

            let count = 20
            let multiplier = [300, 200, null, 0]
            let offset = [100, 100, 10, 0]

            PointList.generate.random(count, multiplier, offset)

         */
        if(typeof(count) != 'number') {
            /* Assume obj.*/
            if(count.multiplier) {
                multiplier = count.multiplier
            }

            if(count.offset) {
                offset = count.offset
            }

            if(count.count) {
                count = count.count
            } else {
                count = this.parent.length
            }
        }
        let multiplierP = new Point(multiplier)
        let offsetP = new Point(offset)
        let R = (w)=> Math.random() * multiplierP[w]

        let doRads = multiplierP.radius != null
        let doRotation = multiplierP.rotation != null

        const rand = function(index) {
            /* Fundamental options.*/
            const opts = {
                x: offsetP.x + R('x')
                , y: offsetP.y + R('y'),
            }
            /* Optonal edits. If null, they're not applied.*/
            doRads && (opts['radius'] = offsetP.radius + R('radius'))
            doRotation && (opts['rotation'] = offsetP.rotation + R('rotation'))
            return new Point(opts)
        }

        return this.list(count, rand)
    }

    grid(pointCount, rowCount, pointSpread, gridPosition) {
        let d = unpack0(arguments, {
            count: null
            , rowCount: 10
            , spread: undefined
            , position: undefined
        })

        let points = this.list(d.count)
        let spread = d.spread
        let pos = d.position

        if(spread==undefined) {
            spread = d.count;
        }

        if(pos == undefined){
            pos = {x: spread, y: spread}
        }

        this._gridTool = points.shape.grid(spread, d.rowCount, pos)
        return points;
    }

    getGridTool(rowCount, pos) {
        if(this._gridTool == undefined) {
            this._gridTool = new GridTools(this.parent, rowCount, pos)
        }

        return this._gridTool
    }
}


Polypoint.head.install(PointListGenerator)
