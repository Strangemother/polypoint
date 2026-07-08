/*
---
title: Directional Tangent 5
categories: tangents
    bisector
    raw
files:
    head
    stroke
    ../point_src/point-content.js
    pointlist
    point
    ../point_src/tangents.js
    ../point_src/bisector.js
    ../point_src/math.js
    ../point_src/split.js
    mouse
    dragging
    ../point_src/functions/clamp.js
    stage
    ../point_src/tangents.js
    ../point_src/text/beta.js
---

Another loopy.

*/


class MainStage extends Stage {
    canvas='playspace'

    mounted(){

        this.points = new PointList(
                {x:100, y:230, radius: 30}
                ,{x:200, y:90, radius: 20}
                // ,{x:300, y:240, radius: 20, isFlipped: true}
                // ,{x:340, y:640, radius: 30}
                ,{x:530, y:270, radius: 30}
                ,{x:440, y:440, radius: 30}
            ).cast();
        this.dragging.addPoints(...this.points)
    }

    draw(ctx){
        this.clear(ctx)
        this.points.pen.indicators(ctx)
        // this.points.pen.line(ctx)
        // this.points.last().pen.line(ctx, this.points[0])
        let stips = new PointList;
        this.points.siblings(1).forEach((ps,i)=>{
            ps[1].lookAt(ps[0])
            let a = ps[1].project()

            ps[0].lookAt(ps[1])
            let b = ps[0].project()

            stips.push(b)
            stips.push(a)
        })
        stips.pen.indicators(ctx)

        stips.pen.quadCurve(ctx,{ loop: 1})
    }

}


;stage = MainStage.go();