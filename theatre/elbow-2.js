/*
title: Elbow Constraints
category: constraints
files:
    head
    point
    stroke
    ../point_src/point-content.js
    pointlist
    mouse
    distances
    dragging
    ../point_src/functions/clamp.js
    ../point_src/mirror.js
    ../point_src/stage.js
    ../point_src/text/label.js
    ../point_src/intersections.js
    ../point_src/constrain-distance.js
---

An elbow contraint ensures a target point is _connected_ to another point, at
a distance of the two radii.

        point.constraint.elbow(other)

It's called an elbow, as there will always be an intersection at the max distance.
Similar to rings bound at the edge.

Synonymous to:

    let pA = this.endPoint
    let pB = this.primaryPoint

    pA.leash(pointB,
        (pB.radius + pA.radius) - .01)
    pA.avoid(pointB,
        Math.abs(pB.radius - pA.radius) + .01)

*/


class MainStage extends Stage {
    canvas='playspace'

    mounted(){
        this.endPoint = new Point({x:200,y:200, radius:90})
        this.primaryPoint = new Point({x:390,y:240, radius:130})
        this.dragging.addPoints(this.endPoint, this.primaryPoint)
        this.events.wake()

    }

    draw(ctx){
        this.clear(ctx)
        this.endPoint.constraint.elbow(this.primaryPoint)

        let i2 = this.endPoint.intersections.of(this.primaryPoint)
        // let i2 = getCircleCircleIntersections(this.endPoint, this.primaryPoint)

        if(i2.length > 0) {
            /* draw (quietly) the ignored point. */
            Point.from(i2[1]).pen.fill(ctx, '#332233')
        }

        this.endPoint.pen.indicator(ctx, {color: '#222'})
        this.primaryPoint.pen.indicator(ctx)

        if(i2.length > 0) {
            this.endPoint.pen.line(ctx, i2[0], 'red')
            this.primaryPoint.pen.line(ctx, i2[0], 'red')
            Point.from(i2[0]).pen.fill(ctx, '#CC00BB')
        }
    }
}


;stage = MainStage.go();