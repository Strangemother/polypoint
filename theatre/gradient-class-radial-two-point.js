/*
title: Radial Gradient (2 Points)
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
 */

class MainStage extends Stage {
    canvas='playspace'

    mounted(){
        let c = this.center

        c.radius = 200

        this.point = c.copy()

        this.innerPoint = c.copy().update({color:"hsl(299deg 62% 44%)"})
        this.outerPoint = c.copy().update({color: "hsl(244deg 71% 56%)"}) // dark
        this.innerPoint.radius = 70

        this.g = (new Gradient).radial(this.innerPoint, this.outerPoint)
        // this.g = (new Gradient).radial(this.innerPoint, this.outerPoint)
        this.dragging.add(
                this.innerPoint,
                this.outerPoint,
                this.point)

        this.g.addStops({
            0: this.innerPoint,
            1: this.outerPoint
        })
    }

    draw(ctx){
        this.clear(ctx)
        this.g.radial() // refresh hack.
        let grad = this.g.getObject(ctx)

        this.point.pen.fill(ctx, grad)
        // this.point.pen.circle(ctx, undefined, '#000', 3)

        // this.point0.pen.line(ctx, this.point1, '#111111', 2)
        this.innerPoint.pen.fill(ctx, 'white', 2)
        this.innerPoint.pen.circle(ctx, undefined, 'white', 1)
        this.outerPoint.pen.circle(ctx, undefined, '#DDD', 1)
    }

}

;stage = MainStage.go();