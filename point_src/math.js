
const vectorAngle = (x, y) =>{
  // vectorAngle([3, 4], [4, 3]); // 0.283794109208328

  Math.acos(
    x.reduce((acc, n, i) => acc + n * y[i], 0) /
      (Math.hypot(...x) * Math.hypot(...y))
  );

}

const applyAngle = function(s) {

    let obtuseOffset = 10;
    let offset = 20;
    // let o1 = getPointOffsetAbsolute(s.position, s.mid, offset, 1)
    // let o2 = getPointOffsetAbsolute(s.mid, s.end, offset, 0)
    // a.position.copy(o1)
    // a.end.copy(o2)
    // a.render()

    // a.sweepFlag = 1
    // a2.sweepFlag = 0


    // Calculate a to b through c,
    // The +/-result defines the one _upper_ sweep, neg identifies it as the
    // _outer_ or obtuse angle of the pair
    // ang1 = calculateAngleWithRefWithNeg(s.position, s.end, s.mid)
    let ang1 = s.position.protractorAngleTo(s.end, s.mid)
    // let ajl = adjustAngleToPreferredRotation(ang1, 180)
    let ajl = ang1.protractorRotate(180)
    if(ang1 > 180) {
        ajl = 360 - ajl
    }
    // console.log(ajl)
    let oa = ang1 < 0? obtuseOffset: 0;
    let ob = ang1 > 0? obtuseOffset: 0;
    //acute Arc
    drawArcThroughPoint(a, s.position, s.end, s.mid, offset + oa)
    a.sweepFlag = +(ang1 > 0)
    //obtuse
    // drawArcThroughPoint(a2, s.position, s.end, s.mid, offset + ob)


}

const drawArcThroughPoint = function(arc, start, end, mid, offset=20) {
    let offsetPlus = 0
    mid = new Point(mid)
    // let o4 = getPointOffsetAbsolute(start, mid, offset + offsetPlus, 1)
    // let o3 = getPointOffsetAbsolute(mid, end, offset + offsetPlus, 0)
    let o4 = start.interpolateTo(mid, offset + offsetPlus, 1)
    let o3 = mid.interpolateTo(end, offset + offsetPlus, 0)
    let po4 = new Point(o4)

    if(po4.isNaN(true)) { return }
    arc.options.rx = arc.options.ry = offset + offsetPlus

    arc.position.copy(o4)
    arc.end.copy(o3)
    arc.render()
}



let quantizeT = function(s, t, rect){

    let endX = t.clientX - rect.x
    let endY = t.clientY - rect.y

    if(s.settings.quantizeTip != undefined) {
        endY = quantizeNumber(endY, s.settings.quantizeTip)
        endX = quantizeNumber(endX, s.settings.quantizeTip)
    }

    return [endX, endY]
}


function distance(xy1, xy2) {
  return Math.sqrt(Math.pow((xy2.x - xy1.x), 2) + Math.pow((xy2.y - xy1.y), 2));
}


function distance2D(xy1, xy2) {
    const dx = xy1.x - xy2.x;
    const dy = xy1.y - xy2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return { x: dx, y: dy, distance }
}


const spotPlacement = function(s, offset) {
        let d = distance(s.position, s.end)
        offset = offset == undefined ? (d * -.02): offset
        let off = findOffsetPoint(s.position, s.end, offset)
        c.width = 5
        // c.width = 2.5//offset * .25
        c.position.set(off)
        c.render()
}


function findOffsetPoint(point1, point2, offsetDistance=10) {
  // Calculate unit direction vector
  const dist = distance(point1, point2);
  const ux = (point2.x - point1.x) / dist;
  const uy = (point2.y - point1.y) / dist;

  // Calculate perpendicular vector
  const px = -uy;
  const py = ux;

  // Calculate midpoint
  const mx = (point1.x + point2.x) / 2;
  const my = (point1.y + point2.y) / 2;

  // Calculate offset point
  const cx = mx + offsetDistance * px;
  const cy = my + offsetDistance * py;

  res = { x: cx, y: cy };

  return res
}



