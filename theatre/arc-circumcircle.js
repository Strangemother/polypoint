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
        this.centerPoint = new Point({x:200, y:150, radius: 20, color: '#666'})
        this.fromPoint = new Point({x:100, y:300})
        this.toPoint = new Point({x:350, y:150})
        this.dragging.addPoints(this.centerPoint, this.fromPoint, this.toPoint)
    }

    draw(ctx){
        this.clear(ctx)

        ctx.fillStyle = '#555'
        ctx.strokeStyle = 'orange'


        this.centerPoint.pen.indicator(ctx)
        // this.centerPoint.pen.line(ctx, undefined, 'red')
        this.fromPoint.pen.indicator(ctx, {color: 'red'})
        this.toPoint.pen.indicator(ctx)

        this.drawF(ctx)
    }

    drawF(ctx){

        let res = getArcCenter(this.fromPoint, this.toPoint, this.centerPoint)
        let c = Point.from(res)
        // c.pen.indicator(ctx)
        // penArcPlot(arcPlot, ctx, 'red')
        let arcPlot = arcFromTo(c, this.fromPoint, this.toPoint)

        penArcPlot(arcPlot, ctx, 'orange')

        let arcPlot2 = arcFromTo(c, this.fromPoint, this.toPoint, 1)
        penArcPlot(arcPlot2, ctx, 'purple')
        Point.from(res).update({radius: 4}).pen.fill(ctx)
        // drawArcPlot(arcPlot, ctx, 'orange')

    }
}

function getArcCenter(A, B, C) {
    /* the circumcircle,
    draw an arc that fits all three.
    */
  const D = 2 * (A.x * (B.y - C.y) +
                 B.x * (C.y - A.y) +
                 C.x * (A.y - B.y));

  if (D === 0) return null; // points are colinear; no circle

  const Ux = (
    ((A.x ** 2 + A.y ** 2) * (B.y - C.y) +
     (B.x ** 2 + B.y ** 2) * (C.y - A.y) +
     (C.x ** 2 + C.y ** 2) * (A.y - B.y)) / D
  );

  const Uy = (
    ((A.x ** 2 + A.y ** 2) * (C.x - B.x) +
     (B.x ** 2 + B.y ** 2) * (A.x - C.x) +
     (C.x ** 2 + C.y ** 2) * (B.x - A.x)) / D
  );

  return { x: Ux, y: Uy, radius: Math.hypot(A.x - Ux, A.y - Uy)};
}


;stage = MainStage.go();