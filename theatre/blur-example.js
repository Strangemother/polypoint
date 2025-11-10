/*
title: Canvas Blur Filter
files:
    head
    point
    stage
    dragging
    pointlist
    point
    mouse
    stroke
    ../point_src/text/beta.js
---

*/

class MainStage extends Stage {
    canvas = 'playspace'

    mounted(){
        // let p = new Point(400, 400, 140)

        this.point = new Point({x: 250, y: 150 , radius: 100})
        this.dragging.add(this.point)
    }

    firstDraw(ctx){
        this.clear(ctx)
        ctx.strokeStyle = ctx.fillStyle = '#ddd'
        ctx.font = '50px sans-serif'

        let p = this.dragging.getPoint();
        if(p) { p.pen.circle(ctx) }

        // ctx.filter = 'blur(4px)'
        this.point.text.string(ctx, 'text.string')

        // ctx.filter = newull
        ctx.fillStyle = 'red'
        this.point.pen.indicator(ctx)


    }

}


stage = MainStage.go();
