/*
title: Emitter 4
category: emitter
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
    ../point_src/text/beta.js

---

*/
class MainStage extends Stage {
    canvas = 'playspace'

    mounted(){
        this.point = new Point(100, 100, 20)
        // this.events.wake()

        let e2 = new RandomPointEmitter(400,400, 60)
        // let e2 = new PumpRandomPointEmitter(400,400, 60)
        // let e2 = new RandomPointEmitter(400,400, 60)
        e2.direction = {x:1, y:0} //inward.
        e2.fromEdge = true
        e2.directionVariant = 260
        e2.tickModulo = 7
        e2.speed = .2
        e2.birthrate = 2
        e2.minSize = 1
        e2.particleSpeed = .9
        e2.lifetime = e2.radius * 2
        e2.wake()
        this.e2 = e2

        this.dragging.add(e2)
        // this.dragging.add(this.e1, e2, e3)
    }

    draw(ctx){
        this.clear(ctx)
        let es = [this.e2]
        // let es = [this.e1, this.e2, this.e3]

        ctx.fillStyle = '#EEE'
        ctx.font = `400 16px sans-serif`;
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        es.forEach((e,i)=>{

            e.step()
            e.rotation += (e.speed || 0)
            // e.lookAt(this.mouse.point)
            e.pen.circle(ctx, {color: 'purple', width: 2})
            e.text.fill(ctx, e.length)
            e.points.forEach(p=>{
                p.radius = clamp( (p.lifetime * 3 / p.age * 4) - 2, 0, 30)
                // p.radius = clamp( (p.age * 3 / p.lifetime * 4) - 2, 0, 30)
            })
            e.points.pen.lines(ctx, 'purple', 2)

        })

        // this.point.pen.fill(ctx, '#880000')
    }
}


stage = MainStage.go(/*{ loop: true }*/)