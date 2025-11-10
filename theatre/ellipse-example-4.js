/*
title: Ellipse Parametric Plot
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
    ../point_src/line.js
    ../point_src/recttools.js
---

*/


class MainStage extends Stage {
    canvas='playspace'

    mounted(){
        this.pointA = this.center.copy().update({radius: 80, radians:0})
        this.pointB = this.center.copy().update({radius: 80, radians:0})
        this.start = new Point(100, 300, 50, 20)
        this.end = new Point(100, 460, 50, -20)
        this.squishA = new Point(100,100, 10, 0)
        this.squishB = this.squishA.add(100, 50)
        this.rel = true
        this.dragging.addPoints(
                this.pointA,
                this.pointB,
                this.start,
                this.end,
                this.squishA,
                this.squishB,
                )
    }

    draw(ctx){
        this.clear(ctx)

        let p = this.pointA;
        p.pen.indicator(ctx)
        this.pointB.pen.indicator(ctx)
        let size = this.squishA.distance2D(this.squishB)
        let width = Math.abs(size.x)
            , height = Math.abs(size.y)
        let start = this.start
        let end = this.end

        start.pen.indicator(ctx)
        end.pen.indicator(ctx)

        this.squishA.pen.fill(ctx, '#990000')
        this.squishB.pen.fill(ctx, '#990000')


        let lines = twoPointBox(this.squishA, this.squishB)
        lines.forEach(l=>l.render(ctx))

        p.pen.ellipse(ctx, {
                    width, height
                    , start: this.pointB.radians + start.radians
                    , end: this.pointB.radians + end.radians
                    , relative: this.rel
                },
                'red')
    }
}


;stage = MainStage.go();