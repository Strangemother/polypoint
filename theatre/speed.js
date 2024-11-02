
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
            , lifetime: 600
            , fromEdge: true
            , tickModulo: 2
            // , speed: 100
            , birthrate: 1
            , pointLimit: 1000
        })

        e1.wake()

        // e1.direction = {x:-1, y:0} //inward.

        this.e1 = e1

        e1.wake()

        this.dragging.add(this.point, this.e1)
    }

    draw(ctx){
        this.clear(ctx)
        this.e1.step()

        this.point.pen.indicator(ctx, '#880000')
        this.point.rotation = 90-radiansToDegrees(this.point.speed2D.direction())
        this.e1.pen.fill(ctx, '#aaa')
        this.e1.points.pen.circle(ctx, undefined, '#aaa')

        let v = this.point.speed2D.absFloat()
        let vh = (v * .5)
        this.e1.birthrate = 1 + v
        this.e1.particleSpeed = 1 + (vh * .2)
        this.e1.lifetime = this.e1.distanceTo(this.point) - vh
        ctx.fillStyle = 'white';
        ctx.font = `500 16px arial`;
        this.textPos.text.fill(ctx, v,)
    }
}


stage = MainStage.go(/*{ loop: true }*/)
