/*
categories: emitter
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

*/
class MainStage extends Stage {
    canvas = 'playspace'

    mounted(){
        let e2 = new Emitter(400,400, 60)
        e2.direction = {x:-1, y:0} //inward.
        e2.fromEdge = true
        e2.tickModulo = 10
        e2.wake()
        this.e2 = e2

        this.dragging.add(e2)
    }

    draw(ctx){
        this.clear(ctx)
        let es = this.e2
        ctx.fillStyle = '#880000'

        es.step()
        // es.rotation += 1
        // es.lookAt(this.mouse.point)
        es.pen.indicator(ctx)
        es.points.pen.fill(ctx)
    }
}


stage = MainStage.go(/*{ loop: true }*/)

