/*
title: Emitter Line
category: emitter
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/math.js
    ../point_src/point-content.js
    ../point_src/pointlist.js
    ../point_src/pointlistpen.js
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

        let lpoints = [new Point(400, 400), new Point(100, 400)]
        this.line = new Line(...lpoints)

        let le = new LineEmitter()
        this.lineEmitter = le
        le.tickModulo = 1
        le.birthrate = 2
        le.lifetime = 400
        le.direction = {x: 0, y:1} // this.point.direction
        le.cachePoints(this.line, .5)
        le.wake()

        this.dragging.add(...this.line.points, this.point)
        // this.dragging.onDragEnd = this.onDragEnd.bind(this)
        this.dragging.onDragMove = this.onDragMove.bind(this)
    }

    // onDragEnd() {}
    onDragMove() {
        this.lineEmitter.cachePoints(this.line, .5)
    }

    draw(ctx){
        this.clear(ctx)
        let es = [this.e2, this.e3]
        // let es = [this.e1, this.e2, this.e3]

        ctx.strokStyle = '#EEE'
        ctx.fillStyle = 'purple'
        ctx.font = `400 16px sans-serif`;
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        this.lineEmitter.step()

        this.lineEmitter.points.forEach((p)=> {
            ctx.moveTo(p.x + p.radius, p.y)
            // ctx.beginPath()
            ctx.closePath()
            p.draw.circle(ctx)
        })

        ctx.fill()
        // ctx.stroke()
        this.line.points[0].text.fill(ctx, this.lineEmitter.points.length, {x:30, y:0})
        this.point.pen.indicator(ctx, '#880000')

        this.line.render(ctx)
    }
}


stage = MainStage.go(/*{ loop: true }*/)

