/*
---
title: Coupling Function
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/point-content.js
    ../point_src/pointlist.js
    ../point_src/point.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/distances.js
    ../point_src/dragging.js
    ../point_src/functions/clamp.js
    ../point_src/stage.js
    ../point_src/coupling.js
---

In this example. The node A and B locked _rotation_ to the location of C.

    a.rotation -> [coupled to] -> b.location
    a.rotation <- [coupled to] <- b.location

*/
class MainStage extends Stage {
    canvas='playspace'

    mounted(){

        let a = this.a = new Point({x:200,y:200, radius: 50})
        let looky = this.c = new Point({x:400,y:200, radius: 10})

        this.dragging.add(a, looky)

        // The looky point should _loosely_ follow A.
        // looky should follow A,
        // and looky should release when manipulated
        // e.g. A drag control point
    }

    draw(ctx){
        this.clear(ctx)

        this.a.pen.indicator(ctx, { color:'#ddd'})
        this.c.pen.indicator(ctx)
    }
}


;stage = MainStage.go();