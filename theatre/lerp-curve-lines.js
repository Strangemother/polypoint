/*
files:
    ../point_src/math.js
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/point-content.js
    ../point_src/pointlist.js
    ../point_src/point.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/stage.js
    ../point_src/extras.js
    ../point_src/random.js
    ../point_src/distances.js
    ../point_src/functions/clamp.js
    ../point_src/dragging.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/curve-extras.js
---

*/
const findNearestPoint = function(bezierStack, p, divisor=100) {

    let minDist = Infinity;
    let closestPoint = null;

    let pointA = bezierStack.line.a
    let pointB = bezierStack.line.b
    let controlPointA = bezierStack.controlPoints.a
    let controlPointB = bezierStack.controlPoints.b

    // Sample points along the Bezier curve
    for (let i = 0; i <= divisor; i++) {
        let t = i / divisor;
        let oneMt = 1 - t;
        let omtp3 = Math.pow(oneMt, 3)
        let tpow3 = Math.pow(t, 3)
        let tpow2 = Math.pow(t, 2)
        let omtp2 = Math.pow(oneMt, 2)

        // Calculate the point on the cubic Bezier curve at parameter t
        let x = omtp3 * pointA.x + 3
                * omtp2 * t * controlPointA.x + 3
                * (oneMt) * tpow2 * controlPointB.x
                + tpow3 * pointB.x
                ;

        let y = omtp3 * pointA.y + 3
                * omtp2 * t * controlPointA.y + 3
                * (oneMt) * tpow2 * controlPointB.y
                + tpow3 * pointB.y
                ;

        let dx = p.x - x;
        let dy = p.y - y;
        let distSq = dx * dx + dy * dy;

        if (distSq < minDist) {
            minDist = distSq;
            closestPoint = { x: x, y: y };
        }
    }

    return closestPoint
}


class MainStage extends Stage {
    canvas='playspace'
    live = true
    mounted(){
                        // x, y, width, rotation
        this.pointA = new Point(150, 150, 100, 120)
        this.pointB = new Point(300, 400, 100) // default rotation == 0 (looking right)
        this.line = new BezierCurve(this.pointA, this.pointB)
        this.controlPointA = this.pointA.project()
        this.controlPointB = this.pointB.project()

        this.dragging.add(this.pointB, this.pointA,
                        this.controlPointA, this.controlPointB)

        this.controlPointA.onDragMove = this.updatePointsToControl.bind(this)
        this.controlPointB.onDragMove = this.updatePointsToControl.bind(this)

        this.lineStroke = new Stroke({
            color: 'green'
            , width: 2
            , dash: [7, 4]
        })

        this.indicator = new Point(344,344)
        this.events.wake()
    }

    onMousemove(ev) {
        let p = this.mouse.position;

        const stack ={
            line: this.line
            , controlPoints: {
                a: this.controlPointA
                , b: this.controlPointB
            }
        };

        const closestPoint = findNearestPoint(stack, p)

        this.indicator.set(closestPoint);
        // this.indicator.x = closestPoint.x; this.indicator.y = closestPoint.y;
    }

    updatePointsToControl(){
        this.pointA.lookAt(this.controlPointA)
        this.pointB.lookAt(this.controlPointB)
        this.pointA.radius = this.pointA.distanceTo(this.controlPointA)
        this.pointB.radius = this.pointB.distanceTo(this.controlPointB)
    }

    draw(ctx){
        this.clear(ctx)

        this.indicator?.pen.fill(ctx, '#ddd')

        // show the spare points
        this.pointB.pen.indicator(ctx)
        this.pointA.pen.indicator(ctx)


        // Nice bright control point for the bezier curve
        this.controlPointA.pen.fill(ctx, '#33DDAA')
        this.controlPointB.pen.fill(ctx, '#33DDAA')

        let lineStroke = this.lineStroke
        lineStroke.set(ctx)

        this.line.render(ctx)

        lineStroke.unset(ctx)

    }
}

;stage = MainStage.go();