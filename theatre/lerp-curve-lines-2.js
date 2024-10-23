
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
        this.startIndicatorT = this.indicatorT;
        this.startMousePos = this.indicator.copy();
                // The parameter 't' corresponding to the indicator's position on the curve
        this.indicatorT = 0.5; // Start in the middle of the curve

        // The point that will move along the curve
        this.indicator = new Point();

        // Update the indicator's position based on 'indicatorT'
        this.updateIndicatorPosition();
        this.events.wake()

    }


    xonMousemove(ev) {
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


    updateIndicatorPosition() {
        let t = this.indicatorT;

        // Calculate the point on the cubic Bezier curve at parameter t
        let x =
            Math.pow(1 - t, 3) * this.pointA.x +
            3 * Math.pow(1 - t, 2) * t * this.controlPointA.x +
            3 * (1 - t) * Math.pow(t, 2) * this.controlPointB.x +
            Math.pow(t, 3) * this.pointB.x;

        let y =
            Math.pow(1 - t, 3) * this.pointA.y +
            3 * Math.pow(1 - t, 2) * t * this.controlPointA.y +
            3 * (1 - t) * Math.pow(t, 2) * this.controlPointB.y +
            Math.pow(t, 3) * this.pointB.y;

        this.indicator.x = x;
        this.indicator.y = y;
    }

    onMousedown(ev) {
        // Record the initial mouse position and 't' value
        console.log('onMousedown')
        this.startMousePos = this.mouse.point.copy();
        this.startIndicatorT = this.indicatorT;
        this.isMouseDown = true
    }

    onMouseup(ev) {
        this.isMouseDown = false
    }

    onMousemove(ev) {

        if(!this.isMouseDown) {
            return
        }

            let mouseDelta = {
                x: this.mouse.point.x - this.startMousePos.x,
                y: this.mouse.point.y - this.startMousePos.y,
            };

            // Estimate the change in 't' based on the mouse movement along the curve's tangent
            let curveLength = this.getCurveLength();
            let deltaT = (mouseDelta.x + mouseDelta.y) / (curveLength * 0.5); // Adjust sensitivity as needed

            // Update 'indicatorT' and clamp it between 0 and 1
            this.indicatorT = this.startIndicatorT + deltaT;
            this.indicatorT = Math.max(0, Math.min(1, this.indicatorT));

            // Update the indicator's position on the curve
            this.updateIndicatorPosition();

    }

    // Optional: Function to approximate the length of the curve
    getCurveLength() {
        let length = 0;
        let prevPoint = this.pointA;
        let steps = 100;
        for (let i = 1; i <= steps; i++) {
            let t = i / steps;
            let x =
                Math.pow(1 - t, 3) * this.pointA.x +
                3 * Math.pow(1 - t, 2) * t * this.controlPointA.x +
                3 * (1 - t) * Math.pow(t, 2) * this.controlPointB.x +
                Math.pow(t, 3) * this.pointB.x;

            let y =
                Math.pow(1 - t, 3) * this.pointA.y +
                3 * Math.pow(1 - t, 2) * t * this.controlPointA.y +
                3 * (1 - t) * Math.pow(t, 2) * this.controlPointB.y +
                Math.pow(t, 3) * this.pointB.y;

            let dx = x - prevPoint.x;
            let dy = y - prevPoint.y;
            length += Math.sqrt(dx * dx + dy * dy);

            prevPoint = { x: x, y: y };
        }
        return length;
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