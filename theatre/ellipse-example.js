/*
title: Ellipse Drawing
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
        this.dragging.addPoints(this.pointA)
    }

    draw(ctx){
        this.clear(ctx)

        let p = this.pointA;
        p.pen.indicator(ctx)
        let width = p.radius * .5
            , height = p.radius
        p.pen.ellipse(ctx, {width, height, end: Math.PI}, 'red')
    }
}


;stage = MainStage.go();