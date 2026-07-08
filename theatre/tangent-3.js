/*
title: Tangent Line V3
categories: tangents
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/extras.js
    ../point_src/math.js
    ../point_src/point-content.js
    ../point_src/stage.js
    ../point_src/point.js
    ../point_src/distances.js
    ../point_src/dragging.js
    ../point_src/functions/clamp.js
    ../point_src/pointlistpen.js
    ../point_src/pointlist.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/tangents.js

 */

class MainStage extends Stage {
    canvas = 'playspace'

    mounted(){
        let a = this.a = new Point(200, 200, 90)
        let b = this.b = new Point(600, 200, 100)
        this.updateLines(a,b)
        this.dragging.add(a,b)
        this.rLength = 70
    }

    updateLines(a=this.a, b=this.b){
        this.dragging.onDragMove = this.onDragMove.bind(this)
        // this.dragging.onDragEnd = this.onDragEnd.bind(this)

        this.updateTangents(a,b)

        // this.updateArcs(a, b)
        this.updateArcs2(a, b)
    }

    updateTangents(a,b){
        this.lineAA = PointList.from(a.tangent.aa(b)).cast()
        this.lineBB = PointList.from(a.tangent.bb(b)).cast()
        this.lineAB = PointList.from(a.tangent.ab(b)).cast()
        this.lineBA = PointList.from(a.tangent.ba(b)).cast()
    }

    updateArcs2(a, b){
        // this.c1 = calculateInnerArcTangents(a, b, this.rLength, 1)
        this.c1 = calculateConvexInnerArcTangents(a, b, this.rLength, 1)

        // this.c1 = calculateExternalArcTangents(a, b, this.rLength, 1)

    }

    updateArcs(a, b){
        this.c1 = calculateConcaveArcTangents(b, a, this.rLength, 0)
        this.c2 = calculateConcaveArcTangents(b, a, this.rLength, 1)

        this.c3 = calculateConcaveArcTangents(a, b, this.rLength, 0)
        this.c4 = calculateConcaveArcTangents(a, b, this.rLength, 1)

        // this.lineArcAB = PointList.from(this.c.ab).cast()

        // this.arcA = new Point(c.center.x,c.center.y, c.radius)
    }

    onDragMove(ev) {
        this.updateLines()
    }

    draw(ctx){
        this.clear(ctx)
        this.a.pen.circle(ctx, undefined, 'green', 2)
        this.b.pen.circle(ctx, undefined, 'green', 2)
        // this.lineAA.pen.line(ctx, {color:'#999', width: 3})
        // this.lineBB.pen.line(ctx, {color:'#4433DD', width: 3})
        // this.lineAB.pen.line(ctx, {color:'#DD6688', width: 3})
        // this.lineBA.pen.line(ctx, {color:'#DD6688', width: 3})
        // this.arcA.pen.indicator(ctx)

        this.drawArcUnit(ctx, this.c1, 'pink')
        this.drawArcUnit(ctx, this.c2, 'pink')

        this.drawArcUnit(ctx, this.c3, '#666')
        this.drawArcUnit(ctx, this.c4, '#666')

        // this.arcA.pen.indicator(ctx)

        // arc(x, y, radius, startAngle, endAngle, counterclockwise)
        // ctx.fillStyle = '#999'
        ctx.strokeStyle = '#AAA'
        if(this?.c1?.tangentA){
            Point.from(this.c1.tangentA).pen.indicator(ctx)
        }
    }

    drawArcUnit(ctx, c, color) {
        if(!c) {
            return
        }

        ctx.beginPath()
        if(color) {
            ctx.strokeStyle = color
        }
        ctx.arc(
                c.arcCenter.x,
                c.arcCenter.y,
                c.arcRadius,
                c.startAngle,
                c.endAngle,
                c.anticlockwise,
                )
        ctx.stroke()
    }

}

