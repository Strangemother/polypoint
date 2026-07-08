/*
title: Arc Pointlist Another Alt
*/
const arcLoop = function(ctx, points) {

    /*
    From start point, project of radius towards the next.
    Then arcTo until exausted.
    */
    //
    let pl = points.length;
    let startPoint = points.first()
    let nextPoint = points[1]

    let last = points[pl-1]

    // ctx.arc(last.x, last.y, last.radius, 0, 1);
    startPoint.turnTo(last)
    // startPoint.rotation = 90
    let start = startPoint.project()

    ctx.strokeStyle = 'red'

    ctx.beginPath();
    // ctx.moveTo(startPoint.x, startPoint.y);

    let previousPoint = start

    for (var i = 0; i < pl; i++) {
        let p = points[i]
        let nextPoint = points[i+1]
        if(nextPoint == undefined) {
            nextPoint = points[0]
        }

        let toPoint = p;
        let r = p.radius
        // p.rotation -= 90
        // toPoint = p.project()
        // ctx.moveTo(toPoint.x, toPoint.y);
        // p.rotation += 180
        // toPoint = p.project()
        // ctx.arcTo(previousPoint.x, previousPoint.y, toPoint.x, toPoint.y, r);
        p.turnTo(previousPoint)
        p.rotation += 90
        let v1 = p.radians
        // let v1 = p.lookAt(previousPoint)
        p.lookAt(nextPoint)
        p.rotation -= 90
        let v2 = p.radians

        /* Draw an arc ay position {x y}, at a radius, from angle A to B.
        e.g. Spin like a clock-hand from 10 to 3 */
        ctx.arc(toPoint.x, toPoint.y, r, v1, v2);
        previousPoint = p
    }


    startPoint.turnTo(last)
    startPoint.rotation += 90
    start = startPoint.project()

    ctx.lineTo(start.x, start.y);
    // ctx.arcTo(startPoint.x, startPoint.y, midPoint.x, midPoint.y, startPoint.radius);
    // ctx.arcTo(midPoint.x, midPoint.y, nextPoint.x, nextPoint.y, startPoint.radius);

}


/*
Test is the midPoint creates an concave angle relative to the two given points.
 */
const isConcave = function(previousPoint, p, nextPoint) {
    return calculateAngle(p, nextPoint) > 180
    // return obtuseBisect(previousPoint, p, nextPoint) > -1
}

const lineLoop = function(ctx, points) {

    /*
    From start point, project of radius towards the next.
    Then arcTo until exausted.
    */
    //
    let pl = points.length;
    let startPoint = points.first()
    let nextPoint = points[1]

    let last = points[pl-1]

    // ctx.arc(last.x, last.y, last.radius, 0, 1);
    startPoint.lookAt(last)
    // startPoint.rotation = 90
    let start = startPoint.project()

    ctx.strokeStyle = 'red'

    ctx.beginPath();
    // ctx.moveTo(startPoint.x, startPoint.y);

    let previousPoint = points.last()

    for (var i = 0; i < pl; i++) {
        let p = points[i]
        let nextPoint = points[i+1]
        if(nextPoint == undefined) {
            nextPoint = points[0]
        }

        let toPoint = p;

        p.lookAt(previousPoint)
        p.rotation += 90
        let a = p.project()

        p.lookAt(nextPoint)
        p.rotation -= 90
        let b = p.project()

        let isConcave = p.rotation - previousPoint.rotation > 0
        // const _isConcave = val// calculateAngleWithRef(a, p, nextPoint)

        if(isConcave) {
            ctx.lineTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
        } else {
            ctx.lineTo(b.x, b.y)
            ctx.lineTo(a.x, a.y)
        }

        p.isConcave = isConcave
        previousPoint = p
    }


    // startPoint.lookAt(last)
    // startPoint.rotation += 90
    start = startPoint.project()
    let isConcave = startPoint.rotation - points[0].rotation > 0
    startPoint.isConcave = isConcave

    ctx.lineTo(start.x, start.y);
    // ctx.arcTo(startPoint.x, startPoint.y, midPoint.x, midPoint.y, startPoint.radius);
    // ctx.arcTo(midPoint.x, midPoint.y, nextPoint.x, nextPoint.y, startPoint.radius);
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


    draw(ctx){
        this.clear(ctx)
        // ctx.strokeStyle = this.grad
        bisectAll(this.points)
        this.drawCircles(ctx)
        this.points[0].pen.indicator(ctx, {color:'#DDAA55'})
        this.points.last().pen.indicator(ctx, {color:'#DD0000'})

        lineLoop(ctx, this.points)
        // arcLoop(ctx, this.points)
        ctx.lineWidth = 2
        ctx.stroke();
        this.drawIris(ctx)
    }

    drawCircles(ctx) {
        this.points.pen.indicators(ctx, {color:'#333'})//, {color:'black'})
        this.points.forEach((p)=>{
            if(p.isConcave == true){
                p.pen.indicator(ctx, {color: 'green'})
            }
        })
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