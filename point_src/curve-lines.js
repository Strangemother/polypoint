
/* requires line/Line

Replaced by curve-extrs/BezierCurve */
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