function yetanotherAnotherCalculateInternalArcTangents(pointA, pointB, filletRadius) {
  const { x: xA, y: yA, radius: rA } = pointA;
  const { x: xB, y: yB, radius: rB } = pointB;

  if (rA <= filletRadius || rB <= filletRadius) {
    throw new Error("Each circle’s radius must exceed the fillet radius for external arc tangents.");
  }

  // Helper radii (insetting the circles)
  const R1 = rA - filletRadius;
  const R2 = rB - filletRadius;

  // Distance between circle centers
  const dx = xB - xA, dy = yB - yA;
  const d = Math.hypot(dx, dy);
  if (d > R1 + R2 || d < Math.abs(R1 - R2)) {
    return null; // No intersection exists.
  }

  // Standard circle–circle intersection (for circles A(R1) and B(R2))
  const a = (R1 * R1 - R2 * R2 + d * d) / (2 * d);
  const h = Math.sqrt(R1 * R1 - a * a);
  // Base point along the line from A to B
  const baseX = xA + (a * dx) / d;
  const baseY = yA + (a * dy) / d;
  // Perpendicular unit vector to AB
  const ux = -dy / d, uy = dx / d;
  // Two candidate intersection points
  const candidate1 = { x: baseX + h * ux, y: baseY + h * uy };
  const candidate2 = { x: baseX - h * ux, y: baseY - h * uy };

  // For a candidate O, compute the tangency point on circle A:
  function computeTangent(O, center, r) {
    const vx = O.x - center.x, vy = O.y - center.y;
    const len = Math.hypot(vx, vy);
    return { x: center.x + (vx / len) * r, y: center.y + (vy / len) * r };
  }

  const tanA1 = computeTangent(candidate1, pointA, rA);
  const tanA2 = computeTangent(candidate2, pointA, rA);

  // The vector from A to B
  const ABx = xB - xA, ABy = yB - yA;
  function dot(vx, vy, wx, wy) { return vx * wx + vy * wy; }

  // For external fillet, the tangency on A must face away from B.
  const dot1 = dot(tanA1.x - xA, tanA1.y - yA, ABx, ABy);
  const dot2 = dot(tanA2.x - xA, tanA2.y - yA, ABx, ABy);

  // Choose the candidate that yields a negative dot product.
  let O;
  if (dot1 < 0 && dot2 >= 0) {
    O = candidate1;
  } else if (dot2 < 0 && dot1 >= 0) {
    O = candidate2;
  } else if (dot1 < 0 && dot2 < 0) {
    // If both are external, pick the one with the more negative dot product.
    O = (dot1 < dot2) ? candidate1 : candidate2;
  } else {
    // Fallback: if neither candidate gives a negative dot, external arc may not be defined.
    O = candidate1;
  }

  // With chosen O, compute the final tangency points.
  const tangentA = computeTangent(O, pointA, rA);
  const tangentB = computeTangent(O, pointB, rB);

  // The fillet (arc) circle is defined with center O and radius equal to filletRadius.
  const arcCenter = O;
  const arcRadius = filletRadius;

  // Compute angles from O to each tangency point.
  const angleA = Math.atan2(tangentA.y - O.y, tangentA.x - O.x);
  const angleB = Math.atan2(tangentB.y - O.y, tangentB.x - O.x);

  // To draw the external (major) arc, if the direct angular difference is less than π,
  // we instruct the drawing routine (e.g. canvas.arc) to sweep the long way.
  let delta = (angleB - angleA + 2 * Math.PI) % (2 * Math.PI);
  const anticlockwise = (delta < Math.PI);

  return {
    arcCenter,
    arcRadius,
    tangentA,
    tangentB,
    startAngle: angleA,
    endAngle: angleB,
    anticlockwise,
    circleA: pointA,
    circleB: pointB
  };
}