// ---
function calculateFirstSegmentOffsetFromEndWithNeg(start, end) {
  // Calculate the total distance from start to end
  const distanceAB = Math.sqrt(
    Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
  );

  // Calculate the length of the first horizontal segment
  const d = distanceAB / (1 + Math.sqrt(2));

  const dx = end.x - start.x
  const dy = end.y - start.y
  console.log(dx,dy)
  // Calculate the direction factors for x and y dimensions
  const directionX = (dx >= 0) ? 1 : -1;
  const directionY = (dy >= 0) ? 1 : -1;

  // Calculate the offset from end.x
  // Here we use directionX to decide whether to add or subtract d from end.x
  let offsetX;
  if (directionX === 1 && directionY === 1) {
    return end.x - d;
  }

  if (directionX === -1 && directionY === -1) {
    return end.x + d;
  }

  if (directionX === 1 && directionY === -1) {
    return end.x - d;
  }

  if (directionX === -1 && directionY === 1) {
    return end.x + d;
  }

  return offsetX;
}


function calculateFirstSegmentOffsetFromEndWithNegY(start, end, k='y') {

  // Calculate the total distance from start to end
  const distanceAB = Math.sqrt(
    Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
  );

  // Calculate the length of the first segment, which is universal for both x and y dimensions
  const d = distanceAB / (1 + Math.sqrt(2));

  // Calculate the direction factors for x and y dimensions
  const directionX = (end.x - start.x >= 0) ? 1 : -1;
  const directionY = (end.y - start.y >= 0) ? 1 : -1;

  // Determine the direction for the dimension specified by k
  const directionK = (k === 'x') ? directionX : directionY;

  // Determine the end value for the dimension specified by k
  const endK = end[k];

  // Calculate the offset based on direction
  const offsetK = directionK === 1 ? (endK - d) : (endK + d);

  return offsetK;
}


function calculateFirstSegmentOffsetFromEndA(start, end, outputAngle=90) {
  // Calculate the total distance from start to end
  const distanceAB = Math.sqrt(
    Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
  );

  // Calculate the original line angle
  let angleInRadians = Math.atan2(end.y - start.y, end.x - start.x);

  // Convert to degrees
  let angleInDegrees = angleInRadians * (180 / Math.PI);

  // Normalize the angle to between 0 and 360 degrees
  angleInDegrees = (angleInDegrees + 360) % 360;

  // Calculate the adjusted angle based on the outputAngle
  const adjustedAngle = (angleInDegrees + outputAngle) % 360;

  // Calculate the length of the first segment based on trigonometry
  // Here we assume the angle is with respect to the x-axis.
  // You can adjust this based on your application's needs.
  const d = distanceAB / (Math.cos(adjustedAngle * (Math.PI / 180)) + Math.sin(adjustedAngle * (Math.PI / 180)));

  // Calculate the offset from end.x
  const offsetX = end.x - d * Math.cos(angleInDegrees * (Math.PI / 180));

  return offsetX;
}


function calculateFirstSegmentOffsetFromEnd(start, end) {
  // Calculate the total distance from start to end
  const distanceAB = Math.sqrt(
    Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
  );

  // Calculate the length of the first horizontal segment
  const d = distanceAB / (1 + Math.sqrt(2));

  // Calculate the offset from end.x
  const offsetX = end.x - d;

  return offsetX;
}


function calculateFirstSegmentLength(start, end) {
  // Calculate the total distance from start to end
  const distanceAB = Math.sqrt(
    Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
  );

  // Calculate the length of the first horizontal segment
  const d = distanceAB / (1 + Math.sqrt(2));

  return d;
}


function quantizeNumber(value, quantize=1) {
  const quantizedValue = Math.round(value / quantize) * quantize;
  return quantizedValue;
}


