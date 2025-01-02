/*
title: Emitter Curve
category: emitter
files:
    ../point_src/core/head.js
    ../point_src/math.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/point-content.js
    ../point_src/pointlistpen.js
    ../point_src/pointlist.js
    ../point_src/point.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/functions/clamp.js
    ../point_src/random.js
    ../point_src/distances.js
    ../point_src/dragging.js
    ../point_src/stage.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/relative.js
    ../point_src/velocity.js
    ../point_src/emitter.js
    ../point_src/text/beta.js
    ../point_src/split.js
    ../point_src/curve-extras.js

---

*/
class MainStage extends Stage {
    canvas = 'playspace'

    mounted(){
        this.point = new Point(100, 100, 20)
        // this.events.wake()

        let e2 = new RandomPointEmitter(400,400, 60)
        // e2.direction = {x:-1, y:0} //inward.
        e2.fromEdge = true
        e2.tickModulo = 12
        e2.speed = 1
        e2.birthrate = 10
        e2.wake()
        this.e2 = e2


        // let e3 = new Emitter(500,200, 60)
        // e3.fromEdge = true
        // e3.tickModulo = 100
        // e3.birthrate = 20
        // e3.lifetime = 200
        let e3 = new PumpRandomPointEmitter(500,200, 60)
        e3.wake()
        this.e3 = e3

        // this.dragging.add(this.e1, e2, e3)


        let lpoints = [new Point(200, 600, 400, -90), new Point(600, 600, 400, -90)]
        this.line = new BezierCurve(...lpoints)

        let le = new LineEmitter()
        this.lineEmitter = le
        le.tickModulo = 1
        le.birthrate = 1
        le.radiusVariant = 1
        // le.lifetime = 200
        le.cachePoints(this.line, .5)
        le.wake()

        this.dragging.add(e2, e3, ...this.line.points)
        this.dragging.onDragEnd = this.onDragEnd.bind(this)
        this.dragging.onDragMove = this.onDragMove.bind(this)
    }

    onDragEnd() {}
    onDragMove() {
        this.lineEmitter.cachePoints(this.line, .5)

    }

    draw(ctx){
        this.clear(ctx)
        let es = [this.e2, this.e3]
        // let es = [this.e1, this.e2, this.e3]

        ctx.strokStyle = '#EEE'
        ctx.fillStyle = '#EEE'
        ctx.font = `400 16px sans-serif`;
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

/*        this.e2.step()
        this.e2.pen.indicator(ctx)

        es.forEach(e=>{
            e.step()
            e.rotation += (e.speed || 0)
            // e.lookAt(this.mouse.point)
            e.pen.circle(ctx)
            e.text.fill(ctx, e.length)
            e.points.pen.indicators(ctx)
            // e.points.pen.indicators(ctx)
        })
*/

        this.line.render(ctx)
        // this.line.points.forEach((p)=>p.pen.indicator(ctx))
        // this.line.split(this.line.length / 16, 90).pen.indicators(ctx)
        this.lineEmitter.step()
        this.lineEmitter.points.pen.indicators(ctx)
        ctx.fillStyle = '#EEE'
        this.line.points[0].text.fill(ctx, this.lineEmitter.points.length, {x:30, y:0})
        // this.point.pen.fill(ctx, '#880000')
    }
}


stage = MainStage.go(/*{ loop: true }*/)