function yetAnotherCalculateInternalArcTangents(pointA, pointB, filletRadius) {
  // Unpack the circles.
  const { x: xA, y: yA, radius: rA } = pointA;
  const { x: xB, y: yB, radius: rB } = pointB;

  // Build the "helper" (offset) circles.
  // (For both internal and external fillets the helper circles use r + filletRadius.
  // The difference comes solely in which intersection is chosen.)
  const helperA = { x: xA, y: yA, radius: rA + filletRadius };
  const helperB = { x: xB, y: yB, radius: rB + filletRadius };

  // Compute the distance between centers.
  const dx = helperB.x - helperA.x;
  const dy = helperB.y - helperA.y;
  const d = Math.hypot(dx, dy);

  // Check that the helper circles intersect.
  if (d > helperA.radius + helperB.radius || d < Math.abs(helperA.radius - helperB.radius)) {
    return null;
  }

  // Compute the intersection points of the two helper circles.
  // Standard formulas:
  const a = (helperA.radius**2 - helperB.radius**2 + d*d) / (2 * d);
  const h = Math.sqrt(helperA.radius**2 - a*a);
  const xm = helperA.x + (a * dx) / d;
  const ym = helperA.y + (a * dy) / d;

  // Unit vector perpendicular to AB.
  const ux = -dy / d;
  const uy = dx / d;

  // The two candidate intersection points.
  const candidate1 = { x: xm + h * ux, y: ym + h * uy };
  const candidate2 = { x: xm - h * ux, y: ym - h * uy };

  // --- Choose the candidate that produces the external fillet ---
  // For each candidate O, compute the potential tangency on circle A.
  function tangentFromA(O) {
    const OA_dx = O.x - xA;
    const OA_dy = O.y - yA;
    const OA_dist = Math.hypot(OA_dx, OA_dy);
    return {
      x: xA + (OA_dx / OA_dist) * rA,
      y: yA + (OA_dy / OA_dist) * rA
    };
  }

  const tanA1 = tangentFromA(candidate1);
  const tanA2 = tangentFromA(candidate2);

  // The vector from A to B:
  const AB = { x: xB - xA, y: yB - yA };
  // Dot product helper.
  function dot(v1, v2) { return v1.x * v2.x + v1.y * v2.y; }

  // Compute dot products of (A → tangent) with (A → B).
  // For the *internal* (concave) fillet, the tangency on A lies roughly in the same direction as B (dot > 0).
  // For the *external* (convex) fillet, it should lie in the opposite direction (dot < 0).
  const dot1 = dot({ x: tanA1.x - xA, y: tanA1.y - yA }, AB);
  const dot2 = dot({ x: tanA2.x - xA, y: tanA2.y - yA }, AB);

  // Choose the candidate that gives a negative dot product.
  // (If both are negative, pick the one with the more negative value.)
  let O;
  if (dot1 < 0 && dot2 >= 0) {
    O = candidate1;
  } else if (dot2 < 0 && dot1 >= 0) {
    O = candidate2;
  } else if (dot1 < 0 && dot2 < 0) {
    O = (dot1 < dot2) ? candidate1 : candidate2;
  } else {
    // Neither candidate qualifies as external; fallback to candidate2.
    O = candidate2;
  }

  // --- Compute the final tangency points on the original circles ---
  // For circle A:
  const OA_dx = O.x - xA;
  const OA_dy = O.y - yA;
  const OA_dist = Math.hypot(OA_dx, OA_dy);
  const tangentA = {
    x: xA + (OA_dx / OA_dist) * rA,
    y: yA + (OA_dy / OA_dist) * rA
  };

  // For circle B:
  const OB_dx = O.x - xB;
  const OB_dy = O.y - yB;
  const OB_dist = Math.hypot(OB_dx, OB_dy);
  const tangentB = {
    x: xB + (OB_dx / OB_dist) * rB,
    y: yB + (OB_dy / OB_dist) * rB
  };

  // The external fillet arc is defined as the arc of the circle with center O and radius = filletRadius.
  // Compute the angles from O to the tangency points.
  const angleA = Math.atan2(tangentA.y - O.y, tangentA.x - O.x);
  const angleB = Math.atan2(tangentB.y - O.y, tangentB.x - O.x);

  // There are two arcs joining the points on the circle centered at O.
  // For an *external* fillet we want the major arc.
  // (When drawing with canvas.arc, setting anticlockwise to true draws the major arc if the direct sweep is less than π.)
  let delta = (angleB - angleA + 2 * Math.PI) % (2 * Math.PI);
  const anticlockwise = (delta < Math.PI);

  return {
    arcCenter: O,           // Center of the fillet arc (circle of radius filletRadius)
    arcRadius: filletRadius, // The fillet (arc) radius
    tangentA,               // Tangency point on circle A (external side)
    tangentB,               // Tangency point on circle B (external side)
    startAngle: angleA,      // Angle (radians) from O to tangentA
    endAngle: angleB,        // Angle (radians) from O to tangentB
    anticlockwise,          // Flag for drawing the major (external) arc
    circleA: { x: xA, y: yA, radius: rA },
    circleB: { x: xB, y: yB, radius: rB }
  };
}


