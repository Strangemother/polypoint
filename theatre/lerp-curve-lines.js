
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

    xonMousemove(ev) {
        /* edit the indicator position to present the closest point*/
        this.indicator = this.mouse.position
    }

    onMousemove(ev) {
        let p = this.mouse.position;
        let minDist = Infinity;
        let closestPoint = null;

        // Sample points along the Bezier curve
        let steps = 100;
        for (let i = 0; i <= steps; i++) {
            let t = i / steps;
            let oneMt = 1 - t;
            let omtp3 = Math.pow(oneMt, 3)
            let tpow3 = Math.pow(t, 3)
            let tpow2 = Math.pow(t, 2)
            let omtp2 = Math.pow(oneMt, 2)

            // Calculate the point on the cubic Bezier curve at parameter t
            let x =
                omtp3 * this.pointA.x +
                3 * omtp2 * t * this.controlPointA.x +
                3 * (oneMt) * tpow2 * this.controlPointB.x +
                tpow3 * this.pointB.x;

            let y =
                omtp3 * this.pointA.y +
                3 * omtp2 * t * this.controlPointA.y +
                3 * (oneMt) * tpow2 * this.controlPointB.y +
                tpow3 * this.pointB.y;

            let dx = p.x - x;
            let dy = p.y - y;
            let distSq = dx * dx + dy * dy;

            if (distSq < minDist) {
                minDist = distSq;
                closestPoint = { x: x, y: y };
            }
        }

        // Update the indicator to the closest point on the curve
        this.indicator.x = closestPoint.x;
        this.indicator.y = closestPoint.y;
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