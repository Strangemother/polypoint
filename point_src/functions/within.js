
function infPointwithinPolygon(point, polygon) {
    const x = point.x, y = point.y;
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].x
            , yi = polygon[i].y;
        const xj = polygon[j].x
            , yj = polygon[j].y;

        const intersect = ((yi > y) !== (yj > y)) &&
                          (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
}


function circleIntersectsPolygon(circle, polygon) {
    const x = circle.x, y = circle.y, r = circle.radius;

    // First, check if the center is inside the polygon
    let inside = withinPolygon(circle, polygon);
    if (inside) return true;

    // Next, check if the circle intersects any of the polygon's edges
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const p1 = polygon[i];
        const p2 = polygon[j];

        if (circleIntersectsLineSegment(circle, p1, p2)) {
            return true;
        }
    }

    // If neither is true, the circle does not intersect the polygon
    return false;
}

// Helper function to check if a circle intersects with a line segment
function circleIntersectsLineSegment(circle, p1, p2) {
    const { x: cx, y: cy, radius: r } = circle;
    const { x: x1, y: y1 } = p1;
    const { x: x2, y: y2 } = p2;

    // Calculate the projection of the circle center onto the line segment
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lengthSquared = dx * dx + dy * dy;

    let t = ((cx - x1) * dx + (cy - y1) * dy) / lengthSquared;
    t = Math.max(0, Math.min(1, t));

    // Find the closest point on the line segment to the circle center
    const closestX = x1 + t * dx;
    const closestY = y1 + t * dy;

    // Calculate the distance between the circle center and this closest point
    const distanceSquared = (cx - closestX) * (cx - closestX) + (cy - closestY) * (cy - closestY);

    // Circle intersects if this distance is less than or equal to the radius squared
    return distanceSquared <= r * r;
}



function withinPolygon(point, polygon) {
    const x = point.x
        , y = point.y;
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].x
            , yi = polygon[i].y;
        const xj = polygon[j].x
            , yj = polygon[j].y;

        const intersect = (
                    (yi > y) !== (yj > y)
                ) && (
                    x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
                );
        if (intersect) inside = !inside;
    }

    return inside;
}


class PointWithin {
    constructor(parent) {
        this.parent = parent
    }

    polygon(polygon) {
        return withinPolygon(this, polygon)
    }
}

Polypoint.head.deferredProp('Point', function within(){
    return new PointWithin(this)
})