function ANOTHERcalculateInternalArcTangents(pointA, pointB, filletRadius, side = 1) {
  // Unpack the original circles.
  const { x: xA, y: yA, radius: rA } = pointA;
  const { x: xB, y: yB, radius: rB } = pointB;

  // (Typically the circles should be large enough; here we assume no further check is needed.)

  // Build the helper (offset) circles.
  const helperA = { x: xA, y: yA, radius: rA + filletRadius };
  const helperB = { x: xB, y: yB, radius: rB + filletRadius };

  // Compute the distance between centers A and B.
  const dx = helperB.x - helperA.x;
  const dy = helperB.y - helperA.y;
  const d = Math.hypot(dx, dy);

  // The two helper circles must intersect.
  if (d > helperA.radius + helperB.radius || d < Math.abs(helperA.radius - helperB.radius)) {
    return null;
  }

  // Find the intersection points using the standard circle-circle intersection formulas.
  const aVal = (helperA.radius**2 - helperB.radius**2 + d*d) / (2 * d);
  const h = Math.sqrt(helperA.radius**2 - aVal*aVal);
  const xm = helperA.x + (aVal * dx) / d;
  const ym = helperA.y + (aVal * dy) / d;
  const rx = -dy * (h / d);
  const ry = dx * (h / d);

  const inter1 = { x: xm + rx, y: ym + ry };
  const inter2 = { x: xm - rx, y: ym - ry };

  // Decide which intersection to use.
  // For an _internal_ (concave) fillet you might choose the intersection lying between the circles.
  // For the _external_ (convex) fillet we choose the other intersection.
  // We use the cross product of AB and (candidate – A) to decide.
  const cross = dx * (inter1.y - helperA.y) - dy * (inter1.x - helperA.x);
  // (For internal fillet one might pick inter1 if cross ≥ 0; here we reverse that selection.)
  let O;
  if (side > 0) {
    O = (cross >= 0) ? inter2 : inter1;
  } else {
    O = (cross < 0) ? inter2 : inter1;
  }

  // O is the center of the fillet arc (which is a circle of radius filletRadius).
  // Compute the tangency points on the original circles.
  // They lie along the rays from each circle’s center toward O.
  const OA_dx = O.x - xA;
  const OA_dy = O.y - yA;
  const OA_dist = Math.hypot(OA_dx, OA_dy);
  const tangentA = {
    x: xA + (OA_dx / OA_dist) * rA,
    y: yA + (OA_dy / OA_dist) * rA
  };

  const OB_dx = O.x - xB;
  const OB_dy = O.y - yB;
  const OB_dist = Math.hypot(OB_dx, OB_dy);
  const tangentB = {
    x: xB + (OB_dx / OB_dist) * rB,
    y: yB + (OB_dy / OB_dist) * rB
  };

  // Now, the external fillet arc is the arc of the circle centered at O with radius filletRadius.
  // Compute the angles (in radians) from O to the tangency points.
  const angleA = Math.atan2(tangentA.y - O.y, tangentA.x - O.x);
  const angleB = Math.atan2(tangentB.y - O.y, tangentB.x - O.x);

  let delta = (angleB - angleA + 2 * Math.PI) % (2 * Math.PI);
  const anticlockwise = (delta < Math.PI);  // When true, the drawing routine (e.g. canvas.arc) will sweep 2π – delta.

  return {
    arcCenter: O,           // Center of the external fillet arc (circle of radius filletRadius)
    arcRadius: filletRadius, // The fillet (arc) radius
    tangentA,               // Tangency point on circle A (on its outer edge)
    tangentB,               // Tangency point on circle B (on its outer edge)
    startAngle: angleA,      // Angle from O to tangentA
    endAngle: angleB,        // Angle from O to tangentB
    anticlockwise,          // Flag so that drawing the arc yields the major (external) arc
    circleA: { x: xA, y: yA, radius: rA },
    circleB: { x: xB, y: yB, radius: rB }
  };
}


