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
    ../point_src/gradient.js
 */
class MainStage extends Stage {
    canvas = 'playspace'

    mounted(){
        this.point = new Point(100, 100, 20)
        this.textPos = new Point(100, 100, 20)
        // this.events.wake()
        // let e1 = this.e1 = new Emitter(200,200, 80)

        // let e1 = this.e1 = new RandomPointEmitter(400,400, 60)

        // // e1.radiusVariant = .1
        // e1.directionVariant = 100
        // e1.particleSpeed = .6
        // e1.lifetime = 600
        // e1.fromEdge = true
        // e1.tickModulo = 2
        // // e1.speed = 100
        // e1.birthrate = 1
        // e1.pointLimit = 1000
        // debugger;
        let e1 = this.e1 = new RandomPointEmitter()
        e1.update({
            x: 400
            , y: 400
            , radius: 60
            // , radiusVariant: .1
            , directionVariant: 100
            , particleSpeed: .6
            , lifetime: 200
            , fromEdge: true
            , spawnOffset: true
            , tickModulo: 2
            // , speed: 100
            , birthrate: .6
            , pointLimit: 1000
        })

        e1.wake()

        // e1.direction = {x:-1, y:0} //inward.

        this.e1 = e1
        this.g = (new Gradient).radial(this.e1)

        let c1 = '#fbc148'
        let c2 = '#d64b02'

        this.g.addStops({
            0: {color: c1}
            ,1: {color: c2} // dark
            // ,1: {color: '#c31a01'} // dark
        })
        // e1.wake()

        this.dragging.add(this.point, this.e1)
    }

    draw(ctx){
        this.clear(ctx)
        this.e1.step()
        this.g.radial() // refresh hack.
        let grad = this.g.getObject(ctx)

        // let v = this.point.speed2D.absFloat() + 10
        // let vh = (v * .5)
        // let speed = (1+v) * .1
        // speed = clamp((speed * speed) * .5, .1, 10)

        // this.e1.points.forEach(p => {
        //     if (p._vx == undefined) {
        //         p._vx = p.vx;
        //         p._vy = p.vy;
        //     }
        //     p.vx = p._vx * speed * 2;
        //     p.vy = p._vy * speed * 2;
        // })

        // this.point.pen.indicator(ctx, 'orange')
        // this.point.rotation = 90-radiansToDegrees(this.point.speed2D.direction())
        let c1 = '#fbc148'
        let rCol = function(){
            let lr = random.int(20, 21)
            let c2 = `hsl(21deg 97% ${lr}%)`
            return c2;
        }

        // this.e1.points.forEach(p=>p.pen.fill(ctx, rCol()))
        let c2 = `#d64b02`
        this.e1.points.pen.fill(ctx, grad)
        this.e1.pen.fill(ctx, grad)

        // this.e1.birthrate = v * speed
        // this.e1.particleSpeed = (vh * .1)
        // this.e1.lifetime = this.e1.distanceTo(this.point) - vh
        // ctx.fillStyle = 'white';
        // ctx.font = `500 16px arial`;
        // this.textPos.text.fill(ctx, v,)
    }
}


stage = MainStage.go(/*{ loop: true }*/)

