/*
title: Linear Gradient Single Point
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
    ../point_src/functions/rel.js
    ../point_src/random.js
    ../point_src/dragging.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/automouse.js
    ../point_src/gradient.js
    ../point_src/split.js
 */

class MainStage extends Stage {
    canvas='playspace'

    mounted(){
        let c = this.center

        c.radius = 150

        this.point = c.copy()

        this.innerPoint = c.copy().update({
                radius:c.radius + 40
                , color:"hsl(299deg 62% 44%)"
            })

        this.g = (new Gradient).linear(this.innerPoint)

        this.dragging.add(
                this.innerPoint,
                this.point)

        this.g.addStops({
            0: "hsl(299deg 62% 44%)",
            1: "hsl(244deg 71% 56%)"
        })
    }

    draw(ctx){
        this.clear(ctx)
        this.g.linear() // refresh hack.
        let grad = this.g.getObject(ctx)

        this.innerPoint.rotation += .5

        this.point.pen.fill(ctx, grad)
        this.innerPoint.pen.indicator(ctx, {color: 'white'})
        this.innerPoint.pen.circle(ctx, undefined, 'white', 1)
    }

}

;stage = MainStage.go();