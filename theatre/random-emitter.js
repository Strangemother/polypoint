/*
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/math.js
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


 */
class MainStage extends Stage {
    canvas = 'playspace'

    mounted(){
        this.point = new Point(100, 100, 20)
        // this.events.wake()
        this.e1 = new Emitter(200,200, 80)
        this.e1.wake()

        let e2 = new Emitter(400,400, 60)
        e2.direction = {x:-1, y:0} //inward.
        e2.fromEdge = true
        e2.tickModulo = 10
        e2.wake()
        this.e2 = e2


        // let e3 = new Emitter(500,200, 60)
        let e3 = new PumpRandomPointEmitter(500,200, 60)
        // e3.fromEdge = true
        // e3.tickModulo = 100
        // e3.birthrate = 100
        // e3.lifetime = 100
        // e3.radiusVariant = .1
        // e3.directionVariant = 360
        // e3.minSize = 2
        e3.wake()
        this.e3 = e3

        this.dragging.add(e3)
        // this.dragging.add(this.e1, e2, e3)
    }

    draw(ctx){
        this.clear(ctx)
        let es = [this.e3]
        // let es = [this.e1, this.e2, this.e3]
        ctx.strokeStyle = 'red'
        es.forEach(e=>{
            e.step()
            // e.rotation += 1
            // e.lookAt(this.mouse.point)
            e.pen.indicator(ctx)
            // e.points.pen.indicators(ctx)
            e.points.pen.fill(ctx)
        })

        this.point.pen.fill(ctx, '#880000')
    }
}


stage = MainStage.go(/*{ loop: true }*/)

