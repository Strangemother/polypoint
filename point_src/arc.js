/*

There are a few _arc_ tools we want here.

Draw arc:

+ typical:

a.pen.arc(ctx, b, primaryColor, size, 2, 0)


*/


class PointArc {
    constructor(pointpen) {
        this.parent = pointpen.parent
    }

    fromTo(fromPoint, toPoint, direction){
        /* Point as _center_, arc from A, to B, at a distance c.radius */
        let centerPoint = this.parent
        return arcFromTo(centerPoint, fromPoint, toPoint, direction)
    }

    sweep(radSweep=Math.PI, direction=0){
        /* Sweep through a rad amount, e.g. PI. */
        let centerPoint = this.parent
        return arcSweep(centerPoint, radSweep, direction)
    }

    though(a, centerPoint, b) {
        /* An arc from A to B through _c_, the radius is evaluated */
    }

    radial(other, radius) {
        /* from _this_ A (typically center), to B `other`, drawing an
        arc of a given radius. */
    }
}


Polypoint.head.deferredProp('Point',
    function arc() {
        return new PointArc(this)
    }
);



function getRadiusPlot(A, B, radius) {
  const dx = B.x - A.x;
  const dy = B.y - A.y;
  const d = Math.hypot(dx, dy);

  // Check if radius is too small to form an arc
  if (d > 2 * radius) return null;

  const mx = (A.x + B.x) / 2;
  const my = (A.y + B.y) / 2;

  const h = Math.sqrt(radius**2 - (d / 2)**2);

  // Normalize direction perpendicular to AB
  const ux = -dy / d;
  const uy = dx / d;

  const cx1 = mx + h * ux;
  const cy1 = my + h * uy;

  const cx2 = mx - h * ux;
  const cy2 = my - h * uy;

  // Return both center options
  return [
    { x: cx1, y: cy1 },
    { x: cx2, y: cy2 }
  ];
}



const penArcPlot = function(arcPlot, ctx, color='red', width=2) {
    let p = arcPlot.point;

    p.pen.arc(ctx
            , {radians: arcPlot.toRadians }
            , color
            , arcPlot.radius ?? arcPlot.point.radius
            , width
            , arcPlot.direction
        )
}


const drawArcPlot = function(arcPlot, ctx, color='red', width=2) {
    let p = arcPlot.point;

    let start = arcPlot.fromRadians
    let end = arcPlot.toRadians
    p.draw.arc(ctx, arcPlot.radius, start, end, arcPlot.direction)
}


class ArcPlot {

    fromTo(centerPoint, fromPoint, toPoint, direction){
        return arcFromTo(centerPoint, fromPoint, toPoint, direction)
    }

    sweep(centerPoint, radSweep=Math.PI, direction=0){
        return arcSweep(centerPoint, radSweep, direction)
    }

    though(a, centerPoint, b) {

    }
}


const getArcPlotAngle = function(arcPlot, direction=1){
    /* Given an arcplot object return the angle difference between
    the two arc points.

    For example if the two items are pointing directly away from each other,
    the result is 180 (degrees)
    */
    let rads;
    if(direction==1) {
        rads = radiansDiff(arcPlot.toRadians, arcPlot.fromRadians)
    } else {
        rads = radiansDiff(arcPlot.fromRadians, arcPlot.toRadians)
    }

    return radiansToDegrees(rads)
}

const arcSweep = function(centerPoint, radSweep=Math.PI, direction=0) {
    /* Draw an arc as a _sweep_, using the center point initial direction
    and a angle to sweep through.

    Draw a 1/4 pie arc

        let arcPlot = arcSweep(centerPoint, Math.PI * .5)
    */
    let cp = centerPoint.copy()
    let fromRadians = cp.radians
    let toRadians = fromRadians + radSweep

    // cp.pen.arc(ctx, {radians:toRadians}, 'red', cp.radius, 2, direction)
    /* radians arc plot */
    return {
        point: cp
        // x: cp.x
        // , y: cp.y
        // , radius: cp.radius
        , fromRadians
        , toRadians
        , direction
    }
}


const arcFromTo = function(centerPoint, fromPoint, toPoint, direction=0){
    /* An arc, starting at `fromPoint`, ending at `toPoint`, the origin center,
    at a distance from the center, equal to the center point radius.

        let arcPlot = arcFromTo(centerPoint, fromPoint, toPoint)
        penArcPlot(arcPlot, ctx, 'orange')

    the  _from_ or _to_ point may be at any distance from the center point.
    */
    let cp = centerPoint.copy()
    let fromRadians = cp.lookAt(fromPoint)
    let toRadians = cp.directionTo(toPoint)

    // cp.pen.arc(ctx, {radians:toRadians}, 'red', cp.radius, 2, direction)
    /* radians arc plot */
    return {
        point: cp
        // x: cp.x
        // , y: cp.y
        // , radius: cp.radius
        , fromRadians
        , toRadians
        , direction
    }
}




function findThirdPoint(A, B) {
  const dx = B.x - A.x;
  const dy = B.y - A.y;
  let r1 = A.radius
  let r2 = B.radius
  const d = Math.hypot(dx, dy);

  // No solution if distance is too big or too small
  if (d > r1 + r2 || d < Math.abs(r1 - r2)) return [];

  // Midpoint between circles
  const a = (r1**2 - r2**2 + d**2) / (2 * d);
  const h = Math.sqrt(r1**2 - a**2);

  // Point P, along the line from A to B
  const px = A.x + a * dx / d;
  const py = A.y + a * dy / d;

  // Perpendicular offsets to find the intersection points
  const rx = -dy * (h / d);
  const ry =  dx * (h / d);

  const intersection1 = { x: px + rx, y: py + ry };
  const intersection2 = { x: px - rx, y: py - ry };

  // Return both possibilities
  return [intersection1, intersection2];
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


function arcPlotTo(center, start, sweepDegrees) {
  const radius = Math.hypot(start.x - center.x, start.y - center.y);
  const startAngle = Math.atan2(start.y - center.y, start.x - center.x);
  const sweepRadians = sweepDegrees * (Math.PI / 180);

  const endAngle = startAngle + sweepRadians;

  return {
    x: center.x + radius * Math.cos(endAngle),
    y: center.y + radius * Math.sin(endAngle)
  };
}
