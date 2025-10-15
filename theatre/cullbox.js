/*
title: Culling screen edge points
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/math.js
    ../point_src/point-content.js
    ../point_src/pointlistpen.js
    ../point_src/pointlist.js
    ../point_src/point.js
    ../point_src/text/beta.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/functions/clamp.js
    ../point_src/random.js
    ../point_src/distances.js
    ../point_src/dragging.js
    ../point_src/stage.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/text/styler.js
    ../point_src/relative.js
    ../point_src/velocity.js
    ../point_src/emitter.js
    ../point_src/screenwrap.js

*/
class MainStage extends Stage {
    canvas = 'playspace'

    mounted(){
        this.point = new Point(100, 100, 20)
        this.textPos = new Point(100, 100, 20)

        let e1 = this.e1 = new RandomPointEmitter()
        e1.update({
            x: 400
            , y: 400
            , radius: 60
            // , radiusVariant: .1
            , directionVariant: 100
            , particleSpeed: .6
            , lifetime: 600
            , fromEdge: true
            , tickModulo: 1
            // , speed: 100
            , birthrate: 90
            , pointLimit: 1000
        })

        // e1.direction = {x:-1, y:0} //inward.
        this.e1 = e1
        e1.wake()
        this.screenWrap.edgeMethod = 'performCull'
        this.dragging.add(this.point, this.e1)
    }

    draw(ctx){
        this.clear(ctx)
        this.e1.step()

        this.point.pen.indicator(ctx, '#880000')
        /* the primary emitter point */
        this.e1.pen.fill(ctx, '#aaa')
        /* The spawned points.*/
        this.e1.points.pen.circle(ctx, undefined, '#aaa')
        // this.e1.points.pen.lines(ctx,'#aaa')

        let v = this.point.speed2D.absFloat()
        let vh = (v * .5)
        this.e1.birthrate = 2 + v
        this.e1.particleSpeed = 1 + (vh * .2)
        this.e1.lifetime = this.e1.distanceTo(this.point) - vh

        ctx.fillStyle = 'white';
        ctx.font = `500 16px arial`;

        this.screenWrap.cullBox(this.e1.points, (p)=>{
            /* Because this is an emitter, we can cheat
            and simply _over-age_ the point, The emitter will handle
            the rest. */
            p.age = p.lifetime + 10

        })

        this.textPos.text.fill(ctx, this.e1.points.length,)
    }
}


stage = MainStage.go(/*{ loop: true }*/)

