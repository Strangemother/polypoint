/*
---
title: Locked Joint
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
    ../point_src/cone.js
    ../point_src/constrain-distance.js
---

A point cannot exceed the rotation around a point to a maxmium angle value,
relative to the origin point zero.

Meaning if we have a point (origin), and another point (knee). The position
of the knee may not lye outside a cone projected from the center of origin,

Rotating the origin will slide the position around the origin center
Moving the knee will _lock_ at the edges of the projected cone.

distance is handled by another element, and is optional here.

This demo uses two constraints together:

1. `cone()` limits the angle of the child around its parent.
2. `track()` keeps the child at a fixed distance from its parent.

So the cone decides _where the point may rotate_, while track decides _how far
away it stays_. Combining them gives a simple joint with angular limits.
 */
class MainStage extends Stage {
    canvas='playspace'

    mounted(){

        let a = this.a = new Point({x:200,y:200, radius: 50, rotation: 10, coneDeg: 50})
        let b = this.b = new Point({x:400,y:200, radius: 30,
                rotation: 0,
                /* degrees  either side of rotation point.
                resulting in 10 arc degress allowed movement.*/
                coneDeg: 10})
        let c = this.c = new Point({x:600,y:200, radius: 20})

        this.a.cone.update({ container: this.dimensions, innerOffset: 1, innerCurve: 1 })
        this.dragging.add(a, b, c)

    }

    draw(ctx){
        this.clear(ctx)

        // this.a.rotation += 1

        /* First clamp each child into its parent's allowed angular cone. */
        this.a.constraint.cone(this.b, this.a.coneDeg)
        this.b.constraint.cone(this.c, this.b.coneDeg)

        /* Then enforce the segment lengths. This preserves the locked angle
        while keeping each point on its radius from the parent. */
        this.b.constraint.track(this.a, 200)
        this.c.constraint.track(this.b, 100)
        this.a.cone.fill(ctx, {color: '#010101'})
        this.a.pen.indicator(ctx, {color:'#ddd'})
        this.b.pen.indicator(ctx, {color:'green'})
        this.c.pen.indicator(ctx)

    }
}


;stage = MainStage.go();