/*
https://www.youtube.com/watch?v=m1zmWiboxzU
 */

function calculateEdgeToEdgeLine(pointA, pointB) {
    // Destructure points
    const { x: x1, y: y1, radius: r1 } = pointA;
    const { x: x2, y: y2, radius: r2 } = pointB;

    // Calculate the distance between the centers
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Normalize the direction
    const nx = dx / dist;
    const ny = dy / dist;

    // Calculate the edge points by moving along the direction vector scaled by the radius
    const pointAEdge = {
        x: x1 + nx * r1,
        y: y1 + ny * r1
    };
    const pointBEdge = {
        x: x2 - nx * r2,
        y: y2 - ny * r2
    };

    return { pointAEdge, pointBEdge };
}


function rawCalculateAdjustedRotatedTangentLines(pointA, pointB) {
    const { x: x1, y: y1, radius: r1 } = pointA;
    const { x: x2, y: y2, radius: r2 } = pointB;

    // Calculate distance between centers
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Normalize the direction vector
    const nx = dx / dist;
    const ny = dy / dist;

    // Calculate the angle between the points
    const angle = Math.atan2(dy, dx);

    const extra = 0// -Math.PI
    // Calculate the angle offset to adjust for size differences
    const angleOffset = (-Math.asin((r1 - r2) / dist) ) + extra || 0;

    // Rotate the direction vectors by +90 and -90 degrees (perpendicular) based on the relative angle
    const perpNx1 = Math.cos(angle + Math.PI / 2 + angleOffset);
    const perpNy1 = Math.sin(angle + Math.PI / 2 + angleOffset);

    const perpNx2 = Math.cos(angle - Math.PI / 2 - angleOffset);
    const perpNy2 = Math.sin(angle - Math.PI / 2 - angleOffset);

    // Calculate the tangent points for both sides of pointA (adjusted with angle)
    const lineA1 = {
        x: x1 + perpNx1 * r1,
        y: y1 + perpNy1 * r1
    };
    const lineA2 = {
        x: x1 + perpNx2 * r1,
        y: y1 + perpNy2 * r1
    };

    // Calculate the tangent points for both sides of pointB (adjusted with angle)
    const lineB1 = {
        x: x2 + perpNx1 * r2,
        y: y2 + perpNy1 * r2
    };
    const lineB2 = {
        x: x2 + perpNx2 * r2,
        y: y2 + perpNy2 * r2
    };

    // Return the two lines (top and bottom)
    return {
        a: [{ x: lineA1.x, y: lineA1.y }, { x: lineB1.x, y: lineB1.y }],
        b: [{ x: lineA2.x, y: lineA2.y }, { x: lineB2.x, y: lineB2.y }]
    };
}


const halfPi = Math.PI * .5;

function calculateAdjustedRotatedTangentLines(pointA, pointB) {
    const { x: x1, y: y1, radius: r1 } = pointA;
    const { x: x2, y: y2, radius: r2 } = pointB;

    // Calculate distance between centers
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // let d2  =pointA.distance(pointB)
    // Normalize the direction vector
    // //
    // const nx = dx / dist;
    // const ny = dy / dist;

    // Calculate the angle between the points
    const angle = Math.atan2(dy, dx);

    const extra = 0
    // Calculate the angle offset to adjust for size differences
    const angleOffset = -Math.asin((r1 - r2) / dist) || 0;

    let a = angle + halfPi + angleOffset + extra
    // Rotate the direction vectors by +90 and -90 degrees (perpendicular) based on the relative angle
    const perpNx1 = Math.cos(a);
    const perpNy1 = Math.sin(a);

    let am = angle - halfPi - angleOffset - extra
    const perpNx2 = Math.cos(am);
    const perpNy2 = Math.sin(am);

    // Calculate the tangent points for both sides of pointA (adjusted with angle)
    const lineA1 = {
        x: x1 + perpNx1 * r1,
        y: y1 + perpNy1 * r1
    };
    const lineA2 = {
        x: x1 + perpNx2 * r1,
        y: y1 + perpNy2 * r1
    };

    // Calculate the tangent points for both sides of pointB (adjusted with angle)
    const lineB1 = {
        x: x2 + perpNx1 * r2,
        y: y2 + perpNy1 * r2
    };
    const lineB2 = {
        x: x2 + perpNx2 * r2,
        y: y2 + perpNy2 * r2
    };

    // Return the two lines (top and bottom)
    return {
        a: [{ x: lineA1.x, y: lineA1.y }, { x: lineB1.x, y: lineB1.y }],
        b: [{ x: lineA2.x, y: lineA2.y }, { x: lineB2.x, y: lineB2.y }]
    };
}


class PointTangents {

    constructor(point) {
        this.parent = point
    }

