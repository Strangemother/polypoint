
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
        this.mirrorPointsMap = new Map;
   }

   step() {
        /* iterate all the reflectPoints, and update the mirror point positions.
        We avoid rewriting the points, so they're more persistent. */
        let line = this.points;
        for (var i = 0; i < this.reflectPoints.length; i++) {
            let p = this.reflectPoints[i];
            let res = this.reflect(p, line)
            let mirrorP = this.getMirrorIndex(i)
            mirrorP.update(res)
            // new Point(reflectPointOnSameSide(p, line))
        }
    }

    reflect(point, line=this.points) {
        return new Point(reflectPoint(point, line))
    }

    clean() {
        /* Remove any old references from the mirror map;
        1: Any undefined positions
        2: any point greater than the reflectpointsIndex
        */
        let m = this.mirrorPointsMap
        let l = this.reflectPoints.length;
        for(let k of m.keys()) {
            if(k > l) {
                // scrub
                m.delete(k)
                continue
            }

            if(m.get(k) == undefined) {
                m.delete(k)
            }
        }
    }

    getMirrorIndex(index) {
        let mirrorPoint = this.mirrorPointsMap.get(index);
        if(mirrorPoint == undefined) {
            mirrorPoint = new Point;
            this.mirrorPointsMap.set(index, mirrorPoint);
        }

        return mirrorPoint;
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
        this.mirrorPointsMap.forEach((p)=>{
            p.pen.indicator(ctx)
        })
    }

    add() {
        /* Synonmous to 'push', but this isn't an Array - so we avoid it

            Mirror.add(point, point)
        */
       this.reflectPoints.push.apply(this.reflectPoints, arguments)
    }
}

