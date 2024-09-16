

/* Discover the intersection of two straight _lines_, the returned point
will be the intersection of those lines.

A line is a list of two points [{x:10, y:10}, {x:50, y:50}]

        lineA = new PointList(
                new Point({x:406, y:76, radius: 20})
                , new Point({x:145, y:397, radius: 20})
            )

        lineB = new PointList(
                new Point({x:206, y:176, radius: 20})
                , new Point({x:245, y:297, radius: 20})
            )

        checkLinesIntersection(lineA, lineB)

We can project (at a length) from line a _through_ line b, essentially as a
ray beam for a defined distance.

    checkLinesIntersection(lineA, lineB, 400)

When ray projecting, the _lineB_ is essentially a _direction_ rather than just
a collision.
*/

let denomText = 'nothing'


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



const checkPointIntersectionWithin = function(line, point, radius=5, length=undefined) {
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


const checkPointIntersectionEdge = function(line, point, radius = 5, length=undefined) {
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



class MainStage extends Stage {
    canvas='playspace'

    mounted(){
        this.line = new PointList(
                new Point({x:406, y:76, radius: 20})
                , new Point({x:145, y:397, radius: 20})
            )

        this.other = new Point({x:200,y:200, radius: 140})
        this.dragging.addPoints(...this.line, this.other)
    }

    draw(ctx){
        this.clear(ctx)

        this.line.pen.line(ctx)
        this.other.pen.indicator(ctx)

        this.dragging.drawIris(ctx)

        let i2 = checkPointIntersectionWithin(this.line, this.other, this.other.radius)
        if(i2) {

            let iPoint = (new Point).copy(i2).update({radius: 20})
            // iPoint.radius = 30
            iPoint.pen.indicator(ctx)
        }

        i2 = checkPointIntersectionEdge(this.line, this.other, this.other.radius)
        if(i2.length > 0) {

            i2.forEach((xy)=>{
                let iPoint = (new Point).copy(xy).update({radius: 5})
                // iPoint.radius = 30
                iPoint.pen.fill(ctx, '#CC00BB')
            })
        }

    }
}


;stage = MainStage.go();