/*
title: Chord Rect
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/math.js
    ../point_src/extras.js
    ../point_src/point-content.js
    ../point_src/pointlist.js
    ../point_src/pointlistpen.js
    ../point_src/point.js
    ../point_src/stage.js
    mouse
    dragging
    stroke
    ../point_src/random.js
---

 */

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



class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.point = new Point({x: 250, y: 150 , radius: 20, rotation: 45})

        this.topLeft = new Point({x: 20, y: 40 , radius: 10})
        this.bottomRight = new Point({x: 500, y: 300 , radius: 10})

        this.dragging.add(this.point, this.topLeft, this.bottomRight)
    }

    onMousedown(ev) {
        // this.iPoint.rotation = random.int(180)
    }
    draw(ctx){
        this.clear(ctx)
        let p = this.point
        let tl = this.topLeft
        tl.pen.indicator(ctx)
        let br = this.bottomRight
        br.pen.indicator(ctx)

        let ps = rectChordEndpoints(this.topLeft, this.bottomRight, p)//, p.radians)

        ps = PointList.from(ps).cast()
        // let ps = rectChordEndpoints(20, 500, 40, 300, p[0], p[1], p.radians)
        ps.pen.fill(ctx, {color: 'purple'})
        // ps.forEach(p=> (new Point(p)).pen.fill(ctx, {color: 'purple'}))
        ps[0]?.pen.line(ctx, ps[1], 'purple')
        this.point.pen.indicator(ctx)

    }
}


console.log('chord');


stage = MainStage.go(/*{ loop: true }*/)
