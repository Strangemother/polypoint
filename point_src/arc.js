/*

There are a few _arc_ tools we want here.

Draw arc:

+ typical:

a.pen.arc(ctx, b, primaryColor, size, 2, 0)

*/


class PointArc {
    constructor(parent) {
        this.parent = parent
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

    to(other, through) {
        /*
          stage.fromPoint.arc.to(stage.toPoint, stage.centerPoint)
        */
        // let xyr = getArcCenter(this.parent, through, other)
        let xyr = getArcCenterThrough(this.parent, through, other)
        return xyr
        // return arcFromTo(new Point(xyr),this.parent,  other)
        // return arcFromTo(new Point(xyr))
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


function getArcCenter(A, B, C) {
    /* the circumcircle,
    draw an arc that fits all three.
    */
    const D = 2 * (A.x * (B.y - C.y) +
                   B.x * (C.y - A.y) +
                   C.x * (A.y - B.y));

    if (D === 0) return null; // points are colinear; no circle

    const Ux = (
      ((A.x ** 2 + A.y ** 2) * (B.y - C.y) +
       (B.x ** 2 + B.y ** 2) * (C.y - A.y) +
       (C.x ** 2 + C.y ** 2) * (A.y - B.y)) / D
    );

    const Uy = (
      ((A.x ** 2 + A.y ** 2) * (C.x - B.x) +
       (B.x ** 2 + B.y ** 2) * (A.x - C.x) +
       (C.x ** 2 + C.y ** 2) * (B.x - A.x)) / D
    );

    return { x: Ux, y: Uy, radius: Math.hypot(A.x - Ux, A.y - Uy)};
}


/**
 * Compute the circle through A,B,C and the angles you need
 * so that, by swapping start/end when needed, you can always
 * call ctx.arc(cx, cy, r, start, end) (no anticlockwise flag)
 * and get the SHORT arc that goes through B.
 */
function getArcCenterThrough(A, B, C) {
    // 1) Circum-center
    const D = 2 * (A.x*(B.y - C.y) + B.x*(C.y - A.y) + C.x*(A.y - B.y));
    if (D === 0) return null;  // colinear

    const Ux = (
      ((A.x*A.x + A.y*A.y)*(B.y - C.y) +
       (B.x*B.x + B.y*B.y)*(C.y - A.y) +
       (C.x*C.x + C.y*C.y)*(A.y - B.y)) / D
    );
    const Uy = (
      ((A.x*A.x + A.y*A.y)*(C.x - B.x) +
       (B.x*B.x + B.y*B.y)*(A.x - C.x) +
       (C.x*C.x + C.y*C.y)*(B.x - A.x)) / D
    );
    const r = Math.hypot(A.x - Ux, A.y - Uy);

    // 2) Angles from center to A, B, C
    const aA = Math.atan2(A.y - Uy, A.x - Ux);
    const aB = Math.atan2(B.y - Uy, B.x - Ux);
    const aC = Math.atan2(C.y - Uy, C.x - Ux);

    // 3) Figure out if B lies on the CCW-sweep from A to C
    //    If it does, the minor arc is CCW; otherwise it’s CW.
    let ccwHits;
    if (aA < aC) {
      ccwHits = (aA <= aB && aB <= aC);
    } else {
      // wrap at +π/−π
      ccwHits = (aA <= aB || aB <= aC);
    }

    // 4) We want the MINOR arc.  If B is on the CCW sweep,
    //    then the minor arc is CCW; else it’s CW.
    //    Since we’re forcing `anticlockwise=false`, we’ll swap
    //    start/end whenever it should be CCW.
    let start = aA, end = aC;
    if (!ccwHits) [ start, end ] = [ end, start ];

    return { cx: Ux, cy: Uy, radius: r, startRadians: start, toRadians: end };
}

/** Usage:
 *   const {cx,cy,radius,startAngle,endAngle} = getArcCenterThrough(A,B,C);
 *   ctx.beginPath();
 *   ctx.arc(cx, cy, radius, startAngle, endAngle);
 *   ctx.stroke();
 */



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
