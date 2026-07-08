/*
title: Particle Emitter System V5
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
        let e2 = new RandomPointEmitter(400,400, 60)
        e2.direction = {x:1, y:0}
        e2.fromEdge = true
        e2.directionVariant = 200
        e2.tickModulo = 3
        e2.speed = .2
        e2.birthrate = 3
        e2.minSize = 1
        e2.particleSpeed = 1
        e2.lifetime = e2.radius * 3
        e2.wake()
        this.e2 = e2
        this.dragging.add(e2)
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
            e.pen.circle(ctx, {color: 'purple', width: 2})
            e.text.fill(ctx, e.length)
            e.points.forEach(p=>{
                p.radius = clamp( (p.age * 3 / p.lifetime * 4) - 2, 0, 30)
            })
            e.points.pen.lines(ctx, 'purple', 2)

        })
    }
}


stage = MainStage.go(/*{ loop: true }*/)