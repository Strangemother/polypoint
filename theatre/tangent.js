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

function innerTangents(circle1, circle2) {
    const { x: x1, y: y1, radius: r1 } = circle1;
    const { x: x2, y: y2, radius: r2 } = circle2;

    // Calculate the distance between the centers of the two circles
    const dx = x2 - x1;
    const dy = y2 - y1;
    const d = Math.sqrt(dx * dy + dy * dy);

    if (d <= Math.abs(r2 - r1)) {
        // No inner tangent exists if one circle is completely inside the other
        return null;
    }

    // Angle of the line connecting the centers of the circles
    const angleBetweenCenters = Math.atan2(dy, dx);

    // Angle for the tangent
    const angleOffset = Math.asin((r2 - r1) / d);

    // Calculate the angles for the two tangent points
    const angle1 = angleBetweenCenters + angleOffset;
    const angle2 = angleBetweenCenters - angleOffset;

    // Tangent points on circle 1
    const t1x1 = x1 + r1 * Math.cos(angle1);
    const t1y1 = y1 + r1 * Math.sin(angle1);
    const t2x1 = x1 + r1 * Math.cos(angle2);
    const t2y1 = y1 + r1 * Math.sin(angle2);

    // Tangent points on circle 2
    const t1x2 = x2 + r2 * Math.cos(angle1);
    const t1y2 = y2 + r2 * Math.sin(angle1);
    const t2x2 = x2 + r2 * Math.cos(angle2);
    const t2y2 = y2 + r2 * Math.sin(angle2);

    return {
        circle1TangentPoints: [
            { x: t1x1, y: t1y1 },
            { x: t2x1, y: t2y1 },
        ],
        circle2TangentPoints: [
            { x: t1x2, y: t1y2 },
            { x: t2x2, y: t2y2 },
        ],
    };
}

// // Example usage:
// const circle1 = { x: 50, y: 50, radius: 30 };
// const circle2 = { x: 100, y: 100, radius: 50 };

// const tangents = innerTangents(circle1, circle2);
// console.log(tangents);


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

Polypoint.head.lazierProp('Point', function tangent(){ return new PointTangents(this)})

class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.rawPointConf = { circle: { color: 'orange', width: 1}}
        this.generate()
        this.doLines()
        this.doArc()
        // this.dragging.add(...this.randomPoints)
        this.dragging.addPoints(...this.randomPoints)//, ...this.la, ...this.lb)
        // this.dragging.onDragEnd = this.onDragEnd.bind(this)
        this.dragging.onDragMove = this.onDragMove.bind(this)
        this.dragging.onWheel = this.onWheel.bind(this)
    }

    generate(pointCount=2){
        /* Generate a list. In this random... */
        this.randomPoints = PointList.generate.radius(pointCount, 100, point(200,200))
        /* Customise the points, randomising the mass and rotation. */
        this.randomPoints.forEach(p => {
                p.rotation = Math.random() * 360
                p.radius = Math.max(5, 20)
            })

        // this.doEdges()
    }

    doArc() {
        let [a, b] = this.randomPoints;
        let lines = [this.la, this.lb]
        let left = [lines[0][0], lines[1][0]]
        let right = [lines[0][1], lines[1][1]]
        this.a = a
        this.b = b

        this.ra = new PointList(...left.concat([a]))
        this.rb = new PointList(...right.concat([b]))
    }

    doEdges() {

        const { pointAEdge, pointBEdge } = calculateEdgeToEdgeLine(...this.randomPoints);
        this.others = new PointList(
                new Point(pointAEdge)
                , new Point(pointBEdge)
            )

    }

    doLines() {
        let lines = calculateAdjustedRotatedTangentLines(...this.randomPoints)

        // let lines = calculateRotatedTangentLines(...this.randomPoints)
        // let lines = calculateAdjustedTangentLines(...this.randomPoints)
        // let lines = calculateTangentLines(...this.randomPoints)
        this.la = new PointList(
                new Point(lines.a[0])
                , new Point(lines.a[1])
            )
        this.lb = new PointList(
                new Point(lines.b[0])
                , new Point(lines.b[1])
            )
    }

    onDragEnd(){
        this.doEdges()
        this.doLines()

    }

    onDragMove(){
        this.doEdges()
        this.doLines()
        this.doArc()
    }

    onWheel(ev, p) {
        this.doEdges()
        this.doLines()
        this.doArc()
    }

    draw(ctx){
        this.clear(ctx)
        let p = this.dragging.getPoint();
        if(p) {
            p.pen.circle(ctx)
        }

        this.drawView(ctx)
    }

    drawView(ctx){

        /* Draw a circle at the origin points */
        this.randomPoints.pen.stroke(ctx, this.rawPointConf)

        // this.others.pen.indicators(ctx, this.rawPointConf)

        // this.la.pen.indicators(ctx, this.rawPointConf)
        ctx.strokeStyle = 'red'
        ctx.lineWidth = 3

        this.la.pen.line(ctx)

        // this.lb.pen.indicators(ctx, this.rawPointConf)
        this.lb.pen.line(ctx)
        let ra = this.ra
        // ra.pen.indicators(ctx, {color: 'green'})
        ctx.beginPath()
        // ctx.moveTo(ra[0].x, ra[0].y)
        // ctx.moveTo(100, 100)

        let a = ra[2]
        // inverted because it's the _other_ side.
        let pa = ra[0]
        let pb = ra[1]


        this.drawArc(ctx, a, pa, pb)
        // ctx.arc(a.x, a.y, a.radius, a.directionTo(pa), a.directionTo(pb))

        ctx.stroke()
        ctx.beginPath()
        ra = this.rb
        a = ra[2]
        pa = ra[1]
        pb = ra[0]
        // this.drawArc(ra)
        this.drawArc(ctx, a, pa, pb)
        // ctx.arc(a.x, a.y, a.radius, a.directionTo(pa), a.directionTo(pb))

        // ctx.arcTo(ra[0].x, ra[0].y, ra[1].x, ra[1].y, ra[2].radius)
        ctx.stroke()
        ctx.strokeStyle = 'green'
        ctx.lineWidth = 1
    }
    drawArcPath(ctx, pack) {
    }

    drawArc(ctx, a, pa, pb) {
        ctx.arc(a.x, a.y, a.radius, a.directionTo(pa), a.directionTo(pb))
    }
}

stage = MainStage.go()