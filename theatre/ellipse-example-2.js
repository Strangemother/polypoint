/*
title: Ellipse with Rotation
categories: simple
    ellipse
files:
    head
    stroke
    pointlist
    point
    mouse
    dragging
    stage
---

*/


class MainStage extends Stage {
    canvas='playspace'

    mounted(){
        this.pointA = new Point(200,200, 100, 0)
        this.start = new Point(200,200, 50, 20)
        this.end = new Point(200,200, 50, -20)
        this.dragging.addPoints(this.pointA, this.start, this.end)
    }

    draw(ctx){
        this.clear(ctx)

        let p = this.pointA;
        p.pen.indicator(ctx)
        let width = p.radius * .5
            , height = p.radius
        let start = this.start
        let end = this.end
        start.pen.indicator(ctx)
        end.pen.indicator(ctx)

        p.pen.ellipse(ctx, {width, height, start: start.radians, end: end.radians}, 'red')
    }
}


;stage = MainStage.go();