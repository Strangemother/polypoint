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
        this.dragging.add(cp)
    }

    draw(ctx){
        this.clear(ctx)
        this.point.render(ctx)
    }
}



;stage = MainStage.go();