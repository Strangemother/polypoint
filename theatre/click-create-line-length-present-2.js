/*
---
title: Line Length
files:
    head
    point
    pointlist
    mouse
    stage
    stroke
    dragging
    ../point_src/random.js
    ../point_src/stage-clock.js
    ../point_src/easing.js
    ../point_src/functions/quantize.js
    ../point_src/iter/lerp.js
    ../point_src/text/beta.js
    ../point_src/arc.js


Click-hold to draw a line. Apply the length as a label orientated along the line.

---

*/
class MainStage extends Stage {
    canvas='playspace'
    // live=false
    mounted(){
        this.drawing = false;
        this.startPoint = undefined
        this.line = []
    }


    onMousedown(e){
        /*
            Grab Point
            Animate To size.
            Then the new background color,
        */
        this.drawing = true
        this.startPoint = Point.from(e).quantize(20)
    }

    onMouseup(ev) {
        this.drawing = false
        this.upPoint = Point.from(ev).quantize(20)
        this.line = [this.startPoint, this.upPoint]

    }

    switchOut() {
        console.log('doneHandler')
        let p = this.p
        this.v = undefined;
    }

    firstDraw(ctx) {
        ctx.fillStyle = '#ccc'
        ctx.font = 'normal 1em arial'
    }

    step(ctx){
        if(!this.drawing) {
            return
        }

        let a = this.startPoint.quantize(20)
        let b = this.mouse.point.quantize(20)
        a.pen.line(ctx, b)

    }

    draw(ctx){
        this.clear(ctx)
        this.step(ctx)

        if(this.line.length==2) {
            this.stageB(ctx)
        }

        return this.stageA(ctx)
    }

    stageA(ctx) {

        let a = this.startPoint
        let b = this.mouse.point.quantize(20)

        if(this.line.length > 0 && !this.drawing){
            a = this.line[0]
            b = this.line[1]
        }

        if(a) {
            a.pen.line(ctx, b, 'red')
            a.pen.fill(ctx)
            b.pen.fill(ctx)
            let dis = a.distanceTo(b).toFixed(2)
            let tp = a.midpoint(b)
            tp.lookAt(b)
            tp.text.label(ctx, dis, {y:-10, x: 0})
        }
    }

    stageB(ctx) {
        let a = this.startPoint
        let b = this.line[1]
        let mousePoint = this.mouse.point.quantize(20)
        a.pen.line(ctx, mousePoint, 'orange')
        mousePoint.pen.fill(ctx)
        let arcPlot = arcFromTo(a, b, mousePoint)
        arcPlot.point.radius = quantizeNumber(a.distanceTo(mousePoint) * .5, 2)
        penArcPlot(arcPlot, ctx, 'orange')
        /* Get the arc angle drawn */
        let deg = getArcPlotAngle(arcPlot)
        /* Write the degrees at the center. */
        arcPlot.point.text.string(ctx, ~~deg)
    }
}


;stage = MainStage.go();