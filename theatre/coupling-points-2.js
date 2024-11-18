/*
---
title: Coupling Points
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

Bind many points
 */

/* In the new one, each key is tested in a cache.
Previously it was a string - therefore when updates occured the string was pre-cached
multiple updates failed, as the key was (false positive) cached in a previous step.
*/

class MainStage extends Stage {
    canvas='playspace'

    mounted(){

        let a = this.a = new Point({x:200,y:200, radius: 50})
        let b = this.b = new Point({x:300,y:300, radius: 50})
        let c = this.c = new Point({x:200,y:200, radius: 20})

        this.dragging.add(a, b, c)

        let d = this.coupling = new Coupling()

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