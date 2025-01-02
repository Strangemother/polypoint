/*
---
title: Coupling Points
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

# Coupling Three Points

assign multiple _coupled_ keys across three points. Dragging a point adapts its
sibling.

*/
class MainStage extends Stage {
    canvas='playspace'

    mounted(){

        let a = this.a = new Point({x:200,y:200, radius: 50})
        let b = this.b = new Point({x:300,y:300, radius: 50})
        let c = this.c = new Point({x:200,y:200, radius: 50})

        this.dragging.add(a, b, c)

        let d = this.coupling = new Coupling()

        d.couple(a, b, {
            x: 100
            // , y: 100
        })

        d.couple(a, b, {
            // x: 100
            rotation: 10
            , radius: 0
             // y: 100
        })

        d.couple(a, c, {
            y: 100
            , rotation: -180
             // y: 100
        });

        d.step()
    }

    draw(ctx){
        this.clear(ctx)

        this.a.rotation += 1
        this.coupling.step()

        this.a.pen.indicator(ctx, { color:'#ddd'})
        this.b.pen.indicator(ctx, {color:'green'})
        this.c.pen.indicator(ctx)
    }
}


;stage = MainStage.go();