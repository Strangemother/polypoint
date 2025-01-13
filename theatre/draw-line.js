/*

files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/extras.js
    ../point_src/math.js
    ../point_src/point-content.js
    ../point_src/stage.js
    ../point_src/point.js
    ../point_src/distances.js
    ../point_src/pointlistpen.js
    ../point_src/pointlist.js
    ../point_src/events.js
    ../point_src/functions/clamp.js
    ../point_src/curve-extras.js
    ../point_src/random.js
    ../point_src/dragging.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/automouse.js

 */
class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        // this.dragging.add(...this.points)
        this.events.wake()

        this.stroke = new Stroke({
            color: '#eee'
            , width: 1
            , dash: [7, 4]
        })

    }

    maxDistance = 20
    projectionSpread = .3

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
        let mp = this.mouse.point

        let lastPosition = mp._previousPosition
        mp._previousPosition = mp.copy()
        if(lastPosition == undefined) {
            return
        }
        //speedVector
        mp.speed = mp.distanceTo(lastPosition) * .5
        let dist = mp.speed
        if(this.drawingLine && dist > this.maxDistance) {
            this.line && this.tickFunc()
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
        // if(this.walkTicker) {
        // }
    }

    plotCurve(){
        let line = this.line
        // console.log('plot', line.length)
        /*
        each curve needs two points, the end point of each curve
        should be rotated to inverse the inbound angle.*/
        let abbc = line.siblings()
        let curves = []
        let plottedPoints = new PointList;

        abbc.forEach((abPointList, i)=> {
            /* get Tip, rotate.*/

            let endPoint = abPointList.last()
            let firstPoint = abPointList.first()
            let dist = firstPoint.distanceTo(endPoint)
            let newFirst = Point.from(firstPoint.asArray())
            newFirst.radius += dist * .4
            let newEnd = Point.from(endPoint.asArray())
            newEnd.radius += dist * .4
            newEnd.rotation += 180

            let curve = new BezierCurve(newFirst, newEnd)
            plottedPoints.push(newFirst, newEnd)
            curve.doTips = true
            curve.doBeginPath = false
            curve.doClosePath = false

            curves.push(curve)
        })

        // console.log('made', curves.length, 'curves')
        this.curves = curves;
        this.plottedPoints = plottedPoints
    }

    tickFunc() {
        /* Tick event,
        if the distance is greater than the existing, add point.*/
        let mp = this.mouse.point
        let l = this.line
        let len = l.length
        let prev = l.last()
        if(len == 1) {
            prev.lookAt(mp)
        }
        let dist = prev.distanceTo(mp)
        if(dist > 50 - (prev.radius * 3)) {
            let np = mp.copy()
            np.lookAt(prev)
            np.rotation += 180
            let v = clamp(mp.speed * 3, 5, 40)
            np.radius = v
            l.push(np)
        }
        this.plotCurve()
    }

    draw(ctx){
        this.clear(ctx)


        this.plottedPoints?.forEach((p, i)=>{
            p.project().pen.indicator(ctx, {color: '#555'})
        })

        if(this.drawingLine){
            this.line?.pen.indicators(ctx)
        }

        if(this.curves){

            this.stroke.set(ctx)

            // this.projectionSpread = Math.cos(this.clock.tick * .01)
            // this.plotCurve()

            ctx.beginPath()
            this.curves?.forEach((line)=>{
                line.perform(ctx)
            })
            ctx.stroke()
            this.stroke.unset(ctx)
        }


    }
}

stage = MainStage.go()
