/*
---
title: Semi Circle.
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

Draw a semi-circle to another point _through_ a third point.

*/

// aa = new Angle(20, 'tau')
// ab = new Angle(20).tau
const getSemiMidpoint = function(fromPoint, toPoint, centerPoint, radius=.5) {
    /* Return the center point x/y to ensure a perfect arc through the three points */
    const dx = toPoint.x - fromPoint.x
    const dy = toPoint.y - fromPoint.y
    const distance = Math.hypot(dx, dy)

    if(distance === 0) {
        return {
            x: fromPoint.x
            , y: fromPoint.y
        }
    }

    const midpointX = (fromPoint.x + toPoint.x) * .5
    const midpointY = (fromPoint.y + toPoint.y) * .5
    const _radius = distance * radius

    // Keep the point on the same side of the chord while forcing a 180-degree arc.
    const unitPerpX = -dy / distance
    const unitPerpY = dx / distance
    let direction = -1
    if(centerPoint) {
        const side = dx * (centerPoint.y - midpointY) - dy * (centerPoint.x - midpointX)
        direction = side < 0 ? -1 : 1
    }

    return {
        x: midpointX + (unitPerpX * _radius * direction)
        , y: midpointY + (unitPerpY * _radius * direction)
    }
}


class MainStage extends Stage {
    canvas='playspace'

    mounted(){
        this.centerPoint = new Point({x:200, y:150, radius: 20, color: '#666'})
        this.fromPoint = new Point({x:100, y:300})
        this.toPoint = new Point({x:350, y:150})
        this.dragging.addPoints(this.fromPoint, this.toPoint)
    }

    draw(ctx){
        this.clear(ctx)

        ctx.fillStyle = '#555'
        ctx.strokeStyle = 'orange'

        const newCenter = getSemiMidpoint(this.fromPoint, this.toPoint, this.centerPoint)
        this.centerPoint.update(newCenter)
        
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