function findRadius(pointA, pointB, pointC) {

    // // Test the function
    // const pointA = { x: 0, y: 0 };
    // const pointB = { x: 1, y: 0 };
    // const pointC = { x: 0.5, y: 0.5 * Math.sqrt(3) };

    // const radius = findRadius(pointA, pointB, pointC);
    // console.log("Radius:", radius);

    const a = distance(pointB, pointC);
    const b = distance(pointC, pointA);
    const c = distance(pointA, pointB);

    const s = a + b + c; // semi-perimeter

    const radius = (a * b * c) / Math.sqrt(s * (s - 2 * a) * (s - 2 * b) * (s - 2 * c));

    return radius;
}


function distance(xy1, xy2) {
  return Math.sqrt(Math.pow((xy2.x - xy1.x), 2) + Math.pow((xy2.y - xy1.y), 2));
}

// Function to quantize an angle based on the number of divisions (bisect)
function quantizeAngle(inputAngle, bisect) {
  /*
    // Test the function
    console.log(quantizeAngle(10, 4));  // Should return 0
    console.log(quantizeAngle(50, 4));  // Should return 90
    console.log(quantizeAngle(10, 8));  // Should return 0
    console.log(quantizeAngle(50, 8));  // Should return 45
   */

  // Normalize the input angle to between 0 and 360 degrees
  inputAngle = inputAngle % 360;
  if (inputAngle < 0) {
    inputAngle += 360;
  }

  // Calculate the size of each sector
  const sectorSize = 360 / bisect;

  // Find the closest multiple of sectorSize to inputAngle
  const closestAngle = Math.round(inputAngle / sectorSize) * sectorSize;

  // Normalize the closest angle to between 0 and 360 degrees
  return closestAngle % 360;
}


function calculateAngle(point1, point2) {
    /**
        // Test the function
        const point1 = {x: 10, y: 10};
        const point2 = {x: 10, y: 100};
        console.log(calculateAngle(point1, point2)); // 90
        // GPT
     */
    // deltaX and deltaY are the changes in x and y respectively between the two points
    const deltaX = point2.x - point1.x;
    const deltaY = point2.y - point1.y;

    // Calculate the angle in radians and convert it to degrees
    let angleInDegrees = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

    // Adjust the angle so that "up" corresponds to 0 degrees and "down" corresponds to 180 degrees
    angleInDegrees = (angleInDegrees + 360) % 360;

    return angleInDegrees;
}

function calculateAngleWithRef(point1, point2, referencePoint) {
  // First calculate the "incoming direction" angle using
  // point1 and referencePoint
  const refDeltaX = point1.x - referencePoint.x;
  const refDeltaY = point1.y - referencePoint.y;
  let refAngleInDegrees = Math.atan2(refDeltaY, refDeltaX) * (180 / Math.PI);
  refAngleInDegrees = (refAngleInDegrees + 360) % 360;

  // Then calculate the angle between point1 and point2
  const deltaX = point2.x - point1.x;
  const deltaY = point2.y - point1.y;
  let angleInDegrees = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
  angleInDegrees = (angleInDegrees + 360) % 360;

  // Finally, find the relative angle
  let relativeAngleInDegrees = angleInDegrees - refAngleInDegrees;

  // Normalize the relative angle to be between 0 and 360
  relativeAngleInDegrees = (relativeAngleInDegrees + 360) % 360;

  return relativeAngleInDegrees;
}


