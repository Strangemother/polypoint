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
    dragging
    ../point_src/distances.js
    ../point_src/functions/clamp.js
    ../point_src/mirror.js
    ../point_src/stage.js
    ../point_src/text/label.js
    ../point_src/intersections.js
    ../point_src/cone.js
    ../point_src/constrain-distance.js
---

An elbow contraint ensures a target point is _connected_ to another point, at
a distance of the two radii.

        point.constraint.elbow(other)

It's called an elbow, as there will always be an intersection at the max distance.
Similar to rings bound at the edge.

Synonymous to:

    let pA = this.legL
    let pB = this.primaryPoint

    pA.leash(pointB,
        (pB.radius + pA.radius) - .01)
    pA.avoid(pointB,
        Math.abs(pB.radius - pA.radius) + .01)

*/


class MainStage extends Stage {
    canvas='playspace'

    mounted(){

        this.a = new PointList(
                {x:350,y:240, radius:20}
                , {x:250,y:220, radius:10}
                , {x:250,y:240, radius:10}
            ).cast()
        this.b = new Point({x:390,y:220, radius:130})
        this.dragging.addPoints(...this.a, this.b)



    }

    draw(ctx){
        this.clear(ctx)

        /* hip leashes knee */
        this.a[2].constraint.leash(this.a[1], 100)

        /* Knee leashes foot */
        this.a[1].constraint.leash(this.a[0], 100)

        /* Knee looks away from hip*/
        this.a[1].lookAt(this.a[0], Math.PI)

        this.a[1].constraint.cone(this.a[2], 90)

        this.a.pen.quadCurve(ctx, {color: 'cyan'})
        this.a.pen.indicator(ctx, {color: 'cyan'})
        this.b.pen.indicator(ctx)


    }
}


;stage = MainStage.go();