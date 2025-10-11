/*
categories: arcs
    raw
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/point-content.js
    pointlist
    ../point_src/point.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/distances.js
    ../point_src/dragging.js
    ../point_src/functions/clamp.js
    ../point_src/functions/springs.js
    ../point_src/stage.js

*/

class MainStage extends Stage {
    canvas='playspace'

    mounted(){
        const r = 200
        this.points = new PointList(
            this.center.add(-r, 0)
            , this.center.add(0, r * -.5)
            , this.center.add(r, 0)
            , this.center.add(0, r)
        );

        this.points.each.radius = 20
        this.points.update({
            vx: .2, vy: .1
            , mass: 1
        })
        this.dragging.add(...this.points)
    }

    drawArcs(ctx) {
        this.arcLine(ctx)
        ctx.stroke();
    }

    arcLine(ctx, loop=false) {

        ctx.beginPath();

        let firstFunc = (e,i,a) => {
            ctx.moveTo(e.x, e.y);
            func = loopFunc
        }

        let loopFunc = (e,i,a) => {
            let e2 = a[i+1]
            ctx.arcTo(e.x, e.y, e2.x, e2.y, e.radius);
            if(i+1 == a.length-1) { func = endFunc }
        }

        let endFunc = (e,i,a) => {
            ctx.lineTo(e.x, e.y);
            func = loopFunc
        }

        let func = firstFunc;
        let first = this.points[0]

        this.points.forEach((e,i,a)=> func(e,i,a))
    }

    draw(ctx){
        this.clear(ctx)
        this.drawCircles(ctx)
        ctx.strokeStyle = 'green'
        ctx.lineWidth = 3

        this.drawArcs(ctx)
        this.drawIris(ctx)
    }

    drawCircles(ctx) {
        // let fillstyle = this.grad
        let fillstyle = "#333" // this.grad
            , lineWidth = 3
            ;

        this.points.pen.circle(ctx, undefined, fillstyle, lineWidth)
        this.points.spring.chain(150, 2, .3, new Set([this.points[0], this.points.last()]), .1)
        this.points[0].pen.fill(ctx, fillstyle)
    }

    drawIris(ctx) {
        /* The dynamic highlighter. */
        let p = this.dragging.getPoint();
        if(p) {
            p.pen.circle(ctx)
        }
    }
}

;stage = MainStage.go();