    calculateTangentLines(pointA, pointB) {
        const { x: x1, y: y1, radius: r1 } = pointA;
        const { x: x2, y: y2, radius: r2 } = pointB;

        // Calculate distance between centers
        const dx = x2 - x1;
        const dy = y2 - y1;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Calculate the angle between the points
        const angle = Math.atan2(dy, dx);

        const extra = 0
        // Calculate the angle offset to adjust for size differences
        const angleOffset = -Math.asin((r1 - r2) / dist) || 0;

        let a = angle + halfPi + angleOffset + extra
        // Rotate the direction vectors by +90 and -90 degrees (perpendicular) based on the relative angle
        const perpNx1 = Math.cos(a);
        const perpNy1 = Math.sin(a);

        let am = angle - halfPi - angleOffset - extra
        const perpNx2 = Math.cos(am);
        const perpNy2 = Math.sin(am);

        // Calculate the tangent points for both sides of pointA (adjusted with angle)
        const lineA1 = {
            x: x1 + perpNx1 * r1,
            y: y1 + perpNy1 * r1
        };
        const lineA2 = {
            x: x1 + perpNx2 * r1,
            y: y1 + perpNy2 * r1
        };

        // Calculate the tangent points for both sides of pointB (adjusted with angle)
        const lineB1 = {
            x: x2 + perpNx1 * r2,
            y: y2 + perpNy1 * r2
        };
        const lineB2 = {
            x: x2 + perpNx2 * r2,
            y: y2 + perpNy2 * r2
        };

        // Return the two lines (top and bottom)
        return {
            a: [{ x: lineA1.x, y: lineA1.y }, { x: lineB1.x, y: lineB1.y }],
            b: [{ x: lineA2.x, y: lineA2.y }, { x: lineB2.x, y: lineB2.y }]
        };
    }

    points(other) {
        /* return two points on _this_ point for the _start_ of two tangent lines
            [a(top), b(top), a(bottom), b(bottom)]
        */
       let v = this.calculateTangentLines(this.parent, other)
       return v.a.concat(v.b)
    }

    outerLines(other){
        /* return lines _a_ and _b_, each being a direct tagent */
       let v = this.calculateTangentLines(this.parent, other)
       return v
    }

    crossLines(){
        /* return the inner tagents, point A (top), to point B (bottom), and
        the antethisis. similar to [ab(), ba()]*/
    }

    lineA(other) {
        /* return a line (two points) for the _top_ direct tagent. */
        let v = this.calculateTangentLines(this.parent, other)
        return v.a
    }

    lineB(other) {
        /* return a line (two points) for the _bottom_ direct tagent. */
        let v = this.calculateTangentLines(this.parent, other)
        return v.a
    }

    a(other) {
        /* return the top line tangent _start_ point */
        let v = this.calculateTangentLines(this.parent, other)
        return v.a[0]
    }

    b(other){
       /* return the bottom line _start_ point */
       let v = this.calculateTangentLines(this.parent, other)
        return v.b[0]
    }

    aa(other){
        /* return the _line_ of pointA (top), to pointB (top)
        Similar to `this.points(other)[0,2]` */
        let v = this.calculateTangentLines(this.parent, other)
        return v.a
    }

    bb(other){
        /* return the antipose parallel tangent to aa(), similar to
        `this.points(other)[1,4]`
        */
        let v = this.calculateTangentLines(this.parent, other)
        return v.b
    }

    ab() {
        /* return the tangent line _through_ the center, similar to points [0,3]
        However the tangent points are adjusted - rotated around the radius. */
    }

    ba() {
        /* return the tangent line point A (bottom), point B (top) */
    }
}


Polypoint.head.lazyProp('Point', {
    tangent() {
        let r = this._tangents
        if(r == undefined) {
            r = new PointTangents(this)
            this._tangents = r
        }
        return r
    }
})


class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'canvas'

    mounted(){
        this.rawPointConf = { circle: { color: 'orange', width: 1}}
        this.generate()
        this.doLines()
        // this.dragging.add(...this.randomPoints)
        this.dragging.addPoints(...this.points)//, ...this.la, ...this.lb)
        // this.dragging.onDragEnd = this.onDragEnd.bind(this)
        this.dragging.onDragMove = this.onDragMove.bind(this)
        this.dragging.onWheel = this.onWheel.bind(this)
    }

    generate(pointCount=3){
        /* Generate a list. In this random... */
        this.points = PointList.generate.radius(pointCount, 100, point(200,200))
        /* Customise the points, randomising the mass and rotation. */
        this.points.forEach(p => {
                // p.rotation = Math.random() * 360
                p.radius = Math.max(5, 20)
            })
    }

    doLines() {
        // let lines = calculateAdjustedRotatedTangentLines(...this.points)
        let a = this.points[0]
        let b = this.points[1]
        let c = this.points[2]

        this.lines = [
             this.asPointList(a.tangent.outerLines(b))
            , this.asPointList(b.tangent.outerLines(c))
            , this.asPointList(c.tangent.outerLines(a))
        ]

    }

    asPointList(tLines) {

        return [new PointList(
            new Point(tLines.a[0])
            , new Point(tLines.a[1])
        )
        , new PointList(
            new Point(tLines.b[0])
            , new Point(tLines.b[1])
        )]
    }

    onDragEnd(){
        this.doLines()
    }

    onDragMove(){
        this.doLines()
    }

    onWheel(ev, p) {
        this.doLines()
    }

    draw(ctx){
        this.clear(ctx)
        this.drawView(ctx)
        this.dragging.getPoint()?.pen.circle(ctx)
    }

    drawView(ctx){
        /* Draw a circle at the origin points */
        ctx.strokeStyle = '#555'
        ctx.lineWidth = 2
        this.points.pen.stroke(ctx)
        // this.others.pen.indicators(ctx, this.rawPointConf)

        for(let pointlistPair of this.lines) {
            ctx.strokeStyle = 'green'
            ctx.lineWidth = 2
            pointlistPair[1].pen.line(ctx)
            // pointlistPair[1].pen.indicators(ctx, this.rawPointConf)

            ctx.strokeStyle = '#880000'
            ctx.lineWidth = 2
            pointlistPair[0].pen.line(ctx)
            pointlistPair.forEach((pl)=>{
                // pl.pen.indicators(ctx, this.rawPointConf)
                pl.pen.fill(ctx, '#000')
            })
        }
    }

}

stage = MainStage.go()