function calculateAngleWithRefNegMirror(point1, point2, referencePoint) {
    /*
    Calculate from a to b through c. with the result always less than 180.

    where the real point line would be

      point1 --> referencePoint -\
                                  \-> point2

    The angle across point1 and 2 is the result.
    The line from point1 to referencePoint is known as the 'incoming direction'

   */

    // First calculate the "incoming direction" angle using point1 and referencePoint
    const refDeltaX = point1.x - referencePoint.x;
    const refDeltaY = point1.y - referencePoint.y;
    let refAngleInDegrees = Math.atan2(refDeltaY, refDeltaX) * (180 / Math.PI);
    refAngleInDegrees = (refAngleInDegrees + 360) % 360;

    // Then calculate the angle between point1 and point2
    const deltaX = point2.x - point1.x;
    const deltaY = point2.y - point1.y;
    let angleInDegrees = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    angleInDegrees = (angleInDegrees + 360) % 360;

    // Finally, find the relative angle
    let relativeAngleInDegrees = angleInDegrees - refAngleInDegrees;

    // Normalize the relative angle to be between 0 and 360
    relativeAngleInDegrees = (relativeAngleInDegrees + 360) % 360;

    // Convert obtuse angles to their acute supplementary angles
    if (relativeAngleInDegrees > 180) {
      relativeAngleInDegrees = 360 - relativeAngleInDegrees;
    }

    return relativeAngleInDegrees;
}


function calculateAngleWithRefWithNeg(point1, point2, referencePoint) {
  /*
    Calculate from a to b through c where the result is >180 for acute, and <180 of abtuse.
    This is done in the assumtion a lint to a line is always 180degrees max, therefore
    the neg infers the _obtuse_ side of the angle and is `360 + (negativeValue)`.

    Where the real point line would be

      point1 --> referencePoint -\
                                  \-> point2

    The angle across point1 and 2 is the result.
    The line from point1 to referencePoint is known as the 'incoming direction'
   */
  // First calculate the "incoming direction" angle using point1 and referencePoint
  const refDeltaX = point1.x - referencePoint.x;
  const refDeltaY = point1.y - referencePoint.y;
  let refAngleInDegrees = Math.atan2(refDeltaY, refDeltaX) * (180 / Math.PI);
  refAngleInDegrees = (refAngleInDegrees + 360) % 360;

  // Then calculate the angle between point1 and point2
  const deltaX = point2.x - point1.x;
  const deltaY = point2.y - point1.y;
  let angleInDegrees = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
  angleInDegrees = (angleInDegrees + 360) % 360;

  // Finally, find the relative angle
  let relativeAngleInDegrees = angleInDegrees - refAngleInDegrees;

  // Normalize the relative angle to be between 0 and 360
  relativeAngleInDegrees = (relativeAngleInDegrees + 360) % 360;

  // Use negative angle for obtuse angles
  if (relativeAngleInDegrees > 180) {
    relativeAngleInDegrees = relativeAngleInDegrees - 360;
  }

  return relativeAngleInDegrees;
}


function adjustAngleToPreferredRotation(relativeAngle, preferredRotation) {
  // Normalize the relative angle and preferred rotation to be between 0 and 360
  relativeAngle = (relativeAngle + 360) % 360;
  preferredRotation = (preferredRotation + 360) % 360;

  // Calculate the new angle relative to the preferred rotation
  let adjustedAngle = preferredRotation - relativeAngle;

  // Normalize the adjusted angle to be between 0 and 360
  adjustedAngle = (adjustedAngle + 360) % 360;

  return adjustedAngle;
}


function findOffsetPoint(point1, point2, offsetDistance=10) {
  // Calculate unit direction vector
  const dist = distance(point1, point2);
  const ux = (point2.x - point1.x) / dist;
  const uy = (point2.y - point1.y) / dist;

  // Calculate perpendicular vector
  const px = -uy;
  const py = ux;

  // Calculate midpoint
  const mx = (point1.x + point2.x) / 2;
  const my = (point1.y + point2.y) / 2;

  // Calculate offset point
  const cx = mx + offsetDistance * px;
  const cy = my + offsetDistance * py;

  res = { x: cx, y: cy };

  return res
}


function getOffsetPoint(pointA, pointB, percentage, fromPoint) {
  if (fromPoint === 1) {
    [pointA, pointB] = [pointB, pointA];
  }

  const x = (1 - percentage) * pointA.x + percentage * pointB.x;
  const y = (1 - percentage) * pointA.y + percentage * pointB.y;

  return { x, y };
}


