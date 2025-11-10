/*

title: Dual Line Potter Wheel
files:
    head
    point
    stage
    dragging
    pointlist
    mouse
    ../point_src/smooth-number.js
    ../point_src/split.js
    stroke
---

Plotting captures the XY RAD ROT of a point upon request, and stashes it in a
pointlist. This is useful for timestep captures such as spline walks.

 */
class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'
    tickerInterval = 50

    mounted(){
        // this.dragging.add(...this.points)
        // this.events.wake()
        this.points = new PointList;
        this.points2 = new PointList;
        this.lastPoint = undefined;
        this.speedNumber = new SmoothNumber(10, 10, 20)
    }

    maxDistance = 30
    projectionSpread = 3
    minSpeed = 2

    onMousedown(ev) {
        let delta = Infinity
        if(this.mouseUpTime) {
            delta = +(new Date) - this.mouseUpTime
        }

        if(delta < 100) {
            /* mouse click buffer */
            console.warn('fast click')
        }

        console.log('start draw', delta)
        clearInterval(this.walkTicker)

        this.walkTicker = undefined
        this.lastMouseSpeed = 20
        this.moveCount = 1
        this.drawingLine = true
        this.startLine(Point.from(ev))
    }

    onMouseup(ev) {
        // console.log('stop draw')
        this.drawingLine = false
        this.stopLine(Point.from(ev))
        this.mouseUpTime = +(new Date)
        this.lastPoint = undefined
    }

    onMousemove(ev) {

        if(this.drawingLine) {
            this.tickFunc()
        }
        this.moveCount += Number(this.moveCount<40)
        let sp = Math.sqrt(this.lastMouseSpeed)
        let speed = sp * (this.moveCount * .07)
        let v = this.speedNumber.pushGet(speed)
        this.mouse.point.radius = clamp(v, 2, 40)
        this.lastMouseSpeed = this.mouse.speed()
    }

    startLine(point) {
        /* Start a line at a position*/
        this.line = new PointList(point)
        this.walkTicker = setInterval(this.tickFunc.bind(this), this.tickerInterval)
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
        let l2 = this.points2
        let last = this.lastPoint || l.last()
        let perform = true;

        if(last) {
            last.lookAt(mp)
            if(mp.distanceTo(last) < this.maxDistance + last.radius) {
                perform = false;
            }
        }

        if(perform){

            let p = last
            if(p){
                let points = p.split(2, undefined, 1.5)
                points.each.rotation = p.rotation
                // l.push.apply(l, points)
                l.push(points[0])
                l2.push(points[1])
            }

            this.lastPoint = mp.copy()
        }
    }

    draw(ctx){
        this.clear(ctx)
        // this.points.pen.line(ctx)
        this.points2.pen.quadCurve(ctx, {color: '#553366'}, 2)
        // ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, xc, yc);
        // this.points.pen.fill(ctx, {color: '#553366'})
        // this.points.pen.line(ctx, {color: '#553366'})
        ctx.strokeStyle = 'red'
        // this.points.pen.quadCurve(ctx, {color: '#553366'}, 1)
        this.points.pen.quadCurve(ctx, {color:undefined}, 1)
        // this.line?.pen.line(ctx, {color: '#553366'})
        // ctx.fill()
        ctx.stroke()
        // this.points.pen.fill(ctx, {color: '#553366'})
        // this.points.pen.indicator(ctx, {color: '#555'})

    }
}

stage = MainStage.go()
