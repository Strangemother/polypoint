/*
---
title: Arc Three Point.
categories:
    arc
    angles
files:
    head
    stroke
    ../point_src/point-content.js
    pointlist
    point
    ../point_src/protractor.js
    mouse
    dragging
    ../point_src/functions/clamp.js
    stage
    ../point_src/angle.js
    ../point_src/text/label.js
    ../point_src/arc.js
    ../point_src/protractor.js
---

Draw an arc to another point _through_ a third point.

*/

// aa = new Angle(20, 'tau')
// ab = new Angle(20).tau


class MainStage extends Stage {
    canvas='playspace'

    mounted(){
        this.centerPoint = new Point({x:200, y:150, radius: 20, color: '#666'})
        this.fromPoint = new Point({x:100, y:300})
        this.toPoint = new Point({x:950, y:300})
        this.dragging.addPoints(this.centerPoint, this.fromPoint, this.toPoint)
        this.size = 6_378_000 //713_000 // 845_000
        this.size = 713_000 // 845_000
    }

    draw(ctx){
        this.clear(ctx)

        ctx.fillStyle = '#555'

        this.centerPoint.pen.circle(ctx, undefined, '#555')
        // this.centerPoint.pen.line(ctx, undefined, 'red')
        this.fromPoint.pen.indicator(ctx, {color: 'red'})
        this.toPoint.pen.indicator(ctx)

        ctx.strokeStyle = '#555'
        // this.fromPoint.pen.line(ctx, this.toPoint, {color: '#666'})
        ctx.strokeStyle = 'orange'
        // this.drawF(ctx)

        const earthRadius = this.size; // scale to pixels if needed
        let from = this.fromPoint;
        let to = this.toPoint;

        let bulge = visualBulge(from, to, earthRadius)
        if (bulge > 0.25) {
            // draw the arc (use previous code)
            ctx.strokeStyle = 'red'
            this.drawH(ctx)
        } else {
            // draw a straight line
            ctx.strokeStyle = 'orange'
            ctx.beginPath();
            ctx.moveTo(this.fromPoint.x, this.fromPoint.y);
            ctx.lineTo(this.toPoint.x, this.toPoint.y);
            ctx.stroke();
        }
    }

    drawG(ctx) {
        const earthRadius = this.size; // in meters, or pixels if scaled
        let from = this.fromPoint;
        let to = this.toPoint;

        const arcCenter = getEarthArcCenter(from, to, earthRadius);
        if (!arcCenter) return;

        // let startRadians = Math.atan2(from.y - arcCenter.cy, from.x - arcCenter.cx);
        // let toRadians = Math.atan2(to.y - arcCenter.cy, to.x - arcCenter.cx);

        let start = Math.atan2(from.y - arcCenter.cy, from.x - arcCenter.cx);
        let end   = Math.atan2(to.y   - arcCenter.cy, to.x   - arcCenter.cx);

        // Ensure we always draw the minor arc (shortest path)
        let angleDiff = (end - start + Math.PI * 2) % (Math.PI * 2);
        if (angleDiff > Math.PI) {
            [start, end] = [end, start]; // swap to go the shorter way
        }

        // Calculate smallest angular difference
        let delta = (end - start + Math.PI * 2) % (Math.PI * 2);
        const anticlockwise = delta > Math.PI; // use CCW if the CW path is longer

        ctx.beginPath();
        ctx.arc(arcCenter.cx, arcCenter.cy, arcCenter.radius, start, end, anticlockwise);
        // ctx.arc(arcCenter.cx, arcCenter.cy, arcCenter.radius, startRadians, toRadians, 1);
        ctx.stroke();

    }

    drawH(ctx){
        function normalizeAngle(angle) {
          return (angle + Math.PI * 2) % (Math.PI * 2);
        }

        const earthRadius = 6_378_000; // scale to pixels if needed
        let from = this.fromPoint;
        let to = this.toPoint;
        // const earthRadius = 6378000; // meters
        const observerHeight = 10; // e.g. 10km up

        const arcRadius = getVisibleHorizonRadius(this.size, observerHeight);

        // Plug arcRadius into your getEarthArcCenter function
        const arcCenter = getEarthArcCenter(from, to, earthRadius);

        // const arcCenter = getEarthArcCenter(from, to, this.size, );
        if (!arcCenter) return;

        let start = Math.atan2(from.y - arcCenter.cy, from.x - arcCenter.cx);
        let end   = Math.atan2(to.y - arcCenter.cy, to.x - arcCenter.cx);

        start = normalizeAngle(start);
        end   = normalizeAngle(end);

        // Calculate angular difference
        let sweep = (end - start + Math.PI * 2) % (Math.PI * 2);
        let anticlockwise = false;

        if (sweep > Math.PI) {
          anticlockwise = true;
        }

        // If start and end are the same (colinear points), don't draw
        if (Math.abs(sweep) < 1e-6 || Math.abs(sweep - 2 * Math.PI) < 1e-6) {
          // Nothing to draw
          return;
        }

        ctx.beginPath();
        ctx.arc(arcCenter.cx, arcCenter.cy, arcCenter.radius, start, end, anticlockwise);
        ctx.stroke();

    }
    drawF(ctx){

        let cap = this.toPoint.arc.to(this.fromPoint, this.centerPoint)

        ctx.beginPath();
        ctx.arc(cap.cx, cap.cy, cap.radius, cap.startRadians, cap.toRadians);
        ctx.stroke();

        ctx.fillStyle = '#ddd'
        this.centerPoint.text.string(ctx, ~~cap.radius)
    }
}