function getPointOffsetAbsolute(pointA, pointB, distance, fromPoint) {
    // Swap points if the offset is from point B
    if (fromPoint === 1) {
      [pointA, pointB] = [pointB, pointA];
    }

    // Find the direction vector from pointA to pointB
    const dirX = pointB.x - pointA.x;
    const dirY = pointB.y - pointA.y;

    // Calculate the length of the direction vector
    const length = Math.sqrt(dirX * dirX + dirY * dirY);

    // Normalize the direction vector
    const normX = dirX / length;
    const normY = dirY / length;

    // Scale the normalized vector by the given distance
    const offsetX = normX * distance;
    const offsetY = normY * distance;

    // Calculate the new point
    const x = pointA.x + offsetX;
    const y = pointA.y + offsetY;

    return { x, y };
  }

  // const pointA = { x: 0, y: 0 };
  // const pointB = { x: 100, y: 100 };

  // // Offset 50 units from point A towards point B
  // const result1 = getPointOffsetAbsolute(pointA, pointB, 50, 0);
  // console.log(result1);  // Should output a point approximately at { x: 35.36, y: 35.36 }

  // // Offset 50 units from point B towards point A
  // const result2 = getPointOffsetAbsolute(pointA, pointB, 50, 1);
  // console.log(result2);  // Should output a point approximately at { x: 64.64, y: 64.64 }



function linePathArray(start, end, gap = 10, rotation = 0) {
    const toRadians = (degrees) => (degrees * Math.PI) / 180;

    // Compute the rotation matrix elements
    const cosTheta = Math.cos(toRadians(rotation));
    const sinTheta = Math.sin(toRadians(rotation));

    // Calculate the extra length required to ensure lines span the entire rectangle
    const extra = Math.abs((end.y - start.y) * sinTheta) + Math.abs((end.x - start.x) * cosTheta);

    // Adjust the start and end x-coordinates
    const adjustedStartX = start.x - extra;
    const adjustedEndX = end.x + extra;

    const numLines = Math.ceil((adjustedEndX - adjustedStartX) / gap);

    let pathData = '';

    for (let i = 0; i <= numLines; i++) {
        // Starting point of each line (before rotation)
        const baseX = adjustedStartX + i * gap;
        const baseY = start.y;

        // Applying rotation to get the end point
        const x1 = baseX;
        const y1 = baseY;
        const x2 = baseX - (end.y - start.y) * sinTheta;
        const y2 = baseY + (end.y - start.y) * cosTheta;

        // Only add the line segment if it intersects with the rectangle
        // (You can further optimize this to compute intersection points if necessary)
        if ((x1 >= start.x && x1 <= end.x && y1 >= start.y && y1 <= end.y) ||
            (x2 >= start.x && x2 <= end.x && y2 >= start.y && y2 <= end.y)) {
            pathData += `M${x1} ${y1} L${x2} ${y2} `;
        }
    }

    return pathData;
}


