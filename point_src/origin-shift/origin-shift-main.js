
let radius = 50
let gap = 10 // Math.floor(radius * .25)
let conf = {
    /* The size of a single position for a path origin */
    positionSize: 10
    /* the size of the indicator at the end of a path */
    , tipRadius: 1
    , tipWidth: 2
    , lineWidth: 2
    /* Position radius*/
    , radius
    /* How many items per row within the grid */
    /* A NxN grid, e.g. 10 == 100 points */
    , rowCount: 10
    /* Distance between nodes - not including extended draws*/
    , gap// Math.floor(radius * .25)
    /* Distance between points */
    , pointSpread: radius + gap

    /* boolean to render the center position of every point*/
    , drawPosition: false
    , lineColor: '#006622'
}

radius = 5
gap = 0 // Math.floor(radius * .25)
conf = {
    /* The size of a single position for a path origin */
    positionSize: 1
    /* the size of the indicator at the end of a path */
    , tipRadius: 1
    , tipWidth: 1
    , lineWidth: 1
    /* Position radius*/
    , radius
    /* How many items per row within the grid */
    /* A NxN grid, e.g. 10 == 100 points */
    , rowCount: 120
    /* Distance between nodes - not including extended draws*/
    , gap// Math.floor(radius * .25)
    /* Distance between points */
    , pointSpread: radius + gap
    , drawTip: false
    /* boolean to render the center position of every point*/
    , drawPosition: false
    , lineColor: 'white'
}

radius = 4
gap = 0 // Math.floor(radius * .25)
conf = {
    /* The size of a single position for a path origin */
    positionSize: 1
    /* the size of the indicator at the end of a path */
    , tipRadius: 1
    , tipWidth: 1
    , lineWidth: 1
    /* Position radius*/
    , radius
    /* How many items per row within the grid */
    /* A NxN grid, e.g. 10 == 100 points */
    , rowCount: 215
    /* Distance between nodes - not including extended draws*/
    , gap// Math.floor(radius * .25)
    /* Distance between points */
    , pointSpread: radius + gap
    , drawTip: false
    /* boolean to render the center position of every point*/
    , drawPosition: false
    , lineColor: 'white'
}

radius = 20
gap = 8 // Math.floor(radius * .25)
conf = {
    /* The size of a single position for a path origin */
    positionSize: 1
    /* the size of the indicator at the end of a path */
    , tipRadius: 2
    , tipWidth: 2
    , lineWidth: 4
    /* Position radius*/
    , radius
    /* How many items per row within the grid */
    /* A NxN grid, e.g. 10 == 100 points */
    , rowCount: 20
    /* Distance between nodes - not including extended draws*/
    , gap// Math.floor(radius * .25)
    /* Distance between points */
    , pointSpread: radius + gap
    , drawTip: true
    /* boolean to render the center position of every point*/
    , drawPosition: true
    , lineColor: 'green'
}

radius = 80
gap = 10 // Math.floor(radius * .25)
conf = {
    /* The size of a single position for a path origin */
    positionSize: 1
    /* the size of the indicator at the end of a path */
    , tipRadius: 2
    , tipWidth: 2
    , lineWidth: 20
    /* Position radius*/
    , radius
    /* How many items per row within the grid */
    /* A NxN grid, e.g. 10 == 100 points */
    , rowCount: 5
    /* Distance between nodes - not including extended draws*/
    , gap// Math.floor(radius * .25)
    /* Distance between points */
    , pointSpread: radius + gap
    , drawTip: true
    /* boolean to render the center position of every point*/
    , drawPosition: true
    , lineColor: 'green'
}

const pointList = PointList.generate.list(conf.rowCount * conf.rowCount, 0)
/* To set the position of the grid generator, we can just edit the first point. */
pointList[0].set(20, 20)
/* Then reshape internally */
let ss = pointList.shape.grid(conf.pointSpread, conf.rowCount)


const autoMain = function(){
    runTests()

    stage = MainStage.go({
        loop: false
    })
}

class OriginShift {

    reset(draw=true){
        this.origin = pointList.length - 1
        pointList.forEach((p,i)=>{
            p.radius = conf.radius
            let isLastColumn = (i+1) % conf.rowCount == 0;
            let dir = isLastColumn? DOWN_DEG: RIGHT_DEG
            p.rotation =  dir
        })
    }

    move(count=1) {

        for (var i = count - 1; i >= 0; i--) {
            this.randomMove()
        }
    }

