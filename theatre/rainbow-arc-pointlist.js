/*

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


const arcLine = function(ctx, points) {
    ctx.beginPath();
    // midPoint.pen.indicator(ctx)

    let startPoint = points[0]

    ctx.moveTo(startPoint.x, startPoint.y);

    let previousPoint = startPoint;
    let pl = points.length;

    // debugger;
    for (var i = 0; i < pl; i++) {
        let p = points[i]
        // if(previousPoint) {
            // if(i == pl-1) {
                // end point
                // ctx.lineTo(p.x, p.y);
            // } else {
                let toPoint = p;
                let r = previousPoint.radius
                ctx.arcTo(previousPoint.x, previousPoint.y, toPoint.x, toPoint.y, r);
            // }
        // }
        previousPoint = p
        // this.drawArc(ctx, midPoint, pointC, pointD)
    }
    let last = points[pl-1]
    ctx.lineTo(last.x, last.y);

    // ctx.stroke();
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
                new Point({ x: 100, y: 300, color: 'red'  })
                , new Point({ x: 300, y: 300, color: 'orange' })
                , new Point({ x: 400, y: 500, radius: 20, color: 'green'  })
                , new Point({ x: 450, y: 300, radius: 8, color: 'blue'  })
                , new Point({ x: 500, y: 500, radius: 10, color: 'indigo'  })
                , new Point({ x: 550, y: 550, radius: 10, color: 'violet'  })
            )

        this.points[1].radius = 30
        this.points[0].radius = this.points[1].radius = shareSize
        // this.points[0].color = "hsl(299deg 62% 44%)"
        // this.points[1].color = "hsl(244deg 71% 56%)"

        this.near = this.center.copy()

        // this.dis = new Distances
        // this.dis.addPoints(this.center, this.point0, this.point1)
        this.dis = new Dragging
        this.dis.initDragging(this)
        this.dis.onDragMove = this.onDragMove.bind(this)
        // this.dis.onDragEnd = this.onDragEnd.bind(this)
        this.dis.addPoints(...this.points)

        this.generateGrad()

    }

    generateGrad() {
        this.grad = this.points.gradient.linear(this.ctx)
    }

    draw(ctx){
        this.clear(ctx)
        this.drawCircles(ctx)
        ctx.strokeStyle = this.grad
        ctx.lineWidth = 4
        arcLine(ctx, this.points)
        bisectAll(this.points)
        ctx.stroke();
        this.drawIris(ctx)
    }

    drawCircles(ctx) {
        // this.points.pen.fill(ctx)
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
        this.generateGrad()
        // this.dis.applyXY(ev.x, ev.y)
    }
}


; stage = MainStage.go();