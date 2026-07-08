/*
---
title: Locked Coupling Points
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/pointlist.js
    ../point_src/point-content.js
    ../point_src/point.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/distances.js
    ../point_src/dragging.js
    ../point_src/functions/clamp.js
    ../point_src/stage.js
    ../point_src/coupling.js
---

# Locked Coupling

Locked coupling ensures changes _only_ occur in one direction. Changes on the
_second_ node of a coupling will not affect the assigned coupled keys.
 */
class MainStage extends Stage {
    canvas='playspace'

    mounted(){

        let a = this.a = new Point({x:200,y:200, radius: 50})
        let b = this.b = new Point({x:300,y:300, radius: 50})
        let c = this.c = new Point({x:200,y:200, radius: 20})

        this.dragging.add(a, b, c)

        let d = this.coupling = new LockedCoupling()

        /* B.y value is locked at a distance + relative to the C.y

        + a and b are locked
        + using _c_ as an offset value
        + focusing on the `y`.
        */
        d.couple(a, b, c, ['y'])// {x: 10, y: 10})
        d.step()
    }

    draw(ctx){
        this.clear(ctx)

        this.a.rotation += 1
        this.coupling.step()

        this.a.pen.indicator(ctx, {color:'#ddd'})
        this.b.pen.indicator(ctx, {color:'green'})
        this.c.pen.indicator(ctx)
    }
}


;stage = MainStage.go();