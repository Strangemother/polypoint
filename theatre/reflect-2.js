/*
categories: reflections
files:
    ../point_src/core/head.js
    ../point_src/stage.js
    ../point_src/point-content.js
    ../point_src/pointdraw.js
    ../point_src/pointpen.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/point.js
    ../point_src/pointlistpen.js
    ../point_src/pointlist.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/distances.js
    ../point_src/dragging.js
    ../point_src/constrain-distance.js
*/
const checkIntersection = function(planeLine, raybeam, length) {
    const x1 = planeLine.start.x;
    const y1 = planeLine.start.y;

    if(length == undefined) {
        length = distance(planeLine.start, planeLine.end)
    }

    // Normalize the direction vector (end - start) and apply the length
    const dx = planeLine.end.x - x1;
    const dy = planeLine.end.y - y1;
    const magnitude = Math.sqrt(dx * dx + dy * dy);

    let directionX = (dx / magnitude) * length;
    let directionY = (dy / magnitude) * length;

    const x2 = planeLine.start.x + directionX;
    const y2 = planeLine.start.y + directionY;

    const x3 = raybeam.start.x;
    const y3 = raybeam.start.y;

    const x4 = raybeam.end.x;
    const y4 = raybeam.end.y;

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


/* Reflect _through_ the ray, landing on the opposite side of the ray */
function getAngle(point, line) {
    // Step 1: Convert the incident angle (from radians) to a vector
    const incidentVectorX = Math.cos(point.radians);
    const incidentVectorY = Math.sin(point.radians);

    // Step 2: Calculate the normal of the line (perpendicular to the line)
    const dx = line.end.x - line.start.x;
    const dy = line.end.y - line.start.y;

    // The normal vector can be (-dy, dx) or (dy, -dx)
    const normalX = -dy;
    const normalY = dx;

    // Normalize the normal vector
    const normalMagnitude = Math.sqrt(normalX * normalX + normalY * normalY);
    const normalUnitX = normalX / normalMagnitude;
    const normalUnitY = normalY / normalMagnitude;

    // Step 3: Reflect the incident vector using the normal vector
    const dotProduct = incidentVectorX * normalUnitX + incidentVectorY * normalUnitY;
    const reflectVectorX = incidentVectorX - 2 * dotProduct * normalUnitX;
    const reflectVectorY = incidentVectorY - 2 * dotProduct * normalUnitY;

    // Step 4: Convert the reflected vector back to an angle in radians
    const reflectAngle = Math.atan2(reflectVectorY, reflectVectorX);

    return reflectAngle;
}


function getAngleAlt(point, line) {
    // Step 1: Convert the incident angle (from radians) to a vector
    const incidentVectorX = Math.cos(point.radians);
    const incidentVectorY = Math.sin(point.radians);

    // Step 2: Calculate the normal of the line (perpendicular to the line)
    const dx = line.end.x - line.start.x;
    const dy = line.end.y - line.start.y;

    // The normal vector can be (-dy, dx) or (dy, -dx)
    let normalX = -dy;
    let normalY = dx;

    // Normalize the normal vector
    const normalMagnitude = Math.sqrt(normalX * normalX + normalY * normalY);
    let normalUnitX = normalX / normalMagnitude;
    let normalUnitY = normalY / normalMagnitude;

    // Step 3: Check the dot product of the incident vector and the normal
    const dotProductIncidentNormal = incidentVectorX * normalUnitX + incidentVectorY * normalUnitY;

    // If the dot product is positive, flip the normal vector
    if (dotProductIncidentNormal > 0) {
        normalUnitX = -normalUnitX;
        normalUnitY = -normalUnitY;
    }

    // Step 4: Reflect the incident vector using the correct normal vector
    const dotProduct = incidentVectorX * normalUnitX + incidentVectorY * normalUnitY;
    const reflectVectorX = incidentVectorX - 2 * dotProduct * normalUnitX;
    const reflectVectorY = incidentVectorY - 2 * dotProduct * normalUnitY;

    // Step 5: Convert the reflected vector back to an angle in radians
    const reflectAngle = Math.atan2(reflectVectorY, reflectVectorX);

    return reflectAngle;
}


function getBounceAngle(point, line) {
    // Step 1: Convert the incident angle (from radians) to a vector
    const incidentVectorX = -Math.cos(point.radians);
    const incidentVectorY = -Math.sin(point.radians);

    // Step 2: Calculate the normal of the line (perpendicular to the line)
    const dx = line.end.x - line.start.x;
    const dy = line.end.y - line.start.y;

    // The normal vector should point outwards from the surface
    const normalX = -dy;
    const normalY = dx;

    // Normalize the normal vector
    const normalMagnitude = Math.sqrt(normalX * normalX + normalY * normalY);
    const normalUnitX = normalX / normalMagnitude;
    const normalUnitY = normalY / normalMagnitude;

    // Step 3: Calculate the dot product of the incident vector and the normal
    const dotProduct = incidentVectorX * normalUnitX + incidentVectorY * normalUnitY;

    // Step 4: Reflect the incident vector off the line (like a bounce)
    const reflectVectorX = incidentVectorX - 2 * dotProduct * normalUnitX;
    const reflectVectorY = incidentVectorY - 2 * dotProduct * normalUnitY;

    // Step 5: Convert the reflected vector back to an angle in radians
    const reflectAngle = Math.atan2(reflectVectorY, reflectVectorX);

    return reflectAngle;
}


function getReflectAngle(intersectionPoint, line, otherLine) {
    // Incident vector (from the ray's start to intersection point)
    const incidentVectorX = line.end.x - line.start.x;
    const incidentVectorY = line.end.y - line.start.y;

    // Normalize the incident vector
    const incidentMagnitude = Math.sqrt(incidentVectorX * incidentVectorX + incidentVectorY * incidentVectorY);
    const incidentUnitX = incidentVectorX / incidentMagnitude;
    const incidentUnitY = incidentVectorY / incidentMagnitude;

    // Normal vector to the other line (perpendicular to the line)
    const dx = otherLine.end.x - otherLine.start.x;
    const dy = otherLine.end.y - otherLine.start.y;

    // The normal can be (-dy, dx) or (dy, -dx), depending on which direction you're considering
    const normalX = -dy;
    const normalY = dx;

    // Normalize the normal vector
    const normalMagnitude = Math.sqrt(normalX * normalX + normalY * normalY);
    const normalUnitX = normalX / normalMagnitude;
    const normalUnitY = normalY / normalMagnitude;

    // Reflect the incident vector around the normal
    const dotProduct = incidentUnitX * normalUnitX + incidentUnitY * normalUnitY;
    const reflectVectorX = incidentUnitX - 2 * dotProduct * normalUnitX;
    const reflectVectorY = incidentUnitY - 2 * dotProduct * normalUnitY;

    // Calculate the reflection angle
    const reflectAngle = Math.atan2(reflectVectorY, reflectVectorX);

    return reflectAngle;
}


const checkPointIntersection = function(line, point, radius=5, length=400) {
    const x1 = line.start.x;
    const y1 = line.start.y;

    // Normalize the direction vector (end - start) and apply the length
    const dx = line.end.x - x1;
    const dy = line.end.y - y1;
    const magnitude = Math.sqrt(dx * dx + dy * dy);

    let directionX = (dx / magnitude) * length;
    let directionY = (dy / magnitude) * length;

    const x2 = line.start.x + directionX;
    const y2 = line.start.y + directionY;

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


const checkPointIntersectionExact = function(line, point, radius=5, length=400) {
    const x1 = line.start.x;
    const y1 = line.start.y;

    // Normalize the direction vector (end - start) and apply the length
    const dx = line.end.x - x1;
    const dy = line.end.y - y1;
    const magnitude = Math.sqrt(dx * dx + dy * dy);

    let directionX = (dx / magnitude) * length;
    let directionY = (dy / magnitude) * length;

    const x2 = line.start.x + directionX;
    const y2 = line.start.y + directionY;

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


const checkPointIntersectionWithRotation = function(line, point, radius=5, length=400) {
    const x1 = line.start.x;
    const y1 = line.start.y;

    // Normalize the direction vector (end - start) and apply the length
    const dx = line.end.x - x1;
    const dy = line.end.y - y1;
    const magnitude = Math.sqrt(dx * dx + dy * dy);

    let directionX = (dx / magnitude) * length;
    let directionY = (dy / magnitude) * length;

    const x2 = line.start.x + directionX;
    const y2 = line.start.y + directionY;

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

            // Calculate the angle of the ray relative to the vertical axis
            let angleRad = Math.atan2(dy, dx);
            let rotation = (angleRad * 180) / Math.PI; // Convert to degrees

            // Adjust rotation so that 0 degrees is straight up
            rotation = (rotation + 90) % 360;
            if (rotation < 0) {
                rotation += 360;
            }

            return { x: intersectX, y: intersectY, radians: angleRad };
            // return { x: intersectX, y: intersectY, rotation: rotation };
        }
    }
    return false;
}



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
        let rayBeam = {start: ray[0], end: ray[1]}

        // ray beam from 0 to 1
        ray[0].lookAt(ray[1])
        ray[1].lookAt(ray[0])

        ray.pen.indicators(ctx)
        // Draw the plane
        line.pen.line(ctx, {color:'#AAA', width: 3})

        let planeRay = {start: line[0], end: line[1]}
        let planeLen = distance(line[0], line[1])
        // let p = checkIntersection(planeRay, rayBeam, planeLen)
        let hitPoint = checkIntersection(planeRay, rayBeam, planeLen)

        let p1 = this.center
        if(!hitPoint) {

            p1.copy().update({
                radius: 10
                , radians: getBounceAngle(ray[1], planeRay)
            }).pen.indicator(ctx, {color: 'red'})

            return
        }

        p1 = new Point(hitPoint)
        p1.radius = 20

        /* inbound angle, pointing at the first point. */
        // p1.pen.indicator(ctx, {color: 'green'})
        p1.pen.line(ctx, null, 'green', 2)

        /* symmetry angle, inverse of the inbound */
        const mirrorPoint = p1.copy().update({
            radius: 20
            , radians: getAngle(hitPoint, planeRay)
        })
        mirrorPoint.pen.indicator(ctx, {color: 'gray'})


        /* reflect angle.*/
        const reflectPoint = p1.copy().update({
            radius: 20
            , radians: getBounceAngle(hitPoint, planeRay)
        })

        // let rayLen = distance(ray[0], ray[1])
        let overLen = distance(reflectPoint, ray[1])
        reflectPoint.project(overLen).pen.indicator(ctx, {color: 'gray'})
        reflectPoint.pen.line(ctx, null, 'red', 2)
    }
}

stage = MainStage.go(/*{ loop: true }*/)