    walk(count=10) {
        this.move(count)
    }

    randomMove() {
        let items = this.nextPossible()
        var item = items[Math.floor(Math.random()*items.length)];
        // The current node points to the new origin,
        // the new origin has no pointer
        let current = pointList[this.origin]
        let next = pointList[item]
        current.lookAt(next)
        this.origin = item;
    }

    nextPossible(index=this.origin) {
        return getNeighbours(index, conf.rowCount)
    }
}


let os = new OriginShift();

class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.reset()
    }

    // loopDraw(){
        // os.move(1)
    //     super.loopDraw()
    // }

    draw(ctx){
        /* Without _clear_ the view will redraw on-top of the existing content */
        os.move(10)
        this.clear(ctx)
        this.drawPoints(ctx)
    }

    reset(draw=true){
        os.reset()
        draw && this.draw(this.ctx)
    }

    drawPoints(ctx) {
        let o = os.origin
        let drawPos = conf.drawPosition
        let drawTip = conf.drawTip
        pointList.forEach((p, i)=>{
            let isOrigin = i == o;
            let tip = p.project() // to the radius
            // quickStrokeWithCtx(ctx, 'red', 1)
            this.drawDirectionLine(p, tip, isOrigin, ctx)
            drawPos && p.pen.circle(ctx, 2, 'black', 3)
            !isOrigin && drawTip && this.drawTip(tip, isOrigin, ctx)
        })

        this.drawOriginNode(ctx);
    }

    drawDirectionLine(p, tip, isOrigin, ctx,){
        ctx.beginPath()

        if(!isOrigin) {
            // tip.draw.circle(ctx, tipRadius)
            /* stencil a line from the tip, back to _p_; the start position */
            tip.draw.lineTo(ctx, p)
        }
        /* draw render the line */
        quickStrokeWithCtx(ctx, conf.lineColor, conf.lineWidth)
    }

    drawTip(tip, isOrigin, ctx) {
        /* Draw the _tip_ of a projection. */
        ctx.beginPath()
        tip.draw.circle(ctx, conf.tipRadius)
        quickStrokeWithCtx(ctx, isOrigin? 'red':'grey', conf.tipWidth)
    }

    drawOriginNode(ctx) {
        let o = os.origin
        ctx.beginPath();
        pointList[o].draw.circle(ctx, 2)
        quickStrokeWithCtx(ctx, 'red', conf.lineWidth)

    }
}

/*
// Example usage:
rowCount = 9;
positionIndex = 5;
console.log(getNeighbours(positionIndex, rowCount)); // Output: [1, 7, 3, 5]
*/
function getNeighbours(index, rowWidth) {

    const row = Math.floor(index / rowWidth)
        , col = index % rowWidth
        , size  = rowWidth * rowWidth
        , up    = index - rowWidth
        , left  = index - 1
        , right = index + 1
        , down  = index + rowWidth
        , res = []
        ;

    // console.log(index, 'up', up, 'left', left, 'right', right, 'down', down)

    const inBounds = (v) => (v >= 0) && (v < size);
    const boundPush = (v) => inBounds(v) && res.push(v);

    boundPush(up);
    boundPush(down);
    // if most left (col 0), left cannot be applied.
    (col > 0) && boundPush(left);
    // if most right (col ==  rowWidth), right cannot be applied.
    (col != rowWidth-1) && boundPush(right);

    return res.sort()

}

const arrayMatch = (a,b) => {
    let sb = b.sort()
    return (a.length == b.length ) && a.sort().every((e,i)=>sb[i]==e)
}


const runTests = function(){

    runOne(0, [1, 3],       'first item')
    runOne(1, [0, 2, 4],    'first row center item')
    runOne(2, [1, 5],       'first row last item')
    runOne(3, [0, 4, 6],    'second row first item')
    runOne(4, [1, 3, 5, 7], 'center')
    runOne(5, [2, 4, 8],    'second row last item')
    runOne(6, [3, 7],       'last row first item')
    runOne(7, [4, 6, 8],    'last row center item')
    runOne(8, [5, 7],       'last item')
}

const runOne = function(index, expected, extra='') {
    res = getNeighbours(index, 3)
    exp = expected
    extra = extra.length == 0? extra: `${extra}, `
    let isMatch = arrayMatch(res, exp)
    let f = isMatch? 'log': 'warn'
    if(!isMatch) {
    console[f](`match=${isMatch} (${index}) result=${res} != expected=${exp},  ${extra}`)
    }
}

;autoMain();
