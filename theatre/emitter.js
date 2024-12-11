/*
title: Emitter
category: emitter

---

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
        let e3 = new Emitter(500,200, 60)
        e3.fromEdge = true
        e3.tickModulo = 10
        e3.birthrate = 1
        e3.lifetime = 200
        e3.wake()
        this.e3 = e3

        this.dragging.add(this.e1, e2, e3)
    }

    draw(ctx){
        this.clear(ctx)
        let es = [this.e1, this.e2, this.e3]

        es.forEach(e=>{
            e.step()
            e.rotation += 1
            // e.lookAt(this.mouse.point)
            e.pen.circle(ctx)
            e.points.pen.indicators(ctx)
        })

        this.point.pen.fill(ctx, '#880000')
    }
}


stage = MainStage.go(/*{ loop: true }*/)

