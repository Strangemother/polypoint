/*
title: Rainbow Arc Through Points
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/point-content.js
    ../point_src/pointlistpen.js
    ../point_src/pointlist.js
    ../point_src/point.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/distances.js
    ../point_src/bisector.js
    ../point_src/dragging.js
    ../point_src/functions/clamp.js
    ../point_src/stage.js
---
*/
const arcLoop = function(ctx, points) {

    /*
    From start point, project of radius towards the next.
    Then arcTo until exausted.
    */
    //
    let startPoint = points.first()
    let nextPoint = points[1]

    let midPoint = startPoint.lerp(nextPoint, .5)
    // let midPoint = startPoint.lerpPixel(nextPoint, startPoint.radius)

    /* For convenience we render it. */
    midPoint.pen.indicator(ctx, {color: 'grey'});
    ctx.strokeStyle = 'red'

    ctx.beginPath();
    // ctx.moveTo(startPoint.x, startPoint.y);

    let previousPoint = midPoint
    let pl = points.length;

    for (var i = 1; i < pl; i++) {
        let p = points[i]

        let toPoint = p;
        let r = previousPoint.radius
        ctx.arcTo(previousPoint.x, previousPoint.y, toPoint.x, toPoint.y, r);
        previousPoint = p
    }

    let last = points[pl-1]

    ctx.arcTo(previousPoint.x, previousPoint.y, startPoint.x, startPoint.y, previousPoint.radius);
    ctx.arcTo(startPoint.x, startPoint.y, midPoint.x, midPoint.y, startPoint.radius);
    // ctx.arcTo(midPoint.x, midPoint.y, nextPoint.x, nextPoint.y, startPoint.radius);
    ctx.lineTo(midPoint.x, midPoint.y, nextPoint.x, nextPoint.y, startPoint.radius);

}



class MainStage extends Stage {
    canvas='playspace'

    // live=false
    live = true
    mounted(){
        // this.point = new Point(50, 50)
        const r = 200
        const shareSize = 15

        // 45

        this.points = new PointList(
                // this.center.add(-r, 0)
                new Point({ x: 100, y: 300  })
                , new Point({ x: 300, y: 300 })
                , new Point({ x: 400, y: 500, radius: 20  })
                , new Point({ x: 450, y: 300, radius: 8  })
                , new Point({ x: 500, y: 500, radius: 10  })
                , new Point({ x: 550, y: 550, radius: 10  })
            )

        this.points[1].radius = 30
        this.points[0].radius = this.points[1].radius = shareSize
        // this.points[0].color = "hsl(299deg 62% 44%)"
        // this.points[1].color = "hsl(244deg 71% 56%)"

        this.near = this.center.copy()

        this.dis = new Dragging
        this.dis.initDragging(this)
        // this.dis.onDragMove = this.onDragMove.bind(this)
        // this.dis.onDragEnd = this.onDragEnd.bind(this)
        this.dis.addPoints(...this.points)

    }

    generateGrad() {
        this.grad = this.points.gradient.linear(this.ctx)
    }

    draw(ctx){
        this.clear(ctx)
        // ctx.strokeStyle = this.grad
        ctx.lineWidth = 4
        arcLoop(ctx, this.points)
        bisectAll(this.points)
        ctx.stroke();
        this.drawCircles(ctx)
        this.drawIris(ctx)
    }

    drawCircles(ctx) {
        this.points.pen.indicators(ctx)//, {color:'black'})
    }

    drawIris(ctx) {
        /* The dynamic highlighter. */
        let p = this.dis.getPoint();
        if(p) {
            p.pen.circle(ctx)
        }
    }

    onDragMove(ev) {
        // this.dis.applyXY(ev.x, ev.y)
    }
}


; stage = MainStage.go();