function visualBulge(from, to, radius) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const d  = Math.hypot(dx, dy);
    if (d === 0 || d > 2*radius) return 0;
    return radius - Math.sqrt(radius * radius - (d/2)*(d/2));
}

/**
 * Returns the radius of the visible horizon arc beneath you,
 * as if you are at observerHeight above the Earth's surface.
 *
 * @param {number} earthRadius (meters)
 * @param {number} observerHeight (meters above surface)
 * @returns {number} (arc radius, meters)
 */
function getVisibleHorizonRadius(earthRadius, observerHeight) {
    if (observerHeight <= 0) return earthRadius; // On the ground
    return ((earthRadius + observerHeight) * (earthRadius + observerHeight)) / (2 * observerHeight);
}

function getEarthArcCenter(fromPoint, toPoint, earthRadius) {
    const dx = toPoint.x - fromPoint.x;
    const dy = toPoint.y - fromPoint.y;
    const d = Math.hypot(dx, dy);
    if (d > 2 * earthRadius) return null;

    const mx = (fromPoint.x + toPoint.x) / 2;
    const my = (fromPoint.y + toPoint.y) / 2;
    const h = Math.sqrt(earthRadius * earthRadius - (d / 2) * (d / 2));

    const ux = -dy / d;
    const uy = dx / d;

    // pick the one below the line (assuming y increases downward)
    const cx = mx + ux * h;
    const cy = my + uy * h;

    return { cx, cy, radius: earthRadius };
}

// function getEarthArcCenter(fromPoint, toPoint, earthRadius, observerHeight) {
//     const R = earthRadius + observerHeight;  // total radius at eye level
//     const dx = toPoint.x - fromPoint.x;
//     const dy = toPoint.y - fromPoint.y;
//     const d = Math.hypot(dx, dy);

//     if (d > 2 * R) return null;

//     const mx = (fromPoint.x + toPoint.x) / 2;
//     const my = (fromPoint.y + toPoint.y) / 2;
//     const h = Math.sqrt(R * R - (d / 2) * (d / 2));

//     const ux = -dy / d;
//     const uy = dx / d;

//     // Center is now 'below' the chord, at the greater radius
//     const cx = mx + ux * h;
//     const cy = my + uy * h;

//     return { cx, cy, radius: R };
// }

/**
 * Given two 2D points on a flat projection (in meters) and
 * an observer-height h (in meters), return the circle (cx,cy,r)
 * whose sag below the observer's eye-level matches the true
 * Earth curvature between those points.
 *
 * @param {{x:number,y:number}} P1  ground-coords in meters
 * @param {{x:number,y:number}} P2
 * @param {number} h  observer height above ground [m]
 * @returns {{cx:number, cy:number, radius:number} | null}
 *          null if points are farther apart than the horizon
 */
function getEarthArc(P1, P2, h) {
      const R = 6_378_000;          // mean Earth radius [m]
      const R2 = R + h;             // sphere radius at eye-level

      // 1) chord length
      const dx = P2.x - P1.x;
      const dy = P2.y - P1.y;
      const d  = Math.hypot(dx, dy);
      if (d === 0) return null;

      // 2) check horizon
      const dHorizon = Math.sqrt(R2*R2 - R*R);
      if (d > dHorizon) return null;  // beyond visible horizon

      // 3) sagitta (drop below tangent plane at height h)
      const s = R2 - Math.sqrt(R2*R2 - d*d);
      if (s <= 0) return null;        // essentially flat

      // 4) circle radius for that sagitta
      const r = (d*d) / (8*s) + (s/2);

      // 5) chord midpoint
      const mx = (P1.x + P2.x) / 2;
      const my = (P1.y + P2.y) / 2;

      // 6) unit-normal to chord (pick the downward normal)
      const ux = -dy / d;
      const uy =  dx / d;

      // 7) center is = (r – s) along that normal from midpoint
      const offset = r - s;
      const cx = mx + ux * offset;
      const cy = my + uy * offset;

      return { cx, cy, radius: r };
}


;stage = MainStage.go();