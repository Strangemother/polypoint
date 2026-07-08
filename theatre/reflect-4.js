/*
title: Point Reflection V3
categories: reflections
files:
    head
    stage
    ../point_src/point-content.js
    ../point_src/intersections.js
    stroke
    point
    pointlist
    mouse
    dragging
*/


class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){

        // ray beam
        this.ray = new PointList(
            new Point(250, 150, 10)
            , new Point(400, 320, 10)
        )

        // A Line representing the plane in 2d (front view)
        this.plane = new PointList(
            new Point(200, 300, 10)
            , new Point(500, 300, 10)
        )

        this.dragging.add(...this.ray, ...this.plane)
    }

    draw(ctx){
        this.clear(ctx)

        let ray = this.ray;
        let line = this.plane;

        ray.pen.fill(ctx, 'purple', 8)

        // Draw the plane mirror line
        line.pen.line(ctx, {color:'#AAA', width: 3})

        let planeLen = line[0].distanceTo(line[1])
        let hitPoint = checkIntersection(line, ray, planeLen)

        let p1 = this.center
        if(!hitPoint) {

            p1.copy().update({
                radius: 10
                , radians: getBounceAngle(ray[1], line)
            }).pen.indicator(ctx, {color: 'red'})

            return
        }

        const reflectPoint = new Point(hitPoint)
        reflectPoint.update({
            radius: 20
            , radians: getBounceAngle(reflectPoint, line)
        })

        let overLen = reflectPoint.distanceTo(ray[1])
        reflectPoint.project(overLen).pen.indicator(ctx, {color: 'gray'})
        ray[0].pen.line(ctx, hitPoint , 'red', 2)
        reflectPoint.pen.line(ctx, null, 'red', 2)
    }
}



const checkIntersection = function(planeLine, raybeam, length) {
    const x1 = planeLine[0].x;
    const y1 = planeLine[0].y;

    if(length == undefined) {
        length = distance(planeLine[0], planeLine[1])
    }

    // Normalize the direction vector (end - start) and apply the length
    const dx = planeLine[1].x - x1;
    const dy = planeLine[1].y - y1;
    const magnitude = Math.sqrt(dx * dx + dy * dy);

    let directionX = (dx / magnitude) * length;
    let directionY = (dy / magnitude) * length;

    const x2 = planeLine[0].x + directionX;
    const y2 = planeLine[0].y + directionY;

    const x3 = raybeam[0].x;
    const y3 = raybeam[0].y;

    const x4 = raybeam[1].x;
    const y4 = raybeam[1].y;

    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (denom === 0) return false; // Parallel lines

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

    if (t > 0 && t < 1 && u > 0 && u < 1) {
        const intersectX = x1 + t * (x2 - x1);
        const intersectY = y1 + t * (y2 - y1);

        // Calculate the angle from the intersection point to the start of raybeam
        const angleRad = Math.atan2(y3 - intersectY, x3 - intersectX);

        return { x: intersectX, y: intersectY, radians: angleRad };
    }
    return false;
}



function getBounceAngle(point, line) {
    /*
    Calculates the reflection angle of a point hitting a line segment.

    This function simulates a perfect elastic collision (like a billiard ball or light ray).
    It converts an incident angle into a vector, calculates the surface normal,
    and applies the standard reflection formula: R = I - 2(I · N)N.

    Reflection Logic:

     1. Convert incident angle to a unit vector.
     2. Derive the surface normal from the line's direction.
     3. Use the Dot Product to find the projection of the incident vector onto the normal.
     4. Subtract twice that projection from the incident vector to get the reflection.
     5. Convert back to radians using atan2.
    */

    // Step 1: Convert the incident angle (from radians) to a vector
    const incidentVector = point.vector2D(-1)

    // Step 2: Calculate the normal of the line (perpendicular to the line)
    const dx = line[1].x - line[0].x;
    const dy = line[1].y - line[0].y;

    // The normal vector should point outwards from the surface
    const normalX = -dy;
    const normalY = dx;

    // Normalize the normal vector
    const normalMagnitude = Math.sqrt(normalX * normalX + normalY * normalY);
    const normalUnitX = normalX / normalMagnitude;
    const normalUnitY = normalY / normalMagnitude;

    // Step 3: Calculate the dot product of the incident vector and the normal
    const dotProduct = incidentVector.x * normalUnitX + incidentVector.y * normalUnitY;

    // Step 4: Reflect the incident vector off the line (like a bounce)
    const reflectVectorX = incidentVector.x - 2 * dotProduct * normalUnitX;
    const reflectVectorY = incidentVector.y - 2 * dotProduct * normalUnitY;

    // Step 5: Convert the reflected vector back to an angle in radians
    const reflectAngle = Math.atan2(reflectVectorY, reflectVectorX);

    return reflectAngle;
}


stage = MainStage.go(/*{ loop: true }*/)