function linePathArray2(start, end, gap = 10, rotation = 0) {
    const toRadians = (degrees) => (degrees * Math.PI) / 180;

    function lineIntersectRect(m, c, start, end) {
        let left = { x: start.x, y: m * start.x + c };
        let right = { x: end.x, y: m * end.x + c };
        let top = { x: (start.y - c) / m, y: start.y };
        let bottom = { x: (end.y - c) / m, y: end.y };

        let points = [left, right, top, bottom];
        let validPoints = points.filter(pt => pt.x >= start.x && pt.x <= end.x && pt.y >= start.y && pt.y <= end.y);
        validPoints.sort((a, b) => a.x - b.x || a.y - b.y);

        if (validPoints.length < 2) return null;
        return [validPoints[0], validPoints[validPoints.length - 1]];
    }

    const m = Math.tan(toRadians(rotation));
    const centerX = (start.x + end.x) / 2;
    const centerY = (start.y + end.y) / 2;
    let pathData = '';

    // Draw the central line
    let centralC = centerY - m * centerX;
    let segment = lineIntersectRect(m, centralC, start, end);
    if (segment) {
        pathData += `M${segment[0].x} ${segment[0].y} L${segment[1].x} ${segment[1].y} `;
    }

    // Draw lines outwards from center in both directions
    let i = 1;
    while (i < 3000) {
        const d = gap * i;
        let validSegments = 0;

        if(validSegments > 500) {
            break
        }
        // Line shifted upwards from the center
        let c1 = centerY - m * (centerX - d);
        segment = lineIntersectRect(m, c1, start, end);
        if (segment) {
            validSegments++;
            pathData += `M${segment[0].x} ${segment[0].y} L${segment[1].x} ${segment[1].y} `;
        }

        // Line shifted downwards from the center
        let c2 = centerY - m * (centerX + d);
        segment = lineIntersectRect(m, c2, start, end);
        if (segment) {
            validSegments++;
            pathData += `M${segment[0].x} ${segment[0].y} L${segment[1].x} ${segment[1].y} `;
        }

        // If no lines intersected the rectangle, we're done
        if (validSegments === 0) break;
        i++;
    }

    return pathData;
}


function linePathArray3(start, end, gap = 10, rotation = 0, offset = 0) {
    function rotatePoint(px, py, angle) {
        const s = Math.sin(angle);
        const c = Math.cos(angle);

        return {
            x: px * c - py * s,
            y: px * s + py * c
        };
    }

    const radianRotation = rotation * (Math.PI / 180);
    let pathData = '';
    const width = end.x - start.x;
    const height = end.y - start.y;
    const maxDist = Math.sqrt(width * width + height * height);
    const steps = maxDist / gap;
    if(typeof(offset) == 'number'){
        offset = {x: offset, y: offset}
    }

    const ofs = function(v) {
        let r = (v % ( gap - 2))
        return r + 2
    }

    Object.assign(offset, {
            oX: ofs(offset.x)
            , oY: ofs(offset.y)
        })

    // console.log('modOffset', offset.oX)

    for (let i = -steps; i <= steps; i++) {
        // Get two far away points and then determine where they intersect with our rectangle
        let p1 = { x: -maxDist, y: i * gap };
        let p2 = { x: maxDist, y: i * gap };

        // Rotate the points
        p1 = rotatePoint(p1.x, p1.y, radianRotation);
        p2 = rotatePoint(p2.x, p2.y, radianRotation);

        // Translate them to our rectangle's position
        p1.x += ((start.x + end.x) * .5) + offset.oX;
        p1.y += ((start.y + end.y) * .5) + offset.oY;
        p2.x += ((start.x + end.x) * .5) + offset.oX;
        p2.y += ((start.y + end.y) * .5) + offset.oY;

        // Now let's determine if these lines actually intersect with our rectangle
        // We use a simple clipping algorithm to trim the lines
        const clippedLine = clipLineToRect(p1, p2, start, end);
        if (clippedLine) {
            pathData += `M${clippedLine[0].x} ${clippedLine[0].y} L${clippedLine[1].x} ${clippedLine[1].y} `;
        }
    }

    return pathData;
}


