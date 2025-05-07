/*
---
title: Arc Angle
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
 */

// aa = new Angle(20, 'tau')
// ab = new Angle(20).tau


class MainStage extends Stage {
    canvas='playspace'

    mounted(){
        this.centerPoint = new Point({x:200, y:200, radius: 100, color: '#666'})
        this.fromPoint = new Point({x:100, y:300})
        this.toPoint = new Point({x:350, y:150})
        this.dragging.addPoints(this.centerPoint
                                , this.fromPoint
                                , this.toPoint)

    }

    draw(ctx){
        this.clear(ctx)
        ctx.fillStyle = '#555'
        ctx.strokeStyle = 'orange'

        this.centerPoint.pen.indicator(ctx)
        // this.centerPoint.pen.line(ctx, undefined, 'red')
        this.fromPoint.pen.indicator(ctx, {color: 'red'})
        this.toPoint.pen.indicator(ctx)

        // this.drawA(ctx)
        this.drawB(ctx)
    }

    drawB(ctx){

        let arcPlot = arcSweep(this.centerPoint, Math.PI * .5)

        penArcPlot(arcPlot, ctx, 'red')
        /* Get the arc angle drawn */
        let rads = getArcPlotAngle(arcPlot)
        /* Write the degrees at the center. */
        arcPlot.point.text.string(ctx, ~~rads)

    }

}



;stage = MainStage.go();