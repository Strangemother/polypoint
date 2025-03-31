
let denomText = 'nothing'


const checkLinesIntersection = function(line, otherLine, length) {
    const x1 = line[0].x;
    const y1 = line[0].y;


    // Normalize the direction vector (end - start) and apply the length
    const dx = line[1].x - x1;
    const dy = line[1].y - y1;
    const magnitude = Math.sqrt(dx * dy + dy * dy);

    let directionX = dx
    let directionY = dy

    if(length!== undefined) {
        directionX = (dx / magnitude) * length;
        directionY = (dy / magnitude) * length;
    }

    const x2 = line[0].x + directionX;
    const y2 = line[0].y + directionY;

    const x3 = otherLine[0].x;
    const y3 = otherLine[0].y;

    const x4 = otherLine[1].x;
    const y4 = otherLine[1].y;

    /* with two parallel lines, the denominator is zero */
    const denominator = getDenominator(x1, y1, x2, y2, x3, y3, x4, y4)
    denomText = denominator
    if (denominator === 0) return false; // Parallel lines

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denominator;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denominator;

    if (t > 0 && t < 1 && u > 0 && u < 1) {
        const intersectX = x1 + t * (x2 - x1);
        const intersectY = y1 + t * (y2 - y1);

        // Calculate the angle from the intersection point to the start of otherLine
        // const angleRad = Math.atan2(y3 - intersectY, x3 - intersectX);

        return {
                x: intersectX
                , y: intersectY
                // , radians: angleRad
            };

        // return { x: intersectX, y: intersectY };
    }

    return false;
}


const getDotProduct = function(px, py, x1, y1, x2, y2){
    return (px - x1) * (x2 - x1) + (py - y1) * (y2 - y1);
}


const getDenominator = function(x1, y1, x2, y2, x3, y3, x4, y4) {
     return (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
}


const checkPointIntersectionOccured = function(line, point, radius=5, length=400) {
    const x1 = line[0].x;
    const y1 = line[0].y;

    // Normalize the direction vector (end - start) and apply the length
    const dx = line.last().x - x1;
    const dy = line.last().y - y1;
    const magnitude = Math.sqrt(dx * dx + dy * dy);

    let directionX = (dx / magnitude) * length;
    let directionY = (dy / magnitude) * length;

    const x2 = line[0].x + directionX;
    const y2 = line[0].y + directionY;

    // The coordinates of the point to check
    const px = point.x;
    const py = point.y;

    // Calculate the distance from the point to the line
    const distance = Math.abs((x2 - x1) * (y1 - py) - (x1 - px) * (y2 - y1)) / Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));

    // Check if the point is within the radius
    if (distance <= radius) {
        // Check if the point is within the bounds of the segment
        const dotProduct = (px - x1) * (x2 - x1) + (py - y1) * (y2 - y1);
        if (dotProduct >= 0 && dotProduct <= (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)) {
            return true;
        }
    }
    return false;
}


