/*
title: Rel Function
categories: relative
    functions
files:
    head
    ../point_src/point-content.js
    pointlist
    point
    mouse
    dragging
    stroke
    ../point_src/functions/clamp.js
    ../point_src/functions/rel.js
    stage
    ../point_src/split.js
    ../point_src/random.js
---

The `rel()` function provides _relative_ offset to values, such as the `point.x`.

In this example the center point is copied, and offset by `rel(-200)`.
*/

const boundCaller = function(func) {
    /* return a function to call the _given_ function.

    This allows a _dynamic_ value, called every update.

    For example, ensure the `y` value of a point is the same as `x`:

        a.y = boundCaller((p, k) => p.x)
    */
    return function relCaller(p, k) {
        console.log('Call once')
        return func.bind(p)
    }
}


class MainStage extends Stage {
    canvas='playspace'

    mounted(){
        let offsetValue = -200
        this.center.radius = 40

        let a = this.a = this.center.copy()
        a.x = rel(offsetValue)

        this.dragging.add(a)
        a.y = boundCaller((p, k) => this.center.y + offsetValue)
    }

    draw(ctx){
        this.clear(ctx)
        this.a.pen.fill(ctx, `hsl(90deg 100% 30%)`)
        this.center.pen.fill(ctx, `hsl(90deg 10% 10%)`)
    }
}


;stage = MainStage.go();