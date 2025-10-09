/*

title: Plotter
files:
    head
    point
    stage
    dragging
    pointlist
    mouse
    stroke
---

Plotting captures the XY RAD ROT of a point upon request, and stashes it in a
pointlist. This is useful for timestep captures such as spline walks.

*/

class TimedPlotter {

    maxDistance = 50
    projectionSpread = .3
    minSpeed = 20
    drawingLine = false

    constructor(){
        this.points = new PointList;
    }

    start(point) {
        let delta = Infinity
        if(this.mouseUpTime) {
            delta = +(new Date) - this.mouseUpTime
        }

        if(delta < 100) {
            /* mouse click buffer */
            console.warn('fast click')
        }

        // console.log('start draw', delta)
        clearInterval(this.walkTicker)

        this.walkTicker = undefined

        this.drawingLine = true
        this.startLine(point)
    }

    stop(point) {
        // console.log('stop draw')
        this.drawingLine = false
        this.stopLine(point)
        this.mouseUpTime = +(new Date)
    }

    startLine(point) {
        /* Start a line at a position*/
        this.line = new PointList(point)
        this.step(point)
        this.walkTicker = setInterval(this.tickFunc.bind(this), 50)
    }

    stopLine(point) {
        this.line.push(point)
        clearInterval(this.walkTicker)
        this.walkTicker = undefined
    }

    tickFunc(mp=undefined) {
        /* Tick event,
        if the distance is greater than the existing, add point.*/
        mp = mp || this.mouse.point
        let l = this.points
        let last = l.last()
        let perform = true;

        if(last) {
            last.lookAt(mp)
            if(mp.distanceTo(last) < this.maxDistance) {
                perform = false;
            }
        }

        if(perform){
            l.push(mp.copy())
        }
    }

    step(mp) {
        if(this.drawingLine) {
            this.tickFunc(mp)
        }
    }

}

var slideSpeed = 1
    , spinSpeed = .5
    , maxPlotCount = 40
    , plotModulo = 10
    ;

class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.plotterSin = new PointList()
        this.plotterCos = new PointList()
        this.spinner = new Point(200, 400, 100, )

        this.dragging.add(this.spinner)
    }

    onMousedown(ev) {
        // this.plotterSin.start(Point.from(ev))
    }

    onMouseup(ev) {
        // this.plotterSin.stop(Point.from(ev))
    }

    onMousemove(ev) {
        let mp = this.mouse.point
        // this.plotterSin.step(mp)
    }

    draw(ctx){
        this.clear(ctx)
        this.plotterSin.pen.indicator(ctx, {color: 'purple'})
        this.plotterCos.pen.indicator(ctx, {color: 'lightpurple'})

        // this.plotterSin.pen.line(ctx, {color: 'purple', width: 3})

        let spinner = this.spinner
        spinner.pen.indicator(ctx, {color: '#555'})
        spinner.rotation += spinSpeed

        let tip = spinner.project()

        let brushTipSin = new Point(spinner.x, tip.y)
        let brushTipCos = new Point(tip.x, spinner.y)

        brushTipSin.pen.fill(ctx, {color: 'purple'})
        brushTipCos.pen.fill(ctx, {color: '#555'})

        if(spinner.rotation % plotModulo == 0) {
            this.plotterSin.push(brushTipSin)
            this.plotterCos.push(brushTipCos)
        }

        if(this.plotterSin.length > maxPlotCount) {
            this.plotterSin = this.plotterSin.slice(10, )
        }


        if(this.plotterCos.length > maxPlotCount) {
            this.plotterCos = this.plotterCos.slice(10, )
        }

        this.plotterSin.forEach((p)=>{
            p.x += slideSpeed
        })

        this.plotterCos.forEach((p)=>{
            p.y += slideSpeed
        })

        // this.plotterSin.points.pen.quadCurve(ctx, {color: '#555'})
    }
}

stage = MainStage.go()
