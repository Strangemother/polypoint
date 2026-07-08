/*
title: Radial Gradient (1 Point)
category: gradient
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/extras.js
    ../point_src/math.js
    ../point_src/point-content.js
    ../point_src/stage.js
    ../point_src/point.js
    ../point_src/distances.js
    ../point_src/pointlist.js
    ../point_src/events.js
    ../point_src/functions/clamp.js
    ../point_src/functions/within.js
    ../point_src/random.js
    ../point_src/dragging.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/automouse.js
    ../point_src/gradient.js
---

In this example we create a radial gradient with _one_ point, allowing a simple
colour gradient from the x/y of the origin.

Notice the x/y of the stop points is not relevant - only the color.
 */

class MainStage extends Stage {
    canvas='playspace'

    mounted(){
        let c = this.center

        c.radius = 200

        this.point = c.copy()

        this.innerPoint = c.copy().update({radius: 40, rotation: 30})
        this.g = (new Gradient).conic(this.innerPoint)

        this.dragging.add(
                this.innerPoint,
                this.point)

        this.g.addStops({
            0: {color:"hsl(299deg 62% 44%)"},
            1: {color: "hsl(244deg 71% 56%)"} // dark
        })
    }

    draw(ctx){
        this.clear(ctx)
        this.g.conic() // refresh hack.
        this.innerPoint.rotation -= .5
        let grad = this.g.getObject(ctx)

        this.point.pen.fill(ctx, grad)

        this.innerPoint.pen.fill(ctx, 'white', 2)
        this.innerPoint.pen.circle(ctx, undefined, 'white', 1)
        // this.outerPoint.pen.circle(ctx, undefined, '#DDD', 1)
    }

}

;stage = MainStage.go();

