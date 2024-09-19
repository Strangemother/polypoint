
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


function intersectionPoint(origin, line) {
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

    // Reflect the origin point but keep it on the same side
    const x_prime = x0 + (x_intersect - x0);
    const y_prime = y0 + (y_intersect - y0);

    // Calculate the reflected angle, ensuring it stays on the same side
    const incidentAngle = Math.atan2(y0 - y_intersect, x0 - x_intersect);
    const mirrorAngle = Math.atan2(y2 - y1, x2 - x1);
    const reflectedRadians = 2 * mirrorAngle - incidentAngle;

    return {
        x: x_prime,
        y: y_prime,
        radians: reflectedRadians,
        radius: origin.radius
    };
}



function reflectPointOnSameSide(origin, line) {
    const [p1, p2] = line;
    const x1 = p1.x, y1 = p1.y;
    const x2 = p2.x, y2 = p2.y;
    const x0 = origin.x, y0 = origin.y;

    // Step 1: Calculate the direction of the mirror line
    const dx = x2 - x1;
    const dy = y2 - y1;

    // Step 2: Normalize the direction vector
    const lineLength = Math.sqrt(dx * dx + dy * dy);
    const ux = dx / lineLength;
    const uy = dy / lineLength;

    // Step 3: Find the perpendicular projection of the point onto the mirror line
    const projection = ((x0 - x1) * ux + (y0 - y1) * uy);
    const x_proj = x1 + projection * ux;
    const y_proj = y1 + projection * uy;

    // Step 4: Calculate the reflected point
     x_reflect = x_proj + (x_proj - x0);
     y_reflect = y_proj + (y_proj - y0);

    // Step 5: Adjust the reflection to ensure it stays on the same side
    const originalToProjection = (x_proj - x0) * dx + (y_proj - y0) * dy;
    const reflectedToProjection = (x_reflect - x_proj) * dx + (y_reflect - y_proj) * dy;

    // if (originalToProjection * reflectedToProjection < 0) {
        // If the reflected point is on the opposite side, correct it
        x_reflect = x_proj - (x_proj - x0);
        y_reflect = y_proj - (y_proj - y0);
    // }

    // Step 6: Calculate the angle of incidence and reflection
    const incidentAngle = Math.atan2(y0 - y_proj, x0 - x_proj);
    const mirrorAngle = Math.atan2(dy, dx);
    const reflectedRadians = 2 * mirrorAngle - incidentAngle;

    return {
        x: x_reflect,
        y: y_reflect,
        radians: reflectedRadians,
        radius: origin.radius
    };
}


class Mirror {
    /* Accept two points as the primary line,
    _add_ many points to 'reflect'
    _collect_ the reflected points
    _ and a free draw function _
    */

   renderLine = true
   renderPoints = true
   renderReflections = true

   constructor(points=undefined) {
        this.points = points == undefined? new PointList: points;
        this.reflectPoints = new PointList
   }

   draw(ctx) {
        this.renderLine && this.drawLine(ctx)
        this.renderPoints && this.drawPoints(ctx)
        this.renderReflections && this.drawReflections(ctx)
   }

   drawLine(ctx) {
        this.points.pen.line(ctx, )
    }

    drawPoints(ctx) {
        ctx.setLineDash([3, 3])
        this.points.pen.stroke(ctx)
        ctx.setLineDash([])
   }

    drawReflections(ctx) {
        //
    }

    add() {
        /* Synonmous to 'push', but this isn't an Array - so we avoid it

            Mirror.add(point, point)
        */

       this.reflectPoints.push.apply(this.reflectPoints, arguments)
    }
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
    }

    updateReflect() {
        this.reflect = new Point(reflectPoint(this.origin, this.points))
        this.reflect2 = new Point(reflectPointOnSameSide(this.origin, this.points))

    }

    draw(ctx){
        this.clear(ctx)

        this.drawCircles(ctx)
        this.drawIris(ctx)
    }

    drawCircles(ctx) {
        ctx.setLineDash([3, 3])
        this.points.pen.stroke(ctx)
        ctx.setLineDash([])
        this.origin.pen.indicator(ctx, {color:'green'})
        this.other.pen.indicator(ctx, {color:'#555'})
        this.reflect2.pen.indicator(ctx, {color: '#880000'})
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