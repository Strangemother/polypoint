/*
title: Curve Knife 2
categories: curve
    split
files:
    ../point_src/math.js
    head
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/point-content.js
    ../point_src/point.js
    ../point_src/pointlist.js
    mouse
    ../point_src/stage.js
    ../point_src/extras.js
    ../point_src/random.js
    dragging
    stroke
    ../point_src/curve-extras.js
    ../point_src/curve-knife.js
---

*/


class MainStage extends Stage {
    canvas = 'playspace'
    live = true
    mounted(){
        /* Our start and end points */
        this.pointA = new Point(150, 150, 100, 120)
        this.pointB = new Point(300, 400, 100) // default rotation == 0 (looking right)

        /* The primary line */
        this.line = new BezierCurve(this.pointA, this.pointB)

        this.dragging.add(this.pointB, this.pointA)

        /* Some styles for our lines. */
        this.lineStroke = new Stroke({
            color: 'green'
            , width: 2
            , dash: [7, 4]
        })

        this.lineStroke2 = new Stroke({
            color: 'red'
            , width: 2
            // , dash: [7, 4]
        })

        /* The small point along the line, denoting the knife point.*/
        this.indicator = new Point(344,344)
    }

    onMousemove(ev) {
        /* Action the mouse move, discovering the nearest point
        to the mouse along the line. */
        const closestPoint = this.line.nearestPoint(this.mouse.position)
        this.indicator.set(closestPoint);
    }

    onLongClick(stage, canvas, ev, delta) {
        this.dragging.callPointHandler('onLongClick', ev, this._near, delta)
        let cutPointT = this.indicator.t
        // console.log('Long Click', cutPointT)
        this._splitLines = this.line.splitAt(cutPointT)
    }

    draw(ctx){
        this.clear(ctx)

        this.indicator?.pen.fill(ctx, '#ddd')

        // show the spare points
        this.pointA.pen.indicator(ctx, {color:'#333'})
        this.pointB.pen.indicator(ctx, {color:'#333'})

        let lineStroke = this.lineStroke
        lineStroke.set(ctx)
        this.line.render(ctx)
        lineStroke.unset(ctx)
        this.drawKnifeLines(ctx)
    }

    drawKnifeLines(ctx){
        if(!this._splitLines) { return }
        let [lineA, lineB] = this._splitLines

        this.lineStroke2.set(ctx)

        this.drawSubLine(ctx, lineA)
        this.drawSubLine(ctx, lineB, 'red')

        this.lineStroke2.unset(ctx)

    }

    drawSubLine(ctx, stack, fillColor='orange') {
        stack.controls.forEach((p, i)=>{
            let pos = stack.line[i];
            let cpp = new Point(pos.x, pos.y)
            cpp.lookAt(p)
            cpp.radius = cpp.distanceTo(p)
            cpp.pen.line(ctx, p, '#999')
            p.pen.fill(ctx, {color: fillColor})
        })

        stack.line.render(ctx, fillColor)
    }

}

;stage = MainStage.go();