/*
---
title: Bezier Curve Example
files:
    ../point_src/math.js
    head
    point
    pointlist
    dragging
    mouse
    stage
    dragging
    stroke
    ../point_src/curve-extras.js
    ../point_src/catenary-curve.js
---

A demo of the `BezierCurve` instance.

    curve = new BezierCurve(
            new Point(200, 300, 200, -30)
            , new Point(600, 340, 200, 90)
        )
    curve.render(ctx)

*/
class MainStage extends Stage {
    canvas='playspace'
    _tick = 0
    mounted(){
        this.curve = new CatenaryCurve(
                new Point(200, 300, 200, -30)
                , new Point(500, 340, 200, 90)
                , 700
            )

        this.dragging.add(...this.curve.points)
    }

    draw(ctx){
        this.clear(ctx)

        this.curve.points.pen.indicator(ctx, {color: '#333', width:1})

        // this.curve.updateSwing(ctx, this.tick++)
        this.curve.perform(ctx)
        this.curve.draw(ctx, {color: 'purple', width:2})
    }
}


;stage = MainStage.go();