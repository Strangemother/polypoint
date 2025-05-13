const conf = originShiftConfigs.small({
    rows: 20
    , cols: 20
    , lineWidth: 2
    , lineColor: '#999'
    , gap: 5
    , pointSpread: 15
    /* Player spot. */
    , originColor: '#eeaadd'
    , lineCap: 'square'
    , drawPosition: false
    , drawTip: false
})
// const conf = originShiftConfigs.large({})
// const conf = originShiftConfigs.maze({
//     drawPosition: false
//     , drawTip: false
//     , rows: 20
//     , cols: 20
// })

// const conf = originShiftConfigs.small() // large()
let os = new OriginShift(conf);


const autoMain = function(){
    os.init() // run generate grid and any bits
    stage = MainStage.go({
        // loop: false
    })
}


const addControls = function(){

        addButton('walk', {
             onclick(){
                console.log('click')
                stage.walk(stage.largeWalk, random.color());
            }
        });

        addButton('toe', {
             onclick(){
                console.log('click')
                stage.toe(random.color());
            }
        });

        addButton('rebake', {
            onclick(){
                os.rebake(stage);
            }
        })

        addButton('drawpath', {
            label: 'Draw Path'
            , onclick(){
                stage.drawPath(undefined, true, /*{timeout:2000}*/);
            }
        })

        addControl('step count', {
            field: 'input'
            , value: 100
            , type: 'number'
            , onchange(ev) {
                let sval = ev.currentTarget.value
                stage.largeWalk = parseInt(sval)
            }
        })

        addControl('pointSpread', {
            field: 'input'
            , value: conf.pointSpread
            , type: 'number'
            , onchange(ev) {
                let sval = ev.currentTarget.value
                conf.pointSpread = parseInt(sval)
            }
        })

        addControl('rows', {
            field: 'input'
            , value: conf.rows
            , type: 'number'
            , onchange(ev) {
                let sval = ev.currentTarget.value
                conf.rows = parseInt(sval)
            }
        })

        addControl('cols', {
            field: 'input'
            , value: conf.cols
            , type: 'number'
            , onchange(ev) {
                let sval = ev.currentTarget.value
                conf.cols = parseInt(sval)
            }
        })
}



class MainStage extends Stage {
    canvas = 'playspace'

    mounted(){

        this.lineStroke = new Stroke({
            color: conf.lineColor
            , dash: [7, 4]
            , march: .15 // A dash stroke addon per step (march * delta)
            , width: 10
        })

        this.walkerIndicator = this.center.copy()
        addControls()

        this.largeWalk = 100

        this.walkers = [
            new Walker(os, 1)
            , new Walker(os, os.pointList.length - 3)
        ]
        this.paths = new Array(this.walkers.length)

        let kb = this.keyboard
        // kb.onKeydown(KC.UP, this.onUpKeydown.bind(this))
        // kb.onKeyup(KC.UP, this.onUpKeyup.bind(this))
        this.reset()
        this.example()
    }

    onKeydown(ev){
        let dir = ev.key
        let name = this.getName(ev)
        if(name) {
            // console.log('onKeydown', dir, name)
            this.walkers.forEach(w=>{
                this.walkerStep(w, name.toLowerCase())
            })
        }
    }

    onKeyup(ev){
        // let dir = ev.key
        // let name = this.getName(ev)
        // if(name) {
        //     console.log('onKeyup', dir, name)
        // }
    }

    getName(ev){
        for(let name in KC) {
            if(KC[name].indexOf(ev.key) > -1) {
                return name
            }
        }
    }

    shuffle(v=5) {
        os.pointList.each.x = (p) => p.x + random.int(-v, v);
        os.pointList.each.y = (p) => p.y + random.int(-v, v);
    }

    walkerStep(walker, dir) {
        let r = walker.step(dir)
        if(r) {
            if(r == os.origin) {
                console.log('Finished.')
                os.rebake(this)
            }

            this.refresh();
        }
    }

    draw(ctx=this.ctx, addData={}){
        /* Without _clear_ the view will redraw on-top of the existing content */
        // , lineCap: 'square'
        ctx.lineCap = conf.lineCap || 'round'
        ctx.fillStyle = 'green'
        // ctx.lineCap = 'square'
        // os.shift(addData.count || conf.drawStepCount, addData)
        let lineStroke = this.lineStroke

        this.clear(ctx)

        // lineStroke.step()
        // lineStroke.set(ctx)
        this.drawPoints(ctx)
        // lineStroke.unset(ctx)

        // if(this.path) {
        //     // this.path.pen.fill(ctx, 'black', 3)
        //     this.path.pen.line(ctx, 'black', 4)
        // }

        if(this.paths) {
            // this.path.pen.fill(ctx, 'black', 3)
            this.paths.forEach(p=>{
                p?.pen.line(ctx, 'black', 4)
            })
        }

        /* Draw the walker */
        this.walkers.forEach(w=>{
            let index = w?.index
            if(index) {
                this.walkerIndicator.xy = os.pointList[index].xy
                this.walkerIndicator.pen.fill(ctx, 'red')
            }
        })
    }


