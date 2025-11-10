/*
title: Point Reflection V1
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
const ray = {start: {x:100, y:300}, end: {x:500, y:500}}
const otherRay = {start: {x:100, y:20}, end: {x:50, y:350}}


const checkIntersection = function(line, otherLine, length=400) {
    const x1 = line.start.x;
    const y1 = line.start.y;


    // Normalize the direction vector (end - start) and apply the length
    const dx = line.end.x - x1;
    const dy = line.end.y - y1;
    const magnitude = Math.sqrt(dx * dy + dy * dy);

    let directionX = (dx / magnitude) * length;
    let directionY = (dy / magnitude) * length;

    const x2 = line.start.x + directionX;
    const y2 = line.start.y + directionY;

    const x3 = otherLine.start.x;
    const y3 = otherLine.start.y;

    const x4 = otherLine.end.x;
    const y4 = otherLine.end.y;

    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (denom === 0) return false; // Parallel lines

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

    if (t > 0 && t < 1 && u > 0 && u < 1) {
        const intersectX = x1 + t * (x2 - x1);
        const intersectY = y1 + t * (y2 - y1);
        return { x: intersectX, y: intersectY };
    }
    return false;
}

const checkIntersectionWithRotation = function(line, otherLine, length=400) {

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

    const x3 = otherLine.start.x;
    const y3 = otherLine.start.y;

    const x4 = otherLine.end.x;
    const y4 = otherLine.end.y;

    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (denom === 0) return false; // Parallel lines

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

    if (t > 0 && t < 1 && u > 0 && u < 1) {
        const intersectX = x1 + t * (x2 - x1);
        const intersectY = y1 + t * (y2 - y1);

        // Calculate the angle from the intersection point to the start of otherLine
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
        this.points = new PointList(
            new Point({
                 x: 250, y: 150
                , radius: 10
            })
            , new Point({
                 x: 400, y: 320
                , radius: 10
            })
        )

        this.line = new PointList(
            new Point(200, 300, 10),
            new Point(500, 300, 10)
        )

        this.dragging.add(...this.points, ...this.line)
    }

    draw(ctx){
        this.clear(ctx)

        let mouse = Point.mouse.position
        let points = this.points;
        let line = this.line;

        // points[0].track(mouse, 10)
        // points[1].track(points[0], 150)
        points[1].lookAt(points[0])
        points[0].lookAt(points[1])
        this.line.pen.line(ctx)
        let mouseRay = {start: points[0], end: points[1]}
        let lineRay = {start: line[0], end: line[1]}
        let lineLen = distance(line[0], line[1])
        // let p = checkIntersection(ray, {start: points[0], end: points[1]})
        let p = checkIntersectionWithRotation(lineRay, mouseRay, lineLen)

        if(p) {
            let p1 = new Point(p)
            p1.radius = 30

            /* inbound angle, pointing at the first point. */
            p1.pen.indicator(ctx, {color: 'green'})

            /* symmetry angle, inverse of the inbound */
            p1.copy().update({
                radius: 20
                , radians: getAngle(p, lineRay)//, {start: points[0], end: points[1]})
            }).pen.indicator(ctx, {color: 'gray'})

            /* reflect angle.*/
            p1.copy().update({
                radius: 25
                , radians: getBounceAngle(p, lineRay)//, {start: points[0], end: points[1]})
            }).pen.indicator(ctx, {color: 'red'})
        } else {

            this.center.copy().update({
                radius: 10
                ,radians: getBounceAngle(points[1], lineRay)
            }).pen.indicator(ctx, {color: 'red'})

        }

        points.pen.indicators(ctx)
        let hoverRadius = 50

        // let np = checkPointIntersection(ray, mouse, hoverRadius, 400)
        // let npe = checkPointIntersectionExact(ray, mouse, hoverRadius * .25, 400)

        // if(np) {
        //     // (new Point(np)).pen.indicator(ctx)
        //     mouse.pen.indicator(ctx)
        // }

        // if(npe) {
        //     (new Point(npe)).pen.indicator(ctx)
        //     // mouse.pen.indicator(ctx)
        // }
    }
}

stage = MainStage.go(/*{ loop: true }*/)
