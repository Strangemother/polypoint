/*
title: Circle Chords
files:
    head
    ../point_src/math.js
    ../point_src/extras.js
    ../point_src/point-content.js
    pointlist
    point
    stage
    mouse
    dragging
    stroke
    ../point_src/random.js
---


There are a range of elements to consider for a chord.

+ chord: A line drawn within a circle, edge to edge, equidistant from the center.
+ _segment_: A chord - but non-equidistant. where the points are _anywhere_ around the edge.
+ sagitta: The midpoint project to the edge of the (inside) circle.
+ secant: An extended (to infinite) chord, through two points
+ tangent: A line extended to infinite, touching the outside the circle
 */
class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.point = new Point({x: 250, y: 150 , radius: 100})
        this.iPoint = new Point({x: 250, y: 150 , radius: 10, rotation: 33})
        this.iPoint2 = new Point({x: 250, y: 250 , radius: 10, rotation: 3})
        this.dragging.add(this.point, this.iPoint, this.iPoint2)
    }

    onMousedown(ev) {
        this.iPoint.rotation = random.int(180)
    }
    draw(ctx){
        this.clear(ctx)

        let p = this.point;
        let chord = this.iPoint
        let chord2 = this.iPoint2
        // chord.xy = this.mouse.point.xy
        chord.pen.indicator(ctx)
        chord2.pen.indicator(ctx)
        let r = chordEndpoints2(p, chord)//, chord2)
        // let r =  chordEndpoints(p, chord)
        // let r =  chordEndpointsRaw(p.x, p.y, p.radius, chord.x, chord.y, chord.radians)
        if(r) {
            r.forEach(d=>{
                (new Point(d)).pen.indicator(ctx)
            });

            (new Point(r[0])).pen.line(ctx, r[1], 'red')
        }

        let spacing = chord.radius
        let count = 10

        gOffsetValue += .2;
        if(gOffsetValue >= spacing) {
            gOffsetValue = 0
        }

        let offset = {x: -(gOffsetValue % spacing), y: -(gOffsetValue % spacing)};

        let pls = generateParallelChordsAutoCountParallel(p, chord, chord2, spacing, offset, true)
        // let pls = generateParallelChordsAutoCountParallel(p, chord, undefined, spacing, offset, true)
        // let pls = generateParallelChordsAutoCountParallel(p, chord, chord2, spacing, offset, false)
        // let pls = generateParallelChordsAutoCountParallel(p, chord, undefined, spacing, offset, false)
        // let pls = generateParallelChordsAutoCountParallel(p, chord, chord2, 10, offset, true, false)
        // let pls = generateParallelChordsAutoCountParallel(p, chord, chord2, spacing, offset, true, false)

        /* _within_ the control point */
        // let pls = generateParallelChordsAutoCountOffset(p, chord, undefined, spacing * .3)
        // let pls = generateParallelChordsAutoCountOffset(p, chord, undefined, 10)
        // let pls = generateParallelChordsAutoCountOffset(p, chord, chord2, 10)
        // let pls = generateParallelChordsAutoCountOffset(p, chord, chord2, 10, false)

        /*  manual count*/
        // let pls = generateParallelChords(p, chord, undefined, spacing, count)
        // let pls = generateParallelChords(p, chord, chord2, spacing, count)

        pls.forEach(pair=>{
            (new Point(pair[0])).pen.line(ctx, pair[1], 'green')
            // pair.forEach(d=>{
            // })
        });

        this.point.pen.indicator(ctx)

    }
}

/**
 * Generates parallel chords automatically covering the circle.
 *
 * @param {Object} circleCenter  - { x, y, radius }
 * @param {Object} chordPoint    - { x, y, radians, ... }
 * @param {Object|null} chordPoint2 - Optional second chord reference
 * @param {number} spacing       - Distance between parallel chords
 *
 * @returns {Array<Array<{x:number, y:number}>>}
 *   A list of chord endpoints. Each chord is an array of two points.
 */

console.log('chord');