function calculateConvexInnerArcTangents(pointA, pointB, rOffset, side = 1) {
  const { x: xA, y: yA, radius: rA } = pointA;
  const { x: xB, y: yB, radius: rB } = pointB;

  // For convex (outer) arc tangents the original circles must be larger than the arc radius.
  if (rA <= rOffset || rB <= rOffset) {
    // debugger
    // throw new Error("For convex arc tangents, each circle's radius must exceed the arc offset.");
    return null
  }

  // Define the helper circles by subtracting rOffset.
  const newR_A = rA - rOffset;
  const newR_B = rB - rOffset;

  // Compute the distance between centers.
  const dx = xB - xA;
  const dy = yB - yA;
  const d = Math.hypot(dx, dy);

  // The helper circles (centers A and B with radii newR_A and newR_B) must intersect.
  if (d > newR_A + newR_B || d < Math.abs(newR_A - newR_B)) {
    return null;  // no valid convex arc exists.
  }

  // --- Find the intersections of the helper circles ---
  // aVal is the distance from A to the line joining the intersections.
  const aVal = (newR_A * newR_A - newR_B * newR_B + d * d) / (2 * d);
  const h = Math.sqrt(newR_A * newR_A - aVal * aVal);

  // The midpoint along the line from A to B.
  const xm = xA + (aVal * dx) / d;
  const ym = yA + (aVal * dy) / d;

  // The two intersection points are offset from the midpoint by (rx, ry).
  const rx = -dy * (h / d);
  const ry = dx * (h / d);

  const inter1 = { x: xm + rx, y: ym + ry };
  const inter2 = { x: xm - rx, y: ym - ry };

  // Choose one of the two intersections using the `side` parameter.
  const cross1 = dx * (inter1.y - yA) - dy * (inter1.x - xA);
  const O = (side > 0)
    ? (cross1 >= 0 ? inter1 : inter2)
    : (cross1 < 0 ? inter1 : inter2);

  // --- Compute the tangency points on the original circles ---
  // For circle A: O lies on its helper circle so that |A–O| = rA – rOffset.
  // The tangency point T is along the ray from A through O, but at distance rA.
  const OA_dx = O.x - xA;
  const OA_dy = O.y - yA;
  const OA_dist = Math.hypot(OA_dx, OA_dy);  // should equal (rA – rOffset)
  const tangentA = {
    x: xA + (OA_dx / OA_dist) * rA,
    y: yA + (OA_dy / OA_dist) * rA
  };

  // Similarly for circle B.
  const OB_dx = O.x - xB;
  const OB_dy = O.y - yB;
  const OB_dist = Math.hypot(OB_dx, OB_dy);  // should equal (rB – rOffset)
  const tangentB = {
    x: xB + (OB_dx / OB_dist) * rB,
    y: yB + (OB_dy / OB_dist) * rB
  };

  // --- Determine the arc parameters ---
  // The arc we want is the circle of radius rOffset centered at O.
  // Compute the angles from O to the tangency points.
  const angleA = Math.atan2(tangentA.y - O.y, tangentA.x - O.x);
  const angleB = Math.atan2(tangentB.y - O.y, tangentB.x - O.x);

  let delta = (angleB - angleA + 2 * Math.PI) % (2 * Math.PI);
  let anticlockwise;
  if (delta < Math.PI) {
    anticlockwise = true;
  } else {
    anticlockwise = false;
  }

  return {
    arcCenter: O,         // Center of the arc’s circle (radius = rOffset)
    arcRadius: rOffset,     // The arc’s radius (the fillet radius)
    tangentA,             // Tangency point on circle A (on its outer edge)
    tangentB,             // Tangency point on circle B (on its outer edge)
    startAngle: angleA,     // Angle (radians) at O to tangentA
    endAngle: angleB,       // Angle (radians) at O to tangentB
    anticlockwise,        // Flag to indicate drawing direction for canvas.arc
    circleA: { x: xA, y: yA, radius: rA },
    circleB: { x: xB, y: yB, radius: rB }
  };
}


