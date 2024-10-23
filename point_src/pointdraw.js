
class PointDraw {
    // Draw functions for the Point.draw
    // methods.
    constructor(point) {
        this.point = point;
    }

    arc(ctx, radius=undefined, start=0, end=Math.PI2, direction=1) {
        let p = this.point;
        let r = radius === undefined? p.radius: radius;
        ctx.arc(p.x, p.y, r<0?0:r, start, end, direction)
    }

    circle(ctx, radius) {
        return this.arc(ctx, radius)
    }

    lineTo(ctx, b) {
        let a = this.point;
        if(b != undefined) {
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
        }
    }

    ngon(ctx, sides, radius, fromCenter=true) {
        /* Draw a polygon of _n_ sides, with an optional radius.

                polygonPoint.radius = 20
                polygonPoint.draw.ngon(ctx, 7)

         */

        /* Apply the position of the polypoint.*/
        let p = this.point;
        let r = radius === undefined? p.radius: radius;

        if(fromCenter) {
            p = p.add(-r)
        }

        // return polyGen(ctx, sides, p);
        let points = getPolyDistributedPoints(sides, p, r)
        let p0 = points[0]

        ctx.moveTo(p0.x, p0.y)

        for (i = 1; i <= points.length - 1; i++) {
            let p = points[i]
            ctx.lineTo(p.x, p.y);
        }

    }
}


Polypoint.head.install(PointDraw)

/* Point.draw... instance.
*/
Polypoint.head.lazyProp('Point', {
    draw() {
        let r = this._draw
        if(r == undefined) {
            r = new PointDraw(this)
            this._draw = r
        }
        return r
    }
})
