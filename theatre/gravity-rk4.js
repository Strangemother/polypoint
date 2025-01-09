/*

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


moved to functions/springs */
/**
 * @param {Point[]} points - Array of Point objects
 * @param {number} G       - Gravitational constant
 * @param {number} dt      - Timestep (e.g., 0.1, 0.01, etc.)
 */



// 1) Define your initial points (like your old "Point" objects)
const points = new PointList(
    { x: 500, y: 300, vx: 0.2, vy: 0.2, mass: 10, radius: 10 },
    { x: 400, y: 340, vx: 0.0, vy: 0.0, mass: 40, radius: 40 },
    { x: 150, y: 200, vx: 0.7, vy: 0.1, mass: 5, radius: 5 },
  // ... etc
).cast()

// 2) Convert to an array-based state
const N = points.length;
const masses = new Array(N);
const state = new Float64Array(4 * N);

for (let i = 0; i < N; i++) {
    masses[i] = points[i].mass;      // store mass
    state[4 * i + 0] = points[i].x;  // x
    state[4 * i + 1] = points[i].y;  // y
    state[4 * i + 2] = points[i].vx; // vx
    state[4 * i + 3] = points[i].vy; // vy
}

// 3) Parameters
const G = 1;
const dt = 1;  // time step

function animate() {
  // 4) Update the state using RK4
  const newState = rk4Step(state, masses, G, dt);

  // 5) Copy newState back to 'state'
  state.set(newState);

  // 6) (Optional) Update your 'points' array if you want to draw them
  for (let i = 0; i < N; i++) {
    points[i].x  = state[4 * i + 0];
    points[i].y  = state[4 * i + 1];
    points[i].vx = state[4 * i + 2];
    points[i].vy = state[4 * i + 3];
  }

  // 7) Draw your points on canvas (or console, etc.)
  // renderPoints(points);
}



class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.points = points
        this.dragging.add(...this.points)
    }

    // onDragStart(ev, p) {
    //     this.dragPoint = p
    // }

    // onDragEnd(ev, p) {
    //     this.dragPoint = undefined
    // }

    onWheel(ev, p) {
        p.mass = p.radius
    }

    draw(ctx){
        this.clear(ctx)
        // updatePoints(this.points, 1, this.timestep);

        // Start
        animate();

        points.pen.indicators(ctx)

    }
}


/**
 * Compute the derivatives of the system at a given state.
 * @param {Float64Array|number[]} state  - The current system state [x0, y0, vx0, vy0, x1, y1, vx1, vy1, ...]
 * @param {number[]} masses             - Array of masses for each body
 * @param {number} G                    - Gravitational constant
 * @returns {Float64Array}              - The derivatives of the state (same length as state)
 */
function computeDerivatives(state, masses, G) {
  const N = masses.length;
  const derivatives = new Float64Array(4 * N);

  // For convenience, we can first compute all accelerations from pairwise forces
  const ax = new Float64Array(N);
  const ay = new Float64Array(N);

  // Pairwise gravitational interaction
  for (let i = 0; i < N; i++) {
    const xi = state[4 * i + 0];
    const yi = state[4 * i + 1];

    for (let j = i + 1; j < N; j++) {
      const xj = state[4 * j + 0];
      const yj = state[4 * j + 1];

      const dx = xj - xi;
      const dy = yj - yi;
      const distSq = dx * dx + dy * dy;
      const dist = Math.sqrt(distSq) || 1e-8; // avoid divide-by-zero

      // F = G*m1*m2 / r^2
      const F = (G * masses[i] * masses[j]) / distSq;

      // Force direction
      const Fx = F * (dx / dist);
      const Fy = F * (dy / dist);

      // a = F/m
      ax[i] += Fx / masses[i];
      ay[i] += Fy / masses[i];
      ax[j] -= Fx / masses[j];
      ay[j] -= Fy / masses[j];
    }
  }

  // Now fill in derivatives for each body: (dx/dt, dy/dt, dvx/dt, dvy/dt)
  for (let i = 0; i < N; i++) {
    const vx = state[4 * i + 2];
    const vy = state[4 * i + 3];

    // dx/dt = vx
    derivatives[4 * i + 0] = vx;
    // dy/dt = vy
    derivatives[4 * i + 1] = vy;
    // dvx/dt = ax[i]
    derivatives[4 * i + 2] = ax[i];
    // dvy/dt = ay[i]
    derivatives[4 * i + 3] = ay[i];
  }

  return derivatives;
}


/**
 * Runge-Kutta 4 integrator: one step from state(t) to state(t + dt)
 * @param {Float64Array|number[]} state - The current system state
 * @param {number[]} masses             - Mass array
 * @param {number} G                    - Gravitational constant
 * @param {number} dt                   - Time step
 * @returns {Float64Array}             - The new state after time dt
 */
function rk4Step(state, masses, G, dt) {
  const N = masses.length;
  const k1 = computeDerivatives(state, masses, G);

  // For k2, we evaluate at (state + dt/2 * k1)
  const temp2 = new Float64Array(4 * N);
  for (let i = 0; i < 4 * N; i++) {
    temp2[i] = state[i] + 0.5 * dt * k1[i];
  }
  const k2 = computeDerivatives(temp2, masses, G);

  // For k3, we evaluate at (state + dt/2 * k2)
  const temp3 = new Float64Array(4 * N);
  for (let i = 0; i < 4 * N; i++) {
    temp3[i] = state[i] + 0.5 * dt * k2[i];
  }
  const k3 = computeDerivatives(temp3, masses, G);

  // For k4, we evaluate at (state + dt * k3)
  const temp4 = new Float64Array(4 * N);
  for (let i = 0; i < 4 * N; i++) {
    temp4[i] = state[i] + dt * k3[i];
  }
  const k4 = computeDerivatives(temp4, masses, G);

  // Combine
  const newState = new Float64Array(4 * N);
  for (let i = 0; i < 4 * N; i++) {
    newState[i] = state[i] + (dt / 6) * (k1[i] + 2*k2[i] + 2*k3[i] + k4[i]);
  }
  return newState;
}


stage = MainStage.go(/*{ loop: true }*/)
