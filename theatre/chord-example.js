/*
title: Follow
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
    ../point_src/constrain-distance-locked.js
    ../point_src/constrain-distance.js
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

        this.point.pen.indicator(ctx)
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
    }
}


function chordEndpoints2(point, chordPoint, chordPoint2) {
      // Circle center: (px, py)
      // Radius: R
      // Chord reference point: (cx, cy)
      // Angle of chord direction: ca (in radians)
      let px = point.x
        , py = point.y
        , R = point.radius
        , cx = chordPoint.x
        , cy = chordPoint.y
        , ca = chordPoint2? chordPoint.directionTo(chordPoint2): chordPoint.radians
        ;

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



stage = MainStage.go(/*{ loop: true }*/)