function calculateConcaveArcTangents(pointA, pointB, rOffset, side = 1) {
  // Unpack circle A and B
  const { x: xA, y: yA, radius: rA } = pointA;
  const { x: xB, y: yB, radius: rB } = pointB;

  // Grown radii for the protractor circles:
  const R_A = rA + rOffset;
  const R_B = rB + rOffset;

  // Compute distance between centers A and B.
  const dx = xB - xA;
  const dy = yB - yA;
  const d = Math.hypot(dx, dy);

  // Check that the two circles intersect.
  // (They must satisfy: |R_A - R_B| ≤ d ≤ R_A + R_B)
  if (d > R_A + R_B || d < Math.abs(R_A - R_B)) {
    // No intersection exists.
    return null;
  }

  // Find the intersection of the two circles.
  // (See standard circle-circle intersection formulas.)
  const aVal = (R_A * R_A - R_B * R_B + d * d) / (2 * d);
  const h = Math.sqrt(R_A * R_A - aVal * aVal);

  // The midpoint (xm, ym) along the line from A to B at distance aVal from A:
  const xm = xA + (aVal * dx) / d;
  const ym = yA + (aVal * dy) / d;

  // The offsets from the midpoint to the intersection points:
  const rx = -dy * (h / d);
  const ry = dx * (h / d);

  // Two possible intersection points:
  const inter1 = { x: xm + rx, y: ym + ry };
  const inter2 = { x: xm - rx, y: ym - ry };

  // Choose one of the intersections based on the 'side' parameter.
  // (We use the cross product of AB and the vector from A to inter1.)
  const v1x = inter1.x - xA;
  const v1y = inter1.y - yA;
  const cross1 = dx * v1y - dy * v1x;

  let O;
  if (side > 0) {
    O = (cross1 >= 0) ? inter1 : inter2;
  } else {
    O = (cross1 < 0) ? inter1 : inter2;
  }

  // Now compute the tangent (contact) point on circle A.
  // This is the point along the line from A to O at a distance rA from A.
  const OA_dx = O.x - xA;
  const OA_dy = O.y - yA;
  const OA_dist = Math.hypot(OA_dx, OA_dy);
  const tangentA = {
    x: xA + (OA_dx / OA_dist) * rA,
    y: yA + (OA_dy / OA_dist) * rA
  };

  // Similarly, compute the tangent point on circle B.
  const OB_dx = O.x - xB;
  const OB_dy = O.y - yB;
  const OB_dist = Math.hypot(OB_dx, OB_dy);
  const tangentB = {
    x: xB + (OB_dx / OB_dist) * rB,
    y: yB + (OB_dy / OB_dist) * rB
  };

  // By construction:
  //    |O – A| = rA + rOffset  and  |O – tangentA| = rOffset,
  //    |O – B| = rB + rOffset  and  |O – tangentB| = rOffset.
  // Thus, the arc (of the circle centered at O with radius rOffset)
  // will pass through both tangentA and tangentB.

  // Compute the angles (in radians) at O to each tangent point.
  const angleA = Math.atan2(tangentA.y - O.y, tangentA.x - O.x);
  const angleB = Math.atan2(tangentB.y - O.y, tangentB.x - O.x);

  // When drawing an arc (e.g. with canvas.arc), you must decide on the sweep.
  // Here we choose the shorter (minor) arc between the two points.
  const delta = (angleB - angleA + 2 * Math.PI) % (2 * Math.PI);
  const anticlockwise = delta > Math.PI;

  return {
    arcCenter: O,         // center of the arc’s circle (of radius rOffset)
    arcRadius: rOffset,     // the arc’s radius
    tangentA,             // point on circle A (outer edge) where the arc touches
    tangentB,             // point on circle B (outer edge) where the arc touches
    startAngle: angleA,     // start angle at arcCenter for drawing the arc
    endAngle: angleB,       // end angle at arcCenter for drawing the arc
    anticlockwise,        // boolean flag for canvas.arc (true if drawing anticlockwise)
    circleA: { x: xA, y: yA, radius: rA },
    circleB: { x: xB, y: yB, radius: rB }
  };
}



