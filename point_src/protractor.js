const PI_180 = (180 / Math.PI)
/*
    Given a point (with some rotation), return the angle relative to the _other_
    point through 360 degrees
    For example if the origin point is _looking_ at the _other_ point, the angle is 0,
 */
function calculateAngle360(point1, point2, rotation, direction=1) {
    // deltaX and deltaY are the changes in x and y respectively between the two points
    const deltaX = point2.x - point1.x;
    const deltaY = point2.y - point1.y;

    // Calculate the angle in radians and convert it to degrees
    let angleInDegrees = Math.atan2(deltaY, deltaX) * PI_180;
    if(rotation == undefined) {
        rotation = point1.rotation
    }
    /* Here we cheat and add _two rotations_ ensuring the number is always above <360
    to ensure the modulo returns a positive */
    angleInDegrees = (angleInDegrees + 720 - rotation) % 360;
    if(direction < 0) {
        angleInDegrees = invertClockRotation(angleInDegrees)
    }
    return angleInDegrees;
}

/* Return a value between -180 and 180, for the angle between point A and B.
*/
function calculateAngle180(point1, point2, rotation, direction=1) {
    let angleInDegrees = calculateAngle360(point1, point2, rotation, direction)
    return convertAngle180Split(angleInDegrees)
}


function calculateInverseAngle180(point1, point2, rotation, direction=1) {
    let rot = calculateAngle180(point1, point2, rotation, direction) * -1
    rot -= rot > 0? 180: -180
    return rot
}

function invertClockRotation(angleInDegrees) {
    let rev = (360 - angleInDegrees) % 360
    return rev;
}


function convertAngle180Split(angle) {
    let newAngle = angle % 360;
    if (newAngle > 180) {
        newAngle -= 360;
    }
    return newAngle;
}

function getCavity(point1, midPoint, point2) {
  /*
    Calculate the convex or concave value of three points, referencing the
    center point as the delta.

    For example, determine if the point between two points is a hill or a hole,
    relative to the line draw between the two points.

    getCavity({10,10}, {20, 20}, {30, 10}) //A small dip of 10.
   */

  // Do to this, we can use the calculate angle 180,
  debugger;
}

function calculateAngleDiff(primaryPoint, secondaryPoint) {
    /*
    Given two points, return the difference between the two in _degrees_.

      calculateAngleDiff(a, b)

    For example if the two points are rotated antipose - pointing away -
    direction, The result is 180.
    If the two points are _nearly_ pointing in the same direction, we expect
    the point to be near zero. Note this rotates around 360 degrees, so near zero
    angles are 0/360
    */
    // return ((b.radians - a.radians) + Math.PI2) % Math.PI2
    let rads = radiansDiff(primaryPoint.radians, secondaryPoint.radians)
    return radiansToDegrees(rads)
}

function radiansDiff(primaryRads, secondaryRads) {
   return ((primaryRads - secondaryRads) + Math.PI2) % Math.PI2
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
  relativeAngleInDegrees = (relativeAngleInDegrees + 720) % 360;

  return relativeAngleInDegrees;
}