    refresh() {
        /* no arguments - redraw without a move. */
        let ctx = this.ctx;
        this.clear(ctx)
        this.drawPoints(ctx)

        if(this.paths) {
            // this.path.pen.fill(ctx, 'black', 3)
            this.paths.forEach(p=>{
                p?.pen.line(ctx, 'black', 4)
            })
        }
    }

    drawPath(startIndex=undefined, clean=true, d={}){

        this.walkers.forEach((w, i)=>{
            let si = startIndex
            if(si == undefined) {
                si = w.index
                // si = this.walkers[0].index
            }

            if(clean && i==0) {
                os.pointList.each.lineColor = undefined;
            }

            let path = new PointList()
            /* /origin-shift/origin-shift-drawpath.js */
            drawPath(si, os, (p)=>{
                path.push(p)
            })

            this.paths[i] = path
            if(d.timeout) {
                setTimeout(()=>{
                    this.paths[i] = undefined
                }, d.timeout);
            }
        })

        let addData = Object.assign({ count: 1 }, d)
        this.draw(this.ctx, addData)
    }

    getPathFlatGraph(startIndex){
        /* Keep the path as a KV of binding. Used for cross-referencing. */

        if(startIndex == undefined) {
            startIndex = this.walkers[0].index
        }
        let path = new PointList()
        /* /origin-shift/origin-shift-drawpath.js */
        drawPath(startIndex, os, (p)=>{
            path.push(p)
        })
        // split be ab bc pair.
        let pairs = path.siblings().map(pair=>[pair[0].uuid, pair[1].uuid]);
        return pairs
    }

    example(){
        this.walk(this.largeWalk, 'purple');
        this.walk(10000);
        this.walk(this.largeWalk, 'orange');
        this.walk(10000);
        this.walk(this.largeWalk, 'green');
        this.walk(10000);
        this.walk(this.largeWalk, '#880000');
        this.walk(10000);
        os.rebake(this)
    }

    walk(count=1000, color=undefined) {
        os.shift(count, color? {color}: {})
        this.draw(this.ctx)
    }

    toe(color=undefined) {
        let ctx = this.ctx
        this.draw(ctx, {count: 1})
    }

    reset(draw=true){
        os.reset()
        draw && this.draw(this.ctx)
    }

    drawPoints(ctx, origin=os.origin) {
        let drawPos = conf.drawPosition
            , drawTip = conf.drawTip
            ;
        os.forEach((p, i, a) => {
            /* in cleanview, Do not render unvisited nodes */
            if(!p.hit || p.ignore) { return }
            this.drawPoint(ctx, p, i == origin, drawPos, drawTip, a)
        })

        this.drawOriginNode(ctx)
    }

    drawPoint(ctx, p, isOrigin, drawPos, drawTip, a) {
        // debugger
        let tip = p.target? a[p.target]: p.project() // to the radius
        this.drawDirectionLine(ctx, p, tip, isOrigin)
        drawPos && this.drawPosition(ctx, p, tip, isOrigin)
        !isOrigin && drawTip && this.drawTip(ctx, p, tip)
    }

    drawDirectionLine(ctx, p, tip, isOrigin){
        /* The origin has no direction - thus just ignore its line. */
        if(isOrigin) { return }
        let get = (k) => p[k] || conf[k]
        // tip.pen.line(ctx, p, )
        // tip.pen.fill(ctx, '#333', 3)
        tip.pen.line(ctx, p, get('lineColor'), get('lineWidth'))
        // tip.pen.fill(ctx, undefined, 3)
    }

    drawPosition(ctx, p, tip, isOrigin){
        p.pen.circle(ctx, 2, 'black', 3)
    }

    /* Draw the _tip_ of a projection. */
    drawTip(ctx, p, tip) {
        // tip.pen.circle(ctx, conf.tipRadius, conf.tipColor, conf.tipWidth)
    }

    drawOriginNode(ctx) {
        os.getOrigin().pen.fill(ctx, conf.originColor, 5)

        // os.getOrigin().pen.circle(ctx, 2, conf.originColor, conf.lineWidth)
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


;autoMain();
