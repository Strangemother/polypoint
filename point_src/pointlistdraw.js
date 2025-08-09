
class PointListDraw {

    constructor(list) {
        this.list = list;
    }

    horizonLine(ctx) {
        // Ensure the path restarts, ensuring the colors don't _bleed_ (from
        // last to first).
        let a = this.list[0]
        let b = this.list.last()
        ctx.beginPath();
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
    }

    stroke(ctx) {
        // ctx.stroke()
        let args = arguments;
        this.list.forEach((p)=> p.draw.stroke.apply(p.draw, args))
    }

    circle(ctx, radius=undefined, color, width) {
        let args = arguments;
        this.list.forEach((p)=> p.draw.circle.apply(p.draw, args))
        // return this.stroke.apply(this, arguments)
    }

    /* Draw this list as a pointline, provide an init position for an offset. */
    pointLine(ctx, position, eachFunc) {
        // To 'close' the old drawing.
        let pointsArray = this.list
        let a = pointsArray[0]
        if(!a) { return }
        ctx.beginPath();
        ctx.moveTo(a.x, a.y)

        let {x, y} = position? position: {x:0, y:0}

        for(let i=1; i < pointsArray.length; i++) {
            let segment = pointsArray[i]
            ctx.lineTo(segment.x + x, segment.y + y);
        }

        // ctx.strokeStyle = 'white'
    }

    /* Draw a startline lineTo through all points. */
    line(ctx) {
        return this.pointLine(ctx)
    }

    quadCurve(ctx, loop=false, position){
        let pointsArray = this.list;
        let prevPoint = pointsArray[0];
        position = position? position: prevPoint
        let numPoints = pointArray.length;
        let p0 = pointsArray[numPoints - 1] || position;
        let _p2 = prevPoint;
        let strength = .5
        if(p0 ==  undefined) {return}
        ctx.beginPath();
        let min1 = prevPoint
        if(loop) {
            // ctx.moveTo(200, 200);
            min1 = pointsArray.last()
        }

        ctx.moveTo( (p0.x + min1.x) * strength, (p0.y + min1.y) * strength );
        // ctx.moveTo( (p0.x + prevPoint.x) * strength, (p0.y + prevPoint.y) * strength );
        for(let i = 1; i < pointsArray.length; i++) {

            let currPoint = pointsArray[i];
            var xc = (prevPoint.x + currPoint.x) * strength;
            var yc = (prevPoint.y + currPoint.y) * strength;
            ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, xc, yc);
            prevPoint = currPoint;
        }

        /* Draw to the last point. */
        var xc = (prevPoint.x + prevPoint.x) * strength;
        var yc = (prevPoint.y + prevPoint.y) * strength;

        if(loop) {
            xc = (prevPoint.x + _p2.x) * strength;
            yc = (prevPoint.y + _p2.y) * strength;
        }

        if(loop!=2){
            ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, xc, yc);
        }
    }

}


Polypoint.head.install(PointListDraw)
