/*
title: Arc Point Line Alt
files:
    head
    point
    pointlist
    stage
    mouse
    dragging
    stroke
    ../point_src/catenary-curve.js
    ../point_src/bisector.js
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

        const pointA = new Point({ x: 100, y: 300 });
        const pointB = new Point({ x: 300, y: 300 });
        const pointC = new Point({ x: 400, y: 500, radius: 20 });
        const pointD = new Point({ x: 600, y: 300, radius: 10 });
        // 45

        this.points = new PointList(
                // this.center.add(-r, 0)
                pointA
                // , this.center.add(0, r * -.5)
                , pointB
                // , this.center.add(r, 0)
                , pointC
                , pointD
            )

        this.points[1].radius = 30
        this.points[0].radius = this.points[1].radius = shareSize
        this.points[0].color = "hsl(299deg 62% 44%)"
        this.points[1].color = "hsl(244deg 71% 56%)"

        this.near = this.center.copy()


        // this.dis = new Distances
        // this.dis.addPoints(this.center, this.point0, this.point1)
        this.dis = new Dragging
        this.dis.initDragging(this)
        this.dis.onDragMove = this.onDragMove.bind(this)
        // this.dis.onDragEnd = this.onDragEnd.bind(this)
        this.dis.addPoints(...this.points)

    }


    drawArc(ctx, startPoint, midPoint, endPoint, r=midPoint.radius) {
      // ctx.moveTo(startPoint.x, startPoint.y);
      ctx.arcTo(midPoint.x, midPoint.y, endPoint.x, endPoint.y, r);
      // ctx.lineTo(endPoint.x, endPoint.y);
    }

    draw(ctx){

        return this.drawTwo(ctx)
    }

    drawOne(ctx){
        this.clear(ctx)
        arcLine(ctx, this.points)
        ctx.stroke();
        this.drawCircles(ctx)
        this.drawIris(ctx)
    }

    drawTwo(ctx){
        this.clear(ctx)

        let pointA = this.points[0]
        let pointB = this.points[1]
        let midPoint = pointB
        let startPoint = pointA
        let pointC = this.points[2]
        let pointD = this.points[3]
        let endPoint = pointD
        // let radsA = this.points[0].lookAt(midPoint)
        // let radsB = this.points[2].lookAt(midPoint)

        pointB.radians = obtuseBisect(pointA, pointB, pointC)
        pointC.radians = obtuseBisect(pointB, pointC, pointD)
        pointB.rotation  += 180

        // pointB.bisect.of(pointA, pointC)

        // obtuseBisect(pointB, pointC, pointD)
        // let angle = calculateRotation1(pointA, pointB, pointC)
        // let angle = calculateRotation2(pointA, pointB, pointC)
        // pointB.rotation = radiansToDegrees(angle)
        // pointB.rotation = angle
        ctx.beginPath();
        // midPoint.pen.indicator(ctx)
        ctx.moveTo(startPoint.x, startPoint.y);
        this.drawArc(ctx, pointA, midPoint, pointC)
        this.drawArc(ctx, midPoint, pointC, pointD)
        ctx.lineTo(endPoint.x, endPoint.y);
        ctx.stroke();
        this.drawCircles(ctx)
        this.drawIris(ctx)
    }

    drawCircles(ctx) {
        let fillstyle = this.grad
            , lineWidth = 3
            ;

        // outer circle
        this.points.pen.indicators(ctx)
    }

    drawIris(ctx) {
        /* The dynamic highlighter. */
        let p = this.dis.getPoint();
        if(p) {
            p.pen.circle(ctx)
        }
    }

    onDragMove(ev) {
        this.dis.applyXY(ev.x, ev.y)
        // if(this.live) {
        //     this.regenerateGradient()
        // }
    }
}


;stage = MainStage.go();