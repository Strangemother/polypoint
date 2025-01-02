/*

title: Plotter
src_dir: ../point_src/
files:
    ../point_src/core/head.js
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
class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        // this.dragging.add(...this.points)
        this.events.wake()
        this.points = new PointList;
    }

    maxDistance = 50
    projectionSpread = .3
    minSpeed = 20

    onMousedown(ev) {
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
        this.startLine(Point.from(ev))
    }

    onMouseup(ev) {
        // console.log('stop draw')
        this.drawingLine = false
        this.stopLine(Point.from(ev))
        this.mouseUpTime = +(new Date)
    }

    onMousemove(ev) {
        if(this.drawingLine) {
            this.tickFunc()
        }
    }

    startLine(point) {
        /* Start a line at a position*/
        this.line = new PointList(point)
        this.walkTicker = setInterval(this.tickFunc.bind(this), 50)
    }

    stopLine(point) {
        this.line.push(point)
        clearInterval(this.walkTicker)
        this.walkTicker = undefined
    }

    tickFunc() {
        /* Tick event,
        if the distance is greater than the existing, add point.*/
        let mp = this.mouse.point
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

    draw(ctx){
        this.clear(ctx)
        this.points.pen.indicator(ctx, {color: '#555'})

    }
}

stage = MainStage.go()
