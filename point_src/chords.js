

function chordEndpoints2(point, chordPoint, chordPoint2, radians) {
      // Circle center: (px, py)
      // Radius: chordPoint.radius
      // Chord reference point: (cx, cy)
      // Angle of chord direction: ca (in radians)
      let px = point.x
        , py = point.y
        , R = point.radius
        , cx = chordPoint.x
        , cy = chordPoint.y
        , ca = chordPoint2? chordPoint.directionTo(chordPoint2): chordPoint.radians
        ;

      /* Remove for covergent chords*/
      if(radians != undefined) {
          ca = radians
      }
      // direction from angle
      const dxAngle = Math.cos(ca);
      const dyAngle = Math.sin(ca);

      // define d_x, d_y
      const dx = cx - px;
      const dy = cy - py;

      // Quadratic coefficients for t^2 + B t + C = 0
      const A = 1;  // because dxAngle^2 + dyAngle^2 = 1
      const B = 2 * (dx * dxAngle + dy * dyAngle);
      const C = (dx * dx) + (dy * dy) - (R * R);

      // Discriminant
      const discriminant = B*B - 4*A*C;

      if(discriminant < 0) {
        // no real intersections -> no chord
        return null;  // or []
      }

      // solve t values
      const sqrtD = Math.sqrt(discriminant);
      const t1 = (-B + sqrtD) / (2 * A);
      const t2 = (-B - sqrtD) / (2 * A);

      // endpoints
      const x1 = cx + t1 * dxAngle;
      const y1 = cy + t1 * dyAngle;
      const x2 = cx + t2 * dxAngle;
      const y2 = cy + t2 * dyAngle;

      return [
            { x: x1, y: y1 },
            { x: x2, y: y2 }
      ];
}



function rectChordEndpoints(
  // rectLeft, rectRight, rectBottom, rectTop,
  topLeft, bottomRight, chordPoint,
  // P_x, P_y,
  angleRad
) {
    // let ps = rectChordEndpoints(tl.x, br.x, tl.y, br.y, p[0], p[1], p.radians)
    let rectLeft = topLeft.x
      , rectRight = bottomRight.x
      , rectBottom = topLeft.y
      , rectTop = bottomRight.y
      , P_x = chordPoint.x
      , P_y = chordPoint.y
      ;

    if(angleRad == undefined) {
        angleRad = chordPoint.radians
    }

    // direction vector from angle
    const dx = Math.cos(angleRad);
    const dy = Math.sin(angleRad);

    // We'll accumulate intersection points in an array
    const intersections = [];

    // Helper to check if y is in [rectBottom, rectTop]
    function inRangeY(val) {
        return val >= rectBottom && val <= rectTop;
    }

    // Helper to check if x is in [rectLeft, rectRight]
    function inRangeX(val) {
        return val >= rectLeft && val <= rectRight;
    }

    // 1) Left edge => x(t) = rectLeft => solve for t
    if (dx !== 0) {
        const tLeft = (rectLeft - P_x) / dx;
        const yLeft = P_y + tLeft * dy;
        if (inRangeY(yLeft)) {
            intersections.push({
                t: tLeft,
                x: rectLeft,
                y: yLeft
            });
        }
    }

    // 2) Right edge => x(t) = rectRight => solve for t
    if (dx !== 0) {
        const tRight = (rectRight - P_x) / dx;
        const yRight = P_y + tRight * dy;
        if (inRangeY(yRight)) {
            intersections.push({
                t: tRight,
                x: rectRight,
                y: yRight
            });
        }
    }

    // 3) Bottom edge => y(t) = rectBottom => solve for t
    if (dy !== 0) {
        const tBottom = (rectBottom - P_y) / dy;
        const xBottom = P_x + tBottom * dx;
        if (inRangeX(xBottom)) {
            intersections.push({
                t: tBottom,
                x: xBottom,
                y: rectBottom
            });
        }
    }

    // 4) Top edge => y(t) = rectTop => solve for t
    if (dy !== 0) {
        const tTop = (rectTop - P_y) / dy;
        const xTop = P_x + tTop * dx;
        if (inRangeX(xTop)) {
            intersections.push({
                t: tTop,
                x: xTop,
                y: rectTop
            });
        }
    }

    // Now we have up to 4 potential intersections.
    // Typically, we'll have at most 2 valid (unique) points for a proper chord.
    // Filter out duplicates (corner hits can appear in two edges)
    // and sort by parameter t if needed.

    // Remove duplicates (within some small epsilon)
    const epsilon = 1e-9;
    const uniqueIntersections = [];
    for (let i = 0; i < intersections.length; i++) {
        const pt = intersections[i];
        let isDuplicate = false;
        for (let j = 0; j < uniqueIntersections.length; j++) {
            const stored = uniqueIntersections[j];
            if (
                Math.abs(pt.x - stored.x) < epsilon &&
                Math.abs(pt.y - stored.y) < epsilon
            ) {
                isDuplicate = true;
                break;
            }
        }
        if (!isDuplicate) {
            uniqueIntersections.push(pt);
        }
    }

    // Sort them by t
    uniqueIntersections.sort((a, b) => a.t - b.t);

    // Return them in a small array. Possibly 0, 1, or 2 points:
    return uniqueIntersections;
}


