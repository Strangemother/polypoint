/*
---
title: Arc Three Point.
categories:
    arc
    angles
files:
    head
    stroke
    ../point_src/point-content.js
    pointlist
    point
    ../point_src/protractor.js
    mouse
    dragging
    ../point_src/functions/clamp.js
    stage
    ../point_src/angle.js
    ../point_src/text/label.js
    ../point_src/arc.js
    ../point_src/protractor.js
---

Draw an arc to another point _through_ a third point.

*/

// aa = new Angle(20, 'tau')
// ab = new Angle(20).tau


class MainStage extends Stage {
    canvas='playspace'

    mounted(){
        this.centerPoint = new Point({x:200, y:150, radius: 20, color: '#666'})
        this.fromPoint = new Point({x:100, y:300})
        this.toPoint = new Point({x:350, y:150})
        this.dragging.addPoints(this.centerPoint, this.fromPoint, this.toPoint)
    }

    draw(ctx){
        this.clear(ctx)

        ctx.fillStyle = '#555'
        ctx.strokeStyle = 'orange'

        this.centerPoint.pen.circle(ctx, undefined, '#555')
        // this.centerPoint.pen.line(ctx, undefined, 'red')
        this.fromPoint.pen.indicator(ctx, {color: 'red'})
        this.toPoint.pen.indicator(ctx)

        this.drawF(ctx)
    }

    drawF(ctx){

        let cap = this.toPoint.arc.to(this.fromPoint, this.centerPoint)

        ctx.beginPath();
        ctx.arc(cap.cx, cap.cy, cap.radius, cap.startRadians, cap.toRadians);
        ctx.stroke();

        ctx.fillStyle = '#ddd'
        this.centerPoint.text.string(ctx, ~~cap.radius)
    }
}


;stage = MainStage.go();