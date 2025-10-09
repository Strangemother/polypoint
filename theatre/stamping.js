/*
files:
    head
    ../point_src/math.js
    ../point_src/extras.js
    ../point_src/point-content.js
    dragging
    pointlist
    point
    stage
    mouse
    stroke
    ../point_src/emitter.js
    ../point_src/relative.js
    ../point_src/random.js

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
        e2.tickModulo = 1
        e2.speed = .1
        e2.birthrate = 20

        e2.wake()
        this.e2 = e2

        let e3 = new PumpRandomPointEmitter(500,200, 60)
        e3.wake()
        this.e3 = e3

        this.dragging.add(e2, e3)
        // this.dragging.add(this.e1, e2, e3)

        this.stamp = new Stamp()
    }

    firstDraw(ctx){
        ctx.fillStyle = '#EEE'
        ctx.font = `400 16px sans-serif`;
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.strokeStyle = '#EEE'
    }

    draw(ctx){
        this.clear(ctx)

        // this.drawEmitters(ctx)
        this.rawDrawEmitters(ctx)
    }

    rawDrawEmitters(ctx){
        // e.pen.indicator(ctx)
        // e.points.pen.indicators(ctx)

        let e = this.e2;
        e.step()
        const pi2 = Math.PI2
        e.points.forEach(p=>{
            ctx.beginPath()
            const opts = p._opts
            ctx.arc(opts.x, opts.y, 5, 0, pi2)
            ctx.stroke()
        })
        // ctx.arc()
    }

    drawEmitters(ctx) {

        let e = this.e2;
        e.step()
        e.points.pen.stroke(ctx)

    }
}

class Stamp {

    render(ctx, points, func) {
        ctx.save();
        let prev = points[0]
        points.forEach((p)=>{
            // ctx.translate(p.x, p.y)
            let np = p.subtract(prev)
            ctx.translate(np.x, np.y)
            // ctx.rotate(p.radians)
            func(np)
            prev = p
        });

        ctx.restore();
    }
}


stage = MainStage.go(/*{ loop: true }*/)

