/*
title: Random Point Pump System
categories: Random Point Emitter
files:
    head
    ../point_src/math.js
    ../point_src/point-content.js
    pointlist
    point
    mouse
    ../point_src/random.js
    dragging
    stage
    stroke
    ../point_src/relative.js
    ../point_src/velocity.js
    ../point_src/emitter.js
---

A Pump Emitter spawns many points per iteration, around the circumference of the
point.


*/
class MainStage extends Stage {
    canvas = 'playspace'

    mounted(){
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
    }

    draw(ctx){
        this.clear(ctx)
        let es = this.e3
        ctx.strokeStyle = 'red'
        ctx.fillStyle = '#880000'
        es.step()
        // es.rotation += 1
        // es.lookAt(this.mouse.point)
        es.pen.indicator(ctx)
        // es.points.pen.indicators(ctx)
        es.points.pen.fill(ctx)
    }
}


stage = MainStage.go(/*{ loop: true }*/)