const checkPointIntersectionWithin = function(line, point, radius=5, length=400) {
    const x1 = line[0].x;
    const y1 = line[0].y;

    // Normalize the direction vector (end - start) and apply the length
    const dx = line.last().x - x1;
    const dy = line.last().y - y1;
    const magnitude = Math.sqrt(dx * dx + dy * dy);

    let directionX = (dx / magnitude) * length;
    let directionY = (dy / magnitude) * length;

    const x2 = line[0].x + directionX;
    const y2 = line[0].y + directionY;

    // The coordinates of the point to check
    const px = point.x;
    const py = point.y;

    // Calculate the distance from the point to the line
    const distance = Math.abs((x2 - x1) * (y1 - py) - (x1 - px) * (y2 - y1)) / Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));

    // Check if the point is within the radius
    if (distance <= radius) {
        // Calculate the projection of the point onto the line (closest point on the line)
        const t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / ((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
        // Ensure the projection is within the line segment
        if (t >= 0 && t <= 1) {
            const intersectX = x1 + t * (x2 - x1);
            const intersectY = y1 + t * (y2 - y1);
            return { x: intersectX, y: intersectY };
        }
    }
    return false;
}


const checkPointIntersectionEdge = function(line, point, radius=point.radius, length=undefined) {
    const x1 = line[0].x;
    const y1 = line[0].y;

    // Normalize the direction vector (end - start) and apply the length
    const dx = line.last().x - x1;
    const dy = line.last().y - y1;


    const magnitude = Math.sqrt(dx * dx + dy * dy);

    let directionX = dx
    let directionY = dy

    if(length!== undefined) {
        directionX = (dx / magnitude) * length;
        directionY = (dy / magnitude) * length;
    }

    const x2 = line[0].x + directionX;
    const y2 = line[0].y + directionY;

    // The coordinates of the point (center of the circle)
    const cx = point.x;
    const cy = point.y;

    // Define the line as a vector from (x1, y1) to (x2, y2)
    const dxLine = x2 - x1;
    const dyLine = y2 - y1;

    // A, B, and C coefficients for the quadratic equation Ax^2 + Bx + C = 0
    const A = dxLine * dxLine + dyLine * dyLine;
    const B = 2 * (dxLine * (x1 - cx) + dyLine * (y1 - cy));
    const C = (x1 - cx) * (x1 - cx) + (y1 - cy) * (y1 - cy) - radius * radius;

    // Calculate the discriminant
    const discriminant = B * B - 4 * A * C;

    // If the discriminant is negative, the line does not intersect the circle
    if (discriminant < 0) {
        return false;
    }

    // Calculate the two points of intersection
    const t1 = (-B + Math.sqrt(discriminant)) / (2 * A);
    const t2 = (-B - Math.sqrt(discriminant)) / (2 * A);

    // Points of intersection
    const intersectX1 = x1 + t1 * dxLine;
    const intersectY1 = y1 + t1 * dyLine;
    const intersectX2 = x1 + t2 * dxLine;
    const intersectY2 = y1 + t2 * dyLine;

    // Ensure the intersection points are within the line segment
    if ((t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1)) {
        const intersectionPoints = [];

        if (t1 >= 0 && t1 <= 1) {
            intersectionPoints.push({ x: intersectX1, y: intersectY1 });
        }

        if (t2 >= 0 && t2 <= 1) {
            intersectionPoints.push({ x: intersectX2, y: intersectY2 });
        }

        return intersectionPoints;
    }

    return false;
}


function getCircleCircleIntersections(circle1, circle2) {
    const { x: x0, y: y0, radius: r0 } = circle1;
    const { x: x1, y: y1, radius: r1 } = circle2;

    // Calculate distance between centers
    const dx = x1 - x0;
    const dy = y1 - y0;
    const d = Math.hypot(dx, dy);

    // Check for solvability
    if (d > r0 + r1 || d < Math.abs(r0 - r1)) {
        // No solution. Circles do not intersect.
        return false;
    }

    // Check for coincident circles
    if (d === 0 && r0 === r1) {
        // Circles are coincident and there are infinite intersection points.
        // For practical purposes, we can return false or handle accordingly.
        return false;
    }

    // Calculate the point where the line through the circle intersection points crosses the line between the circle centers.
    const a = (r0 * r0 - r1 * r1 + d * d) / (2 * d);
    const h = Math.sqrt(r0 * r0 - a * a);

    // Calculate midpoint between the two centers
    const xm = x0 + (dx * a) / d;
    const ym = y0 + (dy * a) / d;

    // Calculate intersection points
    const rx = -dy * (h / d);
    const ry = dx * (h / d);

    const intersection1 = { x: xm + rx, y: ym + ry };
    const intersection2 = { x: xm - rx, y: ym - ry };

    // If h == 0 then there is only one intersection point (circles touch externally or internally)
    if (h === 0) {
        return [intersection1];
    }

    return [intersection1, intersection2];
}


class PointIntersections {

    constructor(point) {
        this.parent = point
        /* string stuff */
        this.gravity = {x:0, y:1}
        this.damping =.95
        this.dotDamping =.2
        this.forceMultiplier =.1
        this.forceValue =undefined
        this.distance = 100
    }

    of(other, settings) {
        let p = getCircleCircleIntersections(this.parent, other, settings)

        return PointList.from(p).cast()
    }
}

Polypoint.head.deferredProp('Point',
    function intersections() {
        return new PointIntersections(this)
    }
);
