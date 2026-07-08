/*
title: Connected Line Chain
files:
    head
    point
    pointlist
    stage
    mouse
    dragging
    stroke
    ../point_src/catenary-curve.js
*/

/* moved to line/Line */
class Line {
    constructor(p1, p2, color='red', width=1){
        // new Line([90, 130], [200, 300], 420)
        this.create.apply(this, arguments)
    }

    create(p1, p2, color='red', width=1) {
        this.a = point(p1)
        this.b = point(p2)
        this.color = color
        this.width = width
    }

    render(ctx) {
        this.start(ctx)
        this.draw(ctx)
        this.close(ctx)
    }

    start(ctx) {
        ctx.beginPath();
        let a = this.a;
        ctx.moveTo(a[0], a[1])
    }

    draw(ctx, color=undefined) {
        ctx.strokeStyle = color == undefined? this.color: color
        ctx.lineWidth = this.width == undefined? 1: this.width
        this.perform(ctx)

        ctx.stroke()
    }


    perform(ctx) {
        let b = this.b;
        ctx.lineTo(b[0], b[1])
    }

    close(ctx) {
        ctx.closePath()
    }
}

/* moved to curvy-line */
class BezierCurve extends Line {

    // create(p1, p2, color='red', width=1) {
    // }

    getControlPoints() {
        let a = this.a
          , b = this.b
          ;
        let midDistance = a.distanceTo(b)*.5
        let offset = this.offset == undefined? 0: this.offset

        /*A bezier requires two control points */
        return [
              a.project(midDistance + offset)
            , b.project(midDistance + offset)
        ]

    }

    perform(ctx) {
        let b = this.b;
        let cps = this.getControlPoints()
        // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/bezierCurveTo
        let bp = b
        ctx.bezierCurveTo(cps[0].x, cps[0].y, cps[1].x, cps[1].y, bp.x, bp.y)
    }
}


class CantenaryCurve extends Line {

    create(a,b, length=undefined, color='red', width=1) {
        super.create(a,b,color,  width)
        this.length = length
    }

    getCurveLength(a, b) {
        let l = this.length
        if(l == undefined){
            return distance(a, b) * 1.5
        }
        return l
    }
    getControlPoints() {
        let a = this.a
            , b = this.b
            ;

        return getCatenaryCurve(a,b, this.getCurveLength(a,b))
    }

    perform(ctx) {

        const result = this.getControlPoints()


        ctx.moveTo(result.start[0], result.start[1])
        let curves = result.curves

        if(!curves) {
            let p = result.lines[0]
            ctx.lineTo(p[0], p[1])
            return
        }

        for (let i = 0; i < curves.length; i++) {
            let c = curves[i]
            ctx.quadraticCurveTo(
                c[0], // cpx
                c[1], // cpy
                c[2], // x
                c[3], // y
            )
        }
    }
}

const randomPoints = PointList.generate.random(4, 200)


// const UNSET = {}


// const quickStroke = function(ctx, color='green', lineWidth=UNSET) {
//     ctx.strokeStyle = color
//     if(lineWidth != UNSET) {
//         ctx.lineWidth = lineWidth
//     }
//     ctx.stroke()
// }


class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        let cumX = 0
            , cumOffset = 120
            , globalY = 100
            , offset = ()=> cumX+=cumOffset
            , c = this.compass
            ;

        this.points = new PointList(
            new Point({
                name: "a"
                , rotation: c.right
                , x: offset(), y: globalY
            })
            , new Point({
                name: "b"
                , rotation: c.left // RIGHT_DEG
                , x: offset(), y: globalY + 50
            })
        )

        this.points.setMany(20, 'radius');

        this.line = new Line([100, 200], [200, 200], 'green', 2)
        this.curvyLine = new BezierCurve(...this.points)
        this.cantenary = new CantenaryCurve(...this.points)
    }


    draw(ctx){
        this.clear(ctx)

        this.line.render(ctx)
        // this.drawPoints(ctx)
        // this.drawRandomLine(ctx)
        this.curvyLine.render(ctx)
        this.cantenary.render(ctx)
        /* Draw a line from the point, projected from the center (by 1)*/
        // let pLine = new Line(this.points[0].project(), this.points[1].project(), 'pink', 1)
        // pLine.draw(ctx)

        // this.drawCurvyLine(ctx)
    }

    drawCurvyLine(ctx) {
        let l = this.curvyLine
        l.render(ctx)
    }

    drawCurvyLineRaw(ctx) {
        let a = this.points[0]
        let b = this.points[1]
        let offset = this.offset == undefined? 0: this.offset


        let midDistance = a.distanceTo(b)*.5

        /*A bezier requires two control points */
        let ca = a.project(midDistance + offset)
        let cb = b.project(midDistance + offset)

        /* Draw the control points */
        // ca.pen.indicator(ctx, {color:'orange'})
        // cb.pen.indicator(ctx, {color:'orange'})

        /* Ensure to _begin_ (Pick up the pen, ending the last draws. */
        ctx.beginPath()
        /* Ensure we draw from the _Start_ position */
        let ap = a
        ctx.moveTo(ap.x, ap.y)

        // ctx.quadraticCurveTo(ca.x, ca.y, b.x, b.y)

        // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/bezierCurveTo
        let bp = b
        ctx.bezierCurveTo(ca.x, ca.y, cb.x, cb.y, bp.x, bp.y)

        quickStroke(ctx, 'pink', 2)

        ctx.stroke()
        ctx.closePath()
    }

    drawCurvyLineTip(ctx) {
        let a = this.points[0]
        let b = this.points[1]
        let offset = 20


        let midDistance = a.distanceTo(b)*.5

        /*A bezier requires two control points */
        let ca = a.project(midDistance + offset)
        let cb = b.project(midDistance + offset)

        /* Draw the control points */
        ca.pen.indicator(ctx, {color:'orange'})
        cb.pen.indicator(ctx, {color:'orange'})

        /* Ensure to _begin_ (Pick up the pen, ending the last draws. */
        ctx.beginPath()
        /* Ensure we draw from the _Start_ position */
        let ap = a.project()
        ctx.moveTo(ap.x, ap.y)

        // ctx.quadraticCurveTo(ca.x, ca.y, b.x, b.y)

        // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/bezierCurveTo
        let bp = b.project()
        ctx.bezierCurveTo(ca.x, ca.y, cb.x, cb.y, bp.x, bp.y)

        ctx.stroke()
        ctx.closePath()
    }

    /* Draw all the `this.points` as indicators.
    Currently this is two points.*/
    drawPoints(ctx) {

        for(let p in this.points) {
            let point = this.points[p]
            point.pen?.indicator(ctx, {color: 'green'})
        }

        this.points.draw.pointLine(ctx)
    }

    /* draw a randomly generated line path
    And draw a line from tip to tip */
    drawRandomLine(ctx){

        /* Draw the horizon line - a straight project from A to B*/
        ctx.beginPath();
        randomPoints.draw.horizonLine(ctx)
        quickStroke(ctx, 'red')

        /* Draw each point as a line to its next sibling.*/
        randomPoints.draw.pointLine(ctx)
        quickStroke(ctx, 'teal', 2)
    }

}

stage = MainStage.go(/*{ loop: true }*/)
