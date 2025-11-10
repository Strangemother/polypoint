/*
title: Three Point Tangent Arc
categories: arcs
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/point-content.js
    ../point_src/pointlist.js
    ../point_src/point.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/distances.js
    ../point_src/dragging.js
    ../point_src/stage.js

*/

class MainStage extends Stage {
    canvas='playspace'

    // live=false
    live = true
    mounted(){
        // this.point = new Point(50, 50)
        const r = 200
        const shareSize = 15
        this.center.radius = r
        this.point0 = this.center.add(-r, 0)
        this.midPoint = this.center.add(0, r * -.5)
        this.midPoint.radius = 20

        this.point1 = this.center.add(r, 0)

        this.point0.radius = this.point1.radius = shareSize
        this.point0.color = "hsl(299deg 62% 44%)"
        this.point1.color = "hsl(244deg 71% 56%)"

        this.near = this.center.copy()
        this.regenerateGradient()

        // this.dis = new Distances
        // this.dis.addPoints(this.center, this.point0, this.point1)
        this.dis = new Dragging
        this.dis.initDragging(this)
        this.dis.onDragMove = this.onDragMove.bind(this)
        this.dis.onDragEnd = this.onDragEnd.bind(this)
        this.dis.addPoints(this.point0, this.midPoint, this.point1)

    }

    regenerateGradient() {
        this.grad = this.generateGrad(this.ctx, this.point0, this.point1)
    }

    draw(ctx){
        this.clear(ctx)

        this.drawLine(ctx)
        this.drawIris(ctx)
        this.drawCircles(ctx)
    }

    drawLine(ctx){
        this.clear(ctx)
        let fillstyle = this.grad
            , lineWidth = 3
            ;

        // this.center.pen.fill(ctx, this.grad)
        // this.center.pen.indicator(ctx, {color: '#fff', width: 1})
        // this.point0.pen.line(ctx, this.point1, '#ffffff22', 2)

        /* Each point color*/
        this.point0.pen.fill(ctx, '#111')
        this.point1.pen.fill(ctx, '#111')


        /* line to point (twice) */
        this.point0.pen.line(ctx, this.midPoint, fillstyle, lineWidth)
        this.midPoint.pen.line(ctx, this.point1, fillstyle, lineWidth)
    }

    drawCircles(ctx) {
        // let fillstyle = this.grad
        let fillstyle = "#333" // this.grad
            , lineWidth = 3
            ;

        // outer circle
        this.midPoint.pen.circle(ctx, undefined, fillstyle, lineWidth)


        this.point0.pen.circle(ctx, undefined, fillstyle, lineWidth)
        this.point1.pen.circle(ctx, undefined, fillstyle, lineWidth)

        this.drawIris(ctx)

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
        if(this.live) {
            this.regenerateGradient()
        }
    }

    onDragEnd(ev) {
        this.regenerateGradient()
    }

    generateGrad(ctx, a, b) {
        let gradient = ctx.createLinearGradient(a.x, a.y, b.x, b.y)
        // gradient.addColorStop(0,"#000000");
        gradient.addColorStop(0, a.color);
        // gradient.addColorStop(1,"red");
        gradient.addColorStop(1, b.color);
        return gradient
    }
}

;MainStage.go();