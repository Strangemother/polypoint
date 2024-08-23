
function reflectPoint(origin, line) {
    const [p1, p2] = line;
    const x1 = p1.x, y1 = p1.y;
    const x2 = p2.x, y2 = p2.y;
    const x0 = origin.x, y0 = origin.y;

    // Calculate slope (m) and y-intercept (c) of the mirror line
    const m = (y2 - y1) / (x2 - x1);
    const c = y1 - m * x1;

    // Perpendicular slope (negative reciprocal)
    const m_p = -1 / m;

    // Equation of the perpendicular line through the origin point
    const c_p = y0 - m_p * x0;

    // Solve the intersection of the mirror line and the perpendicular line
    const x_intersect = (c_p - c) / (m - m_p);
    const y_intersect = m * x_intersect + c;

    // Reflect the origin point
    const x_prime = 2 * x_intersect - x0;
    const y_prime = 2 * y_intersect - y0;

    // Calculate the reflected angle
    const reflectedRadians = Math.atan2(y2 - y1, x2 - x1) * 2 - origin.radians;

    return { x: x_prime
            , y: y_prime
            , radians: reflectedRadians
            , radius: origin.radius
        };
}

class MainStage extends Stage {
    canvas='playspace'

    // live=false
    live = true
    mounted(){
        this.generatePlanetList()
        this.dis = new Dragging
        this.dis.initDragging(this)
        this.dis.addPoints(...this.points, this.origin, this.other)
        // this.dis.onDragEnd = this.onDragEnd.bind(this)
        this.dis.onDragMove = this.onDragMove.bind(this)
    }

    onDragMove(e,i) {
    // onDragEnd(e,i) {
        this.updateReflect()
    }

    generatePlanetList(){
        // origin = {x: 156, y: 135}
        // line = [{x:406, y:76}, {x:145, y:397}]
        let _a = new Point({x:406, y:76, radius: 20})
        let _b = new Point({x:145, y:397, radius: 20})
        this.origin = new Point({x: 156, y: 135, radius: 20})
        this.other = new Point({x: 150, y:150, radius: 20})
        this.points = new PointList(_a,_b)
        this.updateReflect()
        this.cantenary = new CantenaryCurve(this.origin, this.reflect, 500)
        this.cantenary.restLength = 430
    }
    updateReflect() {
        this.reflect = new Point(reflectPoint(this.origin, this.points))
        this.cantenary && (this.cantenary.b = this.reflect)
    }

    draw(ctx){

        this.clear(ctx)

        this.cantenary.update(ctx, this.clock.tick)
        this.cantenary.updateSwing(ctx, this.clock.tick)
        this.cantenary.render(ctx)
        this.drawCircles(ctx)
        this.drawIris(ctx)
    }

    drawCircles(ctx) {
        ctx.setLineDash([3, 3])
        this.points.pen.stroke(ctx)
        ctx.setLineDash([])
        this.origin.pen.indicator(ctx, {color:'green'})
        this.other.pen.indicator(ctx, {color:'#555'})
        this.reflect.pen.indicator(ctx, {color: '#AAA'})
        this.points.pen.line(ctx, )

    }

    drawIris(ctx) {
        /* The dynamic highlighter. */
        let p = this.dis.getPoint();
        if(p) {
            p.pen.circle(ctx)
        }
    }

}


;stage = MainStage.go();