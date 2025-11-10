/*
---
title: Line Length Display on Click
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
        this.startPoint && this.startPoint.pen.fill(ctx)

        let a = this.startPoint
        let b = this.mouse.point.quantize(20)


        if(this.line.length > 0 && !this.drawing){
            a = this.line[0]
            b = this.line[1]
        }

        if(a) {
            a.pen.line(ctx, b)
            let dis = a.distanceTo(b).toFixed(2)
            let tp = a.midpoint(b)
            tp.lookAt(b)
            tp.text.label(ctx, dis, {y:-10, x: 0})
        }

    }
}


;stage = MainStage.go();