function calculateInnerArcTangents(pointA, pointB, rOffset, side = 1) {
  // Unpack the two circles.
  const { x: xA, y: yA, radius: rA } = pointA;
  const { x: xB, y: yB, radius: rB } = pointB;

  // For outer arcs, each circle must be larger than the fillet radius.
  if (rA <= rOffset || rB <= rOffset) {
        // throw new Error("For outer arc tangents, each circle's radius must exceed the arc offset.");
        return
  }

  // Compute the "shrunk" radii.
  const R_A = rA - rOffset;
  const R_B = rB - rOffset;

  // Compute the distance between the centers A and B.
  const dx = xB - xA;
  const dy = yB - yA;
  const d = Math.hypot(dx, dy);

  // The two offset circles (A' and B') must intersect:
  //    |R_A - R_B| ≤ d ≤ R_A + R_B
  if (d > R_A + R_B || d < Math.abs(R_A - R_B)) {
    return null;  // no valid outer fillet exists.
  }

  // Compute the intersection(s) of the two offset circles.
  const aVal = (R_A * R_A - R_B * R_B + d * d) / (2 * d);
  const h = Math.sqrt(R_A * R_A - aVal * aVal);

  // Midpoint along the line from A to B (distance aVal from A):
  const xm = xA + (aVal * dx) / d;
  const ym = yA + (aVal * dy) / d;

  // Offsets for the intersection points:
  const rx = -dy * (h / d);
  const ry = dx * (h / d);

  // Two candidate intersection points.
  const inter1 = { x: xm + rx, y: ym + ry };
  const inter2 = { x: xm - rx, y: ym - ry };

  // Choose one of the intersection points based on the `side` parameter.
  // We use the sign of the cross product between AB and (candidate - A).
  const v1x = inter1.x - xA;
  const v1y = inter1.y - yA;
  const cross1 = dx * v1y - dy * v1x;

  let O;
  if (side > 0) {
    O = (cross1 >= 0) ? inter1 : inter2;
  } else {
    O = (cross1 < 0) ? inter1 : inter2;
  }

  // With O determined, compute the tangency point on circle A.
  // For outer tangency the condition is |OA| = rA - rOffset.
  // The contact point on circle A is along the ray from A to O, but extended so that the
  // distance from A is rA. That is:
  //    tangentA = A + (rA/(rA - rOffset)) * (O - A)
  const OA_dx = O.x - xA;
  const OA_dy = O.y - yA;
  const OA_dist = Math.hypot(OA_dx, OA_dy); // should equal rA - rOffset

  const tangentA = {
    x: xA + (OA_dx / OA_dist) * rA,
    y: yA + (OA_dy / OA_dist) * rA
  };

  // Similarly, compute the tangency point on circle B.
  const OB_dx = O.x - xB;
  const OB_dy = O.y - yB;
  const OB_dist = Math.hypot(OB_dx, OB_dy); // should equal rB - rOffset

  const tangentB = {
    x: xB + (OB_dx / OB_dist) * rB,
    y: yB + (OB_dy / OB_dist) * rB
  };

  // The circle of the outer arc has center O and radius rOffset.
  // Compute the angles (in radians) from O to each tangency point.
  const angleA = Math.atan2(tangentA.y - O.y, tangentA.x - O.x);
  const angleB = Math.atan2(tangentB.y - O.y, tangentB.x - O.x);

  // When drawing an arc (for example, with canvas.arc) you must decide on the sweep.
  // Here we choose the minor (shorter) arc between the two tangency points.
  let delta = (angleB - angleA + 2 * Math.PI) % (2 * Math.PI);
  // If the sweep is larger than half a circle, reverse the drawing direction.
  const anticlockwise = delta > Math.PI;

  return {
    arcCenter: O,         // Center of the outer fillet arc (circle with radius rOffset)
    arcRadius: rOffset,     // The fillet arc's radius
    tangentA,             // Tangency point on circle A (outer edge)
    tangentB,             // Tangency point on circle B (outer edge)
    startAngle: angleA,     // Start angle (from O) for drawing the arc
    endAngle: angleB,       // End angle (from O) for drawing the arc
    anticlockwise,        // Boolean flag for drawing direction (e.g. canvas.arc)
    circleA: { x: xA, y: yA, radius: rA },
    circleB: { x: xB, y: yB, radius: rB }
  };
}



