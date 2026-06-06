/*
title: Direction-Based Tethered Point
categories: binding
files:
    head
    point
    pointlist
    mouse
    stage
    dragging
    ../point_src/distances.js
    ../point_src/stage-clock.js
    ../theatre/objects/vectorpoint.js
---

*/

class MainStage extends Stage {
    canvas='playspace'

    mounted(){
        let p = this.point = new VectorPoint(200, 200, 100)
        this.dragging.add(p)

        let cp = p.addNewPoint()
        let cp2 = p.addNewPoint()

        this.dragging.add(cp)
        this.dragging.add(cp2)
    }

    draw(ctx){
        this.clear(ctx)
        // this.point.pen.fill(ctx)
        this.point.render(ctx)
    }
}



;stage = MainStage.go();