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
                // stage.walk(stage.largeWalk, random.color());
                stage.walk(stage.largeWalk);
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

        addButton('export', {
            onclick(){
                if(os.export) {
                    let content = os.export()
                    let jsonString = JSON.stringify(content, null, 2);
                    let blob = new Blob([jsonString], { type: 'application/json' });
                    let url = URL.createObjectURL(blob);
                    let a = document.createElement('a');
                    a.href = url;
                    a.download = 'export.json';
                    a.click();
                    URL.revokeObjectURL(url);
                }
            }
        })

        addButton('export walls', {
            label: 'Export Walls'
            , onclick(){
                let content = stage.exportWalls()
                let jsonString = JSON.stringify(content, null, 2);
                let blob = new Blob([jsonString], { type: 'application/json' });
                let url = URL.createObjectURL(blob);
                let a = document.createElement('a');
                a.href = url;
                a.download = 'export-walls.json';
                a.click();
                URL.revokeObjectURL(url);
            }
        })

        addButton('invert', {
            label: 'Invert'
            , onclick(){
                // acts like a toggle
                if(stage.permanentWalls) {
                    delete stage.permanentWalls
                    stage.hidePaths = false
                    stage.refresh()
                } else {
                    stage.invertToWalls(true, false) // sticky, hide-paths
                }
            }
        })

        addButton('togglePaths', {
            label: 'Toggle Paths'
            , onclick(){
                stage.hidePaths = !stage.hidePaths
                // stage.refresh()
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
            // , new Walker(os, os.pointList.length - 3)
        ]
        this.paths = new Array(this.walkers.length)
        this.featurePoints = new PointList

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
        if(this.hidePaths !== false){
            this.drawPoints(ctx)
        }
        // lineStroke.unset(ctx)

        // if(this.path) {
        //     // this.path.pen.fill(ctx, 'black', 3)
        //     this.path.pen.line(ctx, 'black', 4)
        // }
        if(this.permanentWalls) {
            this.drawInverted(ctx)
        }

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

        this.featurePoints.pen.fill(ctx) 
    }


    refresh() {
        /* no arguments - redraw without a move. */
        let ctx = this.ctx;
        this.clear(ctx)
        this.drawPoints(ctx)
        

        if(!this.hidePaths && this.paths) {
            // this.path.pen.fill(ctx, 'black', 3)
            this.paths.forEach(p=>{
                p?.pen.line(ctx, 'black', 4)
            })
        }

        if(this.permanentWalls) {
            this.drawInverted(ctx)
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
        // os.shift(count)
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

    computeWalls() {
        /* Build walls by inverting the current maze edges.
           A wall exists wherever two adjacent cells do NOT
           share an open passage. */
        let rows = conf.rows
            , cols = conf.cols
            ;

        let open = new Set()
        os.forEach((p, i) => {
            if(p.target != null) {
                let lo = Math.min(i, p.target)
                    , hi = Math.max(i, p.target)
                    ;
                open.add(lo + '-' + hi)
            }
        })

        let walls = []
            , pl = os.pointList
            ;
        for(let r = 0; r < rows; r++) {
            for(let c = 0; c < cols; c++) {
                let index = r * cols + c
                /* Skip unvisited cells — no walls around them. */
                if(!pl[index].hit) { continue }
                if(c + 1 < cols && pl[index + 1].hit
                    && !open.has(`${index}-${index + 1}`)) {
                    walls.push([index, index + 1])
                }
                if(r + 1 < rows && pl[index + cols].hit
                    && !open.has(`${index}-${index + cols}`)) {
                    walls.push([index, index + cols])
                }
            }
        }

        return walls
    }

    exportWalls() {
        /* Export the maze in the same format as os.export(),
           but with a `walls` key instead of `edges`. */
        let cols = conf.cols
        let walls = this.computeWalls()

        let nodes = []
        os.forEach((p, i) => {
            nodes.push({
                index: i
                , row: Math.floor(i / cols)
                , col: i % cols
                , x: p.x
                , y: p.y
                , target: p.target ?? null
                , color: p.lineColor || null
            })
        })

        return {
            meta: {
                rows: conf.rows
                , cols
                , pointSpread: conf.pointSpread
                , originIndex: os.origin
            }
            , nodes
            , walls
        }
    }

    invertToWalls(sticky=true, hidePaths=false) {
        this._walls = this.computeWalls()
        this._inverted = true

        console.log('Inverted to walls. sticky:', sticky, 'hidePaths:', hidePaths)
        this.permanentWalls = sticky
        this.hidePaths = hidePaths

        this.drawInverted(this.ctx)
    }

    addPointAtPosition(index, ex={color: 'lightblue'}) {
        // (Assuming 'walls' visual)
        // given an index within the grid,
        // add a point at that position, 
        // allowing the presentation of 'detectFeatures'
        // points.
        
        // index to xy (between walls.)
        let x = index % conf.cols
        let y = Math.floor(index / conf.cols)
        let size = conf.pointSpread
        let firstPoint = os.pointList[0]
        let offX = firstPoint.x // - size * 0.5
        let offY = firstPoint.y // - size * 0.5
        let px = offX + x * size
        let py = offY + y * size
        let c = Object.assign({x: px, y: py}, ex)
        let p = new Point(c)

        if(!this.featurePoints) {
            this.featurePoints = new PointList
        }
        
        this.featurePoints.push(p)

    }

    detectFeatures() {
        /* Analyse the maze grid and classify every visited cell
           by its spatial type, then group corridors into chains.

           Returns {
               cells:     Map<index, {index, row, col, exits, wallCount, type, walls}>,
               deadEnds:  [index, ...],
               corridors: [[index, ...], ...],   // chains of 3+ corridor cells
               culDeSacs: [[index, ...], ...],    // corridor chains ending in a dead-end
               alcoves:   [index, ...],           // 3-wall cells (1 exit)
               junctions: [index, ...],           // 1-wall cells (3 exits)
               crossroads:[index, ...],           // 0-wall cells (4 exits)
           }
        */
        let rows = conf.rows
            , cols = conf.cols
            , pl = os.pointList
            , wallSet = new Set()
            ;

        /* Build a fast wall lookup from the computed walls. */
        let walls = this._walls || this.computeWalls()
        walls.forEach(([a, b]) => {
            let lo = Math.min(a, b), hi = Math.max(a, b)
            wallSet.add(lo + '-' + hi)
        })

        const hasWall = (a, b) => {
            let lo = Math.min(a, b), hi = Math.max(a, b)
            return wallSet.has(lo + '-' + hi)
        }

        /* For each visited cell, determine wall sides and exit count. */
        let cells = new Map()

        for(let r = 0; r < rows; r++) {
            for(let c = 0; c < cols; c++) {
                let index = r * cols + c
                if(!pl[index].hit) { continue }

                let cellWalls = {
                    up:    r === 0    || !pl[index - cols]?.hit || hasWall(index, index - cols)
                    , down:  r === rows-1 || !pl[index + cols]?.hit || hasWall(index, index + cols)
                    , left:  c === 0    || !pl[index - 1]?.hit   || hasWall(index, index - 1)
                    , right: c === cols-1 || !pl[index + 1]?.hit || hasWall(index, index + 1)
                }

                let wallCount = 0
                for(let k in cellWalls) { if(cellWalls[k]) wallCount++ }
                let exits = 4 - wallCount

                let type = 'open'
                if(exits === 0) type = 'isolated'
                else if(exits === 1) type = 'deadEnd'
                else if(exits === 2) type = 'corridor'
                else if(exits === 3) type = 'junction'
                else if(exits === 4) type = 'crossroad'

                cells.set(index, {
                    index, row: r, col: c
                    , exits, wallCount, type
                    , walls: cellWalls
                })
            }
        }

        /* Collect simple feature lists. */
        let deadEnds = []
            , alcoves = []
            , junctions = []
            , crossroads = []
            ;

        cells.forEach((cell) => {
            if(cell.type === 'deadEnd')   deadEnds.push(cell.index)
            if(cell.type === 'deadEnd')   alcoves.push(cell.index)
            if(cell.type === 'junction')  junctions.push(cell.index)
            if(cell.type === 'crossroad') crossroads.push(cell.index)
        })

        /* Chain corridor cells (2 exits) into connected runs.
           Walk through each unvisited corridor cell, expanding
           in both directions along connected corridor neighbours. */
        let visited = new Set()
        let corridors = []

        const getNeighbours = (idx) => {
            let r = Math.floor(idx / cols), c = idx % cols
            let out = []
            if(r > 0)       out.push(idx - cols)
            if(r < rows -1) out.push(idx + cols)
            if(c > 0)       out.push(idx - 1)
            if(c < cols -1) out.push(idx + 1)
            return out
        }

        const connectedPassage = (a, b) => {
            return cells.has(b) && !hasWall(a, b)
        }

        cells.forEach((cell) => {
            if(cell.type !== 'corridor' || visited.has(cell.index)) return
            /* BFS/flood-fill along connected corridor cells. */
            let chain = []
                , queue = [cell.index]
                ;
            visited.add(cell.index)
            while(queue.length) {
                let cur = queue.shift()
                chain.push(cur)
                getNeighbours(cur).forEach(nb => {
                    if(!visited.has(nb)
                        && cells.has(nb)
                        && cells.get(nb).type === 'corridor'
                        && connectedPassage(cur, nb)) {
                        visited.add(nb)
                        queue.push(nb)
                    }
                })
            }
            if(chain.length >= 3) {
                corridors.push(chain)
            }
        })

        /* Cul-de-sacs: corridor chains where at least one end
           connects to a dead-end cell. */
        let deadEndSet = new Set(deadEnds)
        let culDeSacs = corridors.filter(chain => {
            return chain.some(idx => {
                return getNeighbours(idx).some(nb =>
                    deadEndSet.has(nb) && connectedPassage(idx, nb)
                )
            })
        })

        /* Corridors with dead-ends: the full run including the
           dead-end cells at each terminus. Each entry is
           { corridor: [index,...], deadEnds: [index,...], full: [index,...] } */
        let corridorDeadEnds = culDeSacs.map(chain => {
            let ends = []
            chain.forEach(idx => {
                getNeighbours(idx).forEach(nb => {
                    if(deadEndSet.has(nb) && connectedPassage(idx, nb)) {
                        ends.push(nb)
                    }
                })
            })
            return {
                corridor: chain
                , deadEnds: ends
                , full: [...new Set([...ends, ...chain])]
            }
        })

        let features = { cells, deadEnds, corridors, culDeSacs
            , corridorDeadEnds, alcoves, junctions, crossroads }
        this._features = features
        console.log('Features detected:', {
            deadEnds: deadEnds.length
            , corridors: corridors.length
            , culDeSacs: culDeSacs.length
            , corridorDeadEnds: corridorDeadEnds.length
            , junctions: junctions.length
            , crossroads: crossroads.length
        })
        return new FeaturesObject(features, this)
    }

    drawInverted(ctx) {
        this.clear(ctx)
        this.drawMazeWalls(ctx)
        this.drawMazeBorder(ctx)
        
    }

    drawMazeWalls(ctx) {
        ctx.strokeStyle = conf.lineColor || '#999'
        ctx.lineWidth = conf.lineWidth || 2
        ctx.lineCap = 'square'

        ctx.beginPath()
        this._walls.forEach(([a, b]) => {
            let [x1, y1, x2, y2] = this.plotWall(a, b)
            ctx.moveTo(x1, y1)
            ctx.lineTo(x2, y2)
        })
        ctx.stroke()
    }

    plotWall(a, b) {
        let diff = b - a
            , cols = conf.cols
            , row = Math.floor(a / cols)
            , col = a % cols
            , size = conf.pointSpread
            /* Offset so walls align with the existing grid positions. */
            , firstPoint = os.pointList[0]
            , offX = firstPoint.x - size * 0.5
            , offY = firstPoint.y - size * 0.5
            ;

        if(diff === 1) {
            /* Vertical wall on the right edge of cell a. */
            let x = offX + (col + 1) * size
            let y = offY + row * size
            return [x, y, x, y + size]
        }

        /* Horizontal wall on the bottom edge of cell a. */
        let x = offX + col * size
        let y = offY + (row + 1) * size
        return [x, y, x + size, y]
    }

    drawMazeBorder(ctx) {
        let size = conf.pointSpread
            , firstPoint = os.pointList[0]
            , lineWidth = 3
            , padding = 2
            , offX = firstPoint.x - size * 0.5 - (lineWidth * 0.5) - (padding * 0.5)
            , offY = firstPoint.y - size * 0.5 - (lineWidth * 0.5) - (padding * 0.5)
            , w = lineWidth + padding + (conf.cols * size)
            , h = lineWidth + padding + (conf.rows * size)
            ;
        ctx.strokeStyle = '#666'
        ctx.lineWidth = lineWidth
        ctx.strokeRect(offX, offY, w, h)
    }
}


class FeaturesObject {
    /* A simple wrapper for the features detected in the maze, with some helper methods for querying. 
    
    Synonmyms:

        info.deadEnds.forEach(x=>stage.addPointAtPosition(x, {color:'red'}));
        info.corridorDeadEnds.forEach(l=>{
            stage.addPointAtPosition(l.deadEnds[0], {color:'white'})
        });

    */

    constructor(info, stage){
        this.info = info
        this.stage = stage

    }

    clearFeatures(stage=this.stage) {
        stage.featurePoints = new PointList
    }

    showCorridors(stage=this.stage) {
        this.info.corridors.forEach(chain=>{
            chain.forEach(x=>{
                stage.addPointAtPosition(x, {color:'lightgreen'})
            })
        })
    }

    showJunctions(stage=this.stage) {
        this.info.junctions.forEach(x=>stage.addPointAtPosition(x, {color:'lightblue'}));
    }
    
    showDeadEnds(stage=this.stage) {
        this.info.deadEnds.forEach(x=>stage.addPointAtPosition(x, {color:'red'}));
    }

    showCorridorDeadEnds(stage=this.stage) {
        this.info.corridorDeadEnds.forEach(l=>{
            stage.addPointAtPosition(l.deadEnds[0], {color:'white'})
        });
    }

    showCrossroads(stage=this.stage) {
        this.info.crossroads.forEach(x=>stage.addPointAtPosition(x, {color:'purple'}));
    }

    showCulDeSacs(stage=this.stage) {
        this.info.culDeSacs.forEach(chain=>{
            chain.forEach(x=>{
                stage.addPointAtPosition(x, {color:'orange'})
            })
        }); 
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
