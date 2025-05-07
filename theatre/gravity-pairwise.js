/*
categories:
    gravity
    raw
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/math.js
    ../point_src/extras.js
    ../point_src/point-content.js
    ../point_src/pointlistpen.js
    ../point_src/pointlist.js
    ../point_src/events.js
    ../point_src/point.js
    ../point_src/distances.js
    ../point_src/dragging.js
    ../point_src/stage.js
    ../point_src/automouse.js
    ../point_src/functions/springs.js
    ../point_src/functions/clamp.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/screenwrap.js
---

moved to functions/springs
*/
/**
 * @param {Point[]} points - Array of Point objects
 * @param {number} G       - Gravitational constant
 * @param {number} dt      - Timestep (e.g., 0.1, 0.01, etc.)
 */
function updatePoints(points, G=.1, dt=1) {
  // Temporary array to store net forces
  const forces = points.map(() => ({ fx: 0, fy: 0 }));

  // Calculate pairwise gravitational force
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const p1 = points[i];
      const p2 = points[j];

      // Distance components
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const distSq = dx * dx + dy * dy; // distance squared
      const dist = Math.sqrt(distSq);

      // Avoid division by zero if points overlap
      if (dist === 0) continue;

      // Gravitational force magnitude: F = G * (m1 * m2) / r^2
      const F = (G * p1.mass * p2.mass) / distSq;

      // Direction from p1 to p2
      const fx = F * (dx / dist);
      const fy = F * (dy / dist);

      // Accumulate forces
      forces[i].fx += fx;
      forces[i].fy += fy;

      // Opposite reaction force on p2
      forces[j].fx -= fx;
      forces[j].fy -= fy;
    }
  }

  // Now update velocities and positions
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const f = forces[i];

    // Acceleration = F / m
    const ax = f.fx / p.mass;
    const ay = f.fy / p.mass;

    // Update velocity
    p.vx += ax * dt;
    p.vy += ay * dt;

    // Update position
    p.x += p.vx * dt;
    p.y += p.vy * dt;
  }
}

class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        // this.screenWrap = new ScreenWrap()
        this.points = new PointList(
            new Point({
                 x: 150, y: 230
                , radius: 10
                , vx: .1, vy: 0
                , mass: 10
            })
            , new Point({
                 x: 350, y: 200
                , vx: 0, vy: 0
                , radius: 120
                , mass: 120
            })
            , new Point({
                 x: 250, y: 270
                , vx: .1, vy: 0
                , radius: 8
                , mass: 8
            })
        )
        this.timestep = 1
        this.dragging.add(...this.points)
    }

    onDragStart(ev, p) {
        this.dragPoint = p
    }

    onDragEnd(ev, p) {
        this.dragPoint = undefined
    }

    onWheel(ev, p) {
        p.mass = p.radius
    }

    draw(ctx){
        this.clear(ctx)
        updatePoints(this.points, 1, this.timestep);
        this.points.pen.indicators(ctx)

    }
}

stage = MainStage.go(/*{ loop: true }*/)
