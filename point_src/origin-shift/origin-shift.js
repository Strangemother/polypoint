
const randomItem = function(items){
    return items[Math.floor((Math.random())*items.length)];
}

const randomItemBias = function(items, bias=0.0){
    let l = items.length

    let getR = function(){

        const a = Math.pow(Math.random(), 3);
        let v = 1 - a;
        if (Math.random() < 0.5) {
            v = a;
        }
        let r = Math.floor(v * l)
        return r
    }

    // console.log(v,l, v * l, r)
    let res = items[getR()];
    if (res == undefined) {
        res = items[getR()]
    }
    return res
}


class OriginShift {

    /*
     Given by the 'list.shape.grid()' call to return a convenience
     instance full of functions for the pointlist grid (or something that
     has the required functions)
    */
    constructor(conf) {
        this.conf = conf
    }

    init() {
        [this.pointList, this.gridTools] = os.generateGrid()
    }

    forEach() {
        let pl = this.pointList
        return pl.forEach.apply(pl, arguments)
    }

    generateGrid(conf) {
        conf = conf == undefined? this.conf: conf
        const pointList = PointList.generate.list(conf.cols * conf.rows, 0)
        /* To set the position of the grid generator, we can just edit the first point. */
        pointList[0].set(20, 20)
        /* Then reshape internally. All points gain a new {X,Y} through the
        spread as of columns */
        let gridTools = pointList.shape.grid(conf.pointSpread, conf.cols)
        return [pointList, gridTools]
    }

    /* Reset all positions be repointing all the nodes to RIGHT, then rotating
    all `points` in the last column to point DOWN

    + the last indexed point becomes the origin.
    */
    reset(draw=true){
        let pl = this.pointList
        this.origin = pl.length - 1

        pl.setData({
            radius: conf.radius
            // , rotation: RIGHT_DEG
            , hit: false
        })

        // let columnPointList = this.gridTools.getColumn(-1)
        // columnPointList.setMany(DOWN_DEG, 'rotation')
    }

    getOrigin(){
        return this.pointList[os.origin]
    }

    move(count=1, addData) {

        for (var i = count - 1; i >= 0; i--) {
            this.randomMove(addData)
        }
    }

    shift(count=10, addData) {
        return this.move(count, addData)
    }

    pickNext(possible, addData) {

        return randomItem(possible)
    }

    // The current node points to a new origin
    // the new origin has no pointer
    randomMove(addData) {
        let possibles = this.nextPossible(this.origin, addData?.directionBias)
        /*.forEach(x=>{
            if(x != undefined) {
                possibles.push(x);
            }
        })*/
        let nextIndex = this.pickNext(possibles, addData)
        return this.moveTo(nextIndex, addData)
    }

    moveTo(nextIndex, addData={}) {
        let pl = this.pointList
            , current = pl[this.origin]
            , next = pl[nextIndex]
            ;
        // if(next == undefined) {
            /* This occurs when the grid sibling was not resolved correctly,
            one of the `items` is outside of bounds.
            Ensure the getSiblings has a correct reference to the _shape_,
            using a point total or row/col combination. */
        //     console.warn('Next position is undefined:', nextIndex)
        //     return
        // }

        /* Everything we touch, we mark as hit,
        so the renderer can ignore it when drawing. */
        next.hit = true
        /* Out own target, for forward tracking paths
        If the drawPath function isn't used, this is irrelevant */
        current.target = nextIndex
        if(addData.color) {
            current.lineColor = addData.color
        }
        /* Use the node.rotation (degrees) to render the path */
        current.lookAt(next)
        /* And store the origin for next time.*/
        this.origin = nextIndex;

    }

    nextPossible(index=this.origin, dir=undefined) {
        // getSiblings(index, columnCount=this.width, rowCount, total, expand=false)
        let v = this.gridTools.getSiblings(index, conf.cols, conf.rows, undefined, true)
        let r = Object.values(v)
        if(dir && v[dir]) {
            r.push(v[dir])
        }
        return r
    }

    rebake(stage) {
        this.reset()
        this.shift(50000)
        stage && stage.draw(stage.ctx);
    }

}