function calculateArcTangentCenter(pointA, pointB, arcLength, side = 1) {
  const { x: x1, y: y1 } = pointA;
  const { x: x2, y: y2 } = pointB;

  // Chord between the points.
  const dx = x2 - x1, dy = y2 - y1;
  const d = Math.hypot(dx, dy);

  if (arcLength <= d) {
    // throw new Error("Arc length must be greater than the chord length between points.");
    return null
  }

  // Determine whether the desired arc is the minor or major arc.
  // For a minor arc through A and B: chord d = 2R sin(θ/2) with θ in (0, π).
  // Its arc length is L = Rθ, so the maximum minor arc length is when θ = π:
  //   L_minor_max = R * π, but also d = 2R so L_minor_max = (π/2)*d.
  // Thus, if arcLength <= (π/2)*d, we'll solve for θ in (0, π);
  // otherwise, we are working with the major arc (θ in (π, 2π)).
  const isMinor = arcLength <= (Math.PI * d) / 2;

  // Set bounds for θ depending on whether we want the minor or major arc.
  let thetaMin, thetaMax;
  if (isMinor) {
    thetaMin = 1e-6;    // cannot use 0 exactly
    thetaMax = Math.PI; // minor arc: θ ∈ (0, π)
  } else {
    thetaMin = Math.PI;       // major arc: θ ∈ (π, 2π)
    thetaMax = 2 * Math.PI - 1e-6;
  }

  // Solve for θ using bisection. We want to find θ such that:
  //    f(θ) = (d * θ) / (2 * sin(θ/2)) - arcLength = 0.
  const tol = 1e-8;
  let theta;
  for (let i = 0; i < 100; i++) {
    theta = (thetaMin + thetaMax) / 2;
    const denom = Math.sin(theta / 2);
    if (Math.abs(denom) < 1e-8) break; // safeguard (should not occur)
    const fTheta = (d * theta) / (2 * denom) - arcLength;
    if (Math.abs(fTheta) < tol) break;
    // For the minor arc, f(θ) is negative for small θ (since f(θ) ~ d - arcLength)
    // and becomes positive near θ = π (if arcLength < (π/2)*d). Thus:
    if (fTheta > 0) {
      // θ is too high for a minor arc; lower the upper bound.
      // (For the major arc the roles are reversed.)
      if (isMinor) {
        thetaMax = theta;
      } else {
        thetaMin = theta;
      }
    } else {
      if (isMinor) {
        thetaMin = theta;
      } else {
        thetaMax = theta;
      }
    }
  }

  // With the found θ, compute the radius:
  const R = arcLength / theta;

  // The distance from the chord’s midpoint to the circle’s center is:

  const h = Math.sqrt(R * R - (d / 2) * (d / 2));

  // Find the midpoint of A and B.
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;

  // The unit vector perpendicular to AB.
  const ux = -dy / d;
  const uy = dx / d;

  // The circle’s center is the midpoint shifted by h in one of the two perpendicular directions.
  const cx = mx + side * ux * h;
  const cy = my + side * uy * h;

  // Determine start and end angles (in radians) from the center.
  const startAngle = Math.atan2(y1 - cy, x1 - cx);
  const endAngle   = Math.atan2(y2 - cy, x2 - cx);

  // When using canvas.arc() you must choose a direction.
  // (The correct flag depends on which arc you want drawn; here we choose based on whether
  //  we solved for the minor or major arc.)
  let counterclockwise;
  {
    // Compute the absolute difference in angles modulo 2π.
    let delta = ((endAngle - startAngle) + 2 * Math.PI) % (2 * Math.PI);
    if (isMinor) {
      // For the minor arc, the swept angle should equal θ.
      counterclockwise = delta > theta;
    } else {
      // For the major arc, the sweep is 2π - θ.
      counterclockwise = delta < (2 * Math.PI - theta);
    }
  }

  return {
    center: { x: cx, y: cy },
    radius: R,
    startAngle: startAngle,
    endAngle: endAngle,
    counterclockwise: counterclockwise,
    arcAngle: theta
  };
}



stage = MainStage.go()