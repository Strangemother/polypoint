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


class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.plotter = new TimedPlotter()
        this.plotter.mouse = this.mouse
    }

    onMousedown(ev) {
        this.plotter.start(Point.from(ev))
    }

    onMouseup(ev) {
        this.plotter.stop(Point.from(ev))
    }

    onMousemove(ev) {
        let mp = this.mouse.point
        this.plotter.step(mp)
    }

    draw(ctx){
        this.clear(ctx)
        this.plotter.points.pen.indicator(ctx, {color: '#555'})
        // this.plotter.points.pen.quadCurve(ctx, {color: '#555'})

    }
}

stage = MainStage.go()