function clipLineToRect(p0, p1, topLeft, bottomRight) {
    // Cohen–Sutherland clipping algorithm
    const INSIDE = 0;
    const LEFT = 1;
    const RIGHT = 2;
    const BOTTOM = 4;
    const TOP = 8;

    const computeOutCode = (x, y, topLeft, bottomRight) => {
        let code = INSIDE;

        if (x < topLeft.x) code |= LEFT;
        else if (x > bottomRight.x) code |= RIGHT;
        if (y < topLeft.y) code |= TOP;
        else if (y > bottomRight.y) code |= BOTTOM;

        return code;
    };

    let outcode0 = computeOutCode(p0.x, p0.y, topLeft, bottomRight);
    let outcode1 = computeOutCode(p1.x, p1.y, topLeft, bottomRight);
    let accept = false;

    while (true) {
        if (!(outcode0 | outcode1)) {
            accept = true;
            break;
        } else if (outcode0 & outcode1) {
            break;
        } else {
            let x, y;
            const outcodeOut = outcode0 ? outcode0 : outcode1;

            if (outcodeOut & TOP) {
                x = p0.x + (p1.x - p0.x) * (topLeft.y - p0.y) / (p1.y - p0.y);
                y = topLeft.y;
            } else if (outcodeOut & BOTTOM) {
                x = p0.x + (p1.x - p0.x) * (bottomRight.y - p0.y) / (p1.y - p0.y);
                y = bottomRight.y;
            } else if (outcodeOut & RIGHT) {
                y = p0.y + (p1.y - p0.y) * (bottomRight.x - p0.x) / (p1.x - p0.x);
                x = bottomRight.x;
            } else if (outcodeOut & LEFT) {
                y = p0.y + (p1.y - p0.y) * (topLeft.x - p0.x) / (p1.x - p0.x);
                x = topLeft.x;
            }

            if (outcodeOut === outcode0) {
                p0 = { x, y };
                outcode0 = computeOutCode(p0.x, p0.y, topLeft, bottomRight);
            } else {
                p1 = { x, y };
                outcode1 = computeOutCode(p1.x, p1.y, topLeft, bottomRight);
            }
        }
    }

    if (accept) {
        return [p0, p1];
    } else {
        return null;
    }
}

// // Example usage
// const pathData = drawGrid({ x: 300, y: 100 }, { x: 500, y: 300 }, 10, 45);
// console.log(pathData);


function findLineCircleIntersections(p0, p1, cx, cy, radius) {
    let dx = p1.x - p0.x;
    let dy = p1.y - p0.y;
    let A = dx * dx + dy * dy;
    let B = 2 * (dx * (p0.x - cx) + dy * (p0.y - cy));
    let C = (p0.x - cx) * (p0.x - cx) + (p0.y - cy) * (p0.y - cy) - radius * radius;
    let det = B * B - 4 * A * C;

    if (det < 0 || A === 0) {
        return [];
    } else if (det === 0) {
        // One solution
        let t = -B / (2 * A);
        return [{ x: p0.x + t * dx, y: p0.y + t * dy }];
    } else {
        // Two solutions
        let t1 = (-B + Math.sqrt(det)) / (2 * A);
        let t2 = (-B - Math.sqrt(det)) / (2 * A);
        return [
            { x: p0.x + t1 * dx, y: p0.y + t1 * dy },
            { x: p0.x + t2 * dx, y: p0.y + t2 * dy }
        ];
    }
}


function drawGridInCircle(center, radius, gap, rotation, startOffset) {
    let angleRad = (rotation * Math.PI) / 180;
    let pathData = "";

    // Calculate a distant point based on rotation
    let distantPoint = {
        x: center.x + 2 * radius * Math.cos(angleRad),
        y: center.y + 2 * radius * Math.sin(angleRad)
    };

    for (let offset = -2 * radius; offset < 2 * radius; offset += gap) {
        let start = {
            x: center.x + offset * Math.sin(-angleRad),
            y: center.y + offset * Math.cos(-angleRad)
        };
        let end = {
            x: start.x + distantPoint.x - center.x,
            y: start.y + distantPoint.y - center.y
        };

        let intersections = findLineCircleIntersections(start, end, center.x, center.y, radius);
        if (intersections.length === 2) {
            pathData += `M${intersections[0].x} ${intersections[0].y} L${intersections[1].x} ${intersections[1].y} `;
        }
    }

    return pathData.trim();
}

// // Example usage
// const pathData = drawGridInCircle({ x: 400, y: 200 }, 100, 10, 45);
// console.log(pathData);
