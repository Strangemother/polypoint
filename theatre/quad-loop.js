/*
---
title: Quad Curve Loop
categories: quadcurve
    curve
files:
    head
    stroke
    pointlist
    point
    mouse
    dragging
    stage
    ../point_src/curve-extras.js

---

Draw a quad curve (as a loop) using the  `PointList.draw.quadCurve` method.
It uses `quadraticCurveTo` across all points, with loop closure
*/

class MainStage extends Stage {
    canvas='playspace'

    mounted(){
        this.points = new PointList(
                [40, 240, 10]
                , [150, 140, 10]
                , [240, 220, 10]
                , [350, 500, 10]
                , [460, 200, 10]
                , [120, 234, 10]
                , [150, 100, 10]
                , [360, 97, 10]
                // , [350, 300, 10]
                // , [226, 340, 10]
            ).cast()

        this.dragging.addPoints(...this.points)
        this.points.shape.radius(200, new Point(300,300))
    }

    draw(ctx){
        this.clear(ctx)
        ctx.fillStyle = '#661177';
        ctx.strokeStyle = '#661177';

        // this.points.pen.line(ctx)
        this.points.pen.quadCurve(ctx, {color:undefined}, 1)
        // ctx.stroke()
        // ctx.fill()
        this.points[0].pen.fill(ctx)
        this.points.pen.indicator(ctx, {color: '#555'})
    }
}


;stage = MainStage.go();