/**
 * Generates parallel chords that always include a chord through `chordPoint`.
 * The count is automatically derived from (circle radius / spacing).
 *
 * @param {Object} circle - { x, y, radius }   Center + radius
 * @param {Object} chordPoint - { x, y, radians, directionTo, radius }
 *   - `chordPoint.radius` is assumed to be the circle radius here.
 *   - `chordPoint.radians` is the base chord angle.
 * @param {Object|null} chordPoint2
 *   - If provided, we take the chord angle from chordPoint.directionTo(chordPoint2).
 * @param {number} spacing - The distance between parallel chords
 * @returns {Array<Array<{ x:number, y:number }>>} - Array of chords (each chord = two points)
 */
function generateParallelChordsAutoCountOffset(circle, chordPoint, chordPoint2, spacing, parallel=true) {
  // 1) Extract center + radius
  const { x: px, y: py } = circle;
  const R = chordPoint.radius; // or circle.radius if needed

  // 2) Determine the chord's base angle and its perpendicular
  const baseAngle = chordPoint2
    ? chordPoint.directionTo(chordPoint2)
    : chordPoint.radians;
  const perpAngle = baseAngle + Math.PI / 2;

  // 3) Compute how many parallel lines we want on each side of chordPoint
  //    so that we cover from the center out to ± the circle radius.
  //    (You may choose Math.ceil if you want to ensure coverage out to edges)
  const halfCount = Math.floor(R / spacing);

  // 4) The offset of chordPoint from the circle center, **projected** onto
  //    the perpendicular direction. This ensures the chord at i=0
  //    lines up exactly with chordPoint’s own chord.
  const dx = chordPoint.x - px;
  const dy = chordPoint.y - py;
  const offsetFromCenter = dx * Math.cos(perpAngle) + dy * Math.sin(perpAngle);

  // 5) Build chords in the range i = -halfCount..+halfCount
  //    so that i=0 corresponds exactly to chordPoint
  const chords = [];
  for (let i = -halfCount; i <= halfCount; i++) {
    // offset for this i
    const offset = offsetFromCenter + i * spacing;

    // compute the chord reference point for this offset
    const refX = px + offset * Math.cos(perpAngle);
    const refY = py + offset * Math.sin(perpAngle);

    const offsetChordPoint = {
      x: refX,
      y: refY,
      radians: baseAngle,
      directionTo: chordPoint.directionTo, // if needed
      // If your chordEndpoints2 depends on chordPoint.radius, pass it:
      radius: chordPoint.radius
    };

    let parallelAngle = undefined
    if(parallel) {
        parallelAngle = baseAngle
    }
    // 6) Use chordEndpoints2 to get chord endpoints
    //    If it returns null, that offset doesn't intersect the circle.
    const chord = chordEndpoints2(circle, offsetChordPoint, chordPoint2, parallelAngle);
    if (chord) {
      chords.push(chord);
    }
  }

  return chords;
}

var gOffsetValue = 0

function generateParallelChordsAutoCountParallel(circleCenter, chordPoint, chordPoint2, spacing, offset, forceOverlay=false, parallel=true) {
  // 1) Compute how many chords needed to cover the circle
  const R = circleCenter.radius;
  const halfCount = Math.ceil(R / spacing);
  // const halfCount = Math.floor(R / spacing);
  const count = 2 * halfCount + 1;

  // 2) Determine the base chord direction
  const baseAngle = chordPoint2
      ? chordPoint.directionTo(chordPoint2)
      : chordPoint.radians;
  const perpAngle = baseAngle + Math.PI / 2;
  let offsetAddX = offset.x * Math.cos(perpAngle)
  let offsetAddY = offset.y * Math.sin(perpAngle)
  // 3) Generate chords for offsets from -halfCount to +halfCount
  const chords = [];
  for (let i = -halfCount; i <= halfCount; i++) {
    const offsetX = (i * spacing * Math.cos(perpAngle)) + offsetAddX;
    const offsetY = (i * spacing * Math.sin(perpAngle)) + offsetAddY;
    let cox = forceOverlay? circleCenter.x: chordPoint.x
    let coy = forceOverlay? circleCenter.y: chordPoint.y
    // "Shifted" chord reference point
    // const { x: px, y: py } = circleCenter;
    const offsetChordPoint = {
      x: cox + offsetX,
      y: coy + offsetY,
      // radians: chordPoint.radians,        // Or keep the same orientation
      directionTo: chordPoint.directionTo // (Assuming your chordPoint has this)
    };

    let parallelAngle = undefined
    if(parallel) {
        parallelAngle = baseAngle
    }

    // Use your existing chordEndpoints2 function
    const chord = chordEndpoints2(circleCenter, offsetChordPoint, chordPoint2, parallelAngle);
    if (chord) {
      chords.push(chord);
    }
  }

  return chords;
}


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
      // Step 1: direction from angle
      const dxAngle = Math.cos(ca);
      const dyAngle = Math.sin(ca);

      // Step 2: define d_x, d_y
      const dx = cx - px;
      const dy = cy - py;

      // Quadratic coefficients for t^2 + B t + C = 0
      const A = 1;  // because dxAngle^2 + dyAngle^2 = 1
      const B = 2 * (dx * dxAngle + dy * dyAngle);
      const C = (dx * dx) + (dy * dy) - (R * R);

      // Discriminant
      const discriminant = B*B - 4*A*C;

      if (discriminant < 0) {
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

/**
 * Returns an array of chords (each chord is a two-point array).
 *
 * @param {Object} circleCenter
 *   The circle's "point" object with { x, y, radius }.
 *
 * @param {Object} chordPoint
 *   An object with { x, y, radians, directionTo(...) }
 *   or a similar structure.  This is the *base* chord reference.
 *
 * @param {Object|null} chordPoint2
 *   Optional second chord reference used to find chord direction.
 *   If chordPoint2 is given, direction = chordPoint.directionTo(chordPoint2),
 *   else it uses `chordPoint.radians`.
 *
 * @param {number} spacing
 *   Distance between parallel chords
 *
 * @param {number} count
 *   How many chords total to attempt (the function will produce up
 *   to `count` chords, but some might fall completely outside the circle
 *   and be skipped if `chordEndpoints2` returns null).
 *
 * @returns {Array<Array<{ x:number, y:number }>>}
 *   A list of chords, where each chord is an array of two points:
 *   [ {x1, y1}, {x2, y2} ]
 */
function generateParallelChords(circleCenter, chordPoint, chordPoint2, spacing, count) {
  const chords = [];

  // 1) Determine the base chord direction in radians
  const baseAngle = chordPoint2? chordPoint.directionTo(chordPoint2): chordPoint.radians;

  // 2) The perpendicular direction
  const perpAngle = baseAngle + Math.PI / 2;

  // We'll offset around 0. E.g. if count=11, i goes from -5..5
  // so that we have a symmetrical distribution around the base chord
  const half = Math.floor(count / 2);

  for (let i = -half; i <= half; i++) {
    // 3) Calculate the offset in the perpendicular direction
    const offsetX = i * spacing * Math.cos(perpAngle);
    const offsetY = i * spacing * Math.sin(perpAngle);

    // 4) Build a "shifted" chordPoint
    const offsetChordPoint = {
      // Original chordPoint’s x,y plus offset
      x: chordPoint.x + offsetX,
      y: chordPoint.y + offsetY,

      // Retain the other relevant fields
      radians: chordPoint.radians,
      directionTo: chordPoint.directionTo, // or replicate logic

      // Not strictly necessary if chordEndpoints2 just uses point.radius,
      // but if your chordPoint also has a radius or other fields, pass them along
      radius: chordPoint.radius
    };

    // 5) Use chordEndpoints2 to get chord endpoints
    const chord = chordEndpoints2(circleCenter, offsetChordPoint, chordPoint2, baseAngle);

    // chordEndpoints2 can return null if there's no real intersection
    if (chord) {
      chords.push(chord);
    }
  }

  return chords;
}


stage = MainStage.go(/*{ loop: true }*/)
