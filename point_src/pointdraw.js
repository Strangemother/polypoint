
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

    line(ctx, distance=this.point.radius) {
        /* draw a line from the current point position to the length of
        the given `distance`. */
    }

    hair(ctx, length) {
        /* draw a line in two antipose directions. Similar to two `line` call in
        opposite directions. */
    }

    crossHair(ctx, length, sqeeeze=0, rotation){
        /* Two hair() calls in a cross formation. With a squeeze factor, 0 for
        no change (cross) and 1 for full change (two lines drawn upon each other)
        */
    }

    lineTo(ctx, b) {
        let a = this.point;
        if(b != undefined) {
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
        }
    }

    box(ctx, size=this.point.radius, width, angle){
        /*
            A box is a rectangle on the outside of radius.
            If an angle is given, the box cannot be a _rect_ and returns an ngon(4).

        */
        if(angle != undefined) {
            /* produce a ngon in the same location.*/
            return this.ngon(ctx, 4, size * 1.4, true, width, angle)
        }

        let offset = {x: -size, y: -size}
        return this.rect(ctx, size*2, width, offset)
    }

    // rect(ctx, width=this.point.radius, height) {
    rect(ctx, width=this.point.radius, height, offset={x:0, y:0}) {
        // rect(x, y, width, height)
        if(height==undefined) {
            height = width
        }
        // let p = this.point
        // ctx.rect(p.x, p.y, width, height)
        let xy = this.point.xy
        ctx.rect(xy.x + offset.x, xy.y + offset.y, width, height)
    }

    roundRect(ctx, width=this.point.radius, height, radii=[10]) {
        /* Draw a standard `roundRect` using this point as the top left `{x,y}`
        The default _width_ and _height_ is the _radus_ of the point, drawing
        a round rect to the size of the point.

            // ctx.roundRect(400, 150, 120, 120, [0, 30, 50, 60]);
            // point.draw.roundRect(width, height, radii)
            let point = new Point(400, 150, 120)
            point.draw.roundRect(ctx)

        Expanded:

            point.draw.roundRect(ctx, point.radius, point.radius, [10, 30, 50, 60])

        */
        // rect(x, y, width, height)
        // ctx.roundRect(400, 150, -200, 100, [0, 30, 50, 60]);
        if(height==undefined) {
            height = width
        }
        let p = this.point
        ctx.roundRect(p.x, p.y, width, height, radii)
    }

    ngon(ctx, sides, radius, fromCenter=true, angle=0) {
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
        let points = getPolyDistributedPoints(sides, p, r, angle)
        let p0 = points[0]

        ctx.moveTo(p0.x, p0.y)

        for (let i = 1; i <= points.length - 1; i++) {
            let p = points[i]
            ctx.lineTo(p.x, p.y);
        }
        return points
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
