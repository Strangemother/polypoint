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


// 2) Choose parameters
const G = 0.1;     // gravitational constant
const theta = 0.5; // opening angle
const dt = 1;

class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
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

        // 1) Create some bodies
        this.bodies = new PointList(
          new Body(100, 100, 0.5, 0.4, 10),
          new Body(300, 100, 0, 0, 20),
          new Body(200, 200, -0.2, 0.1, 5),
          // ...
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

        barnesHutUpdate(this.bodies, G, theta, dt);

        this.bodies.forEach(p=>{
            (new Point(p)).pen.indicator(ctx)
        })

    }
}


class Body{
  constructor(x, y, vx, vy, mass) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.mass = mass;
  }
}

/* --------------------------------------------- */
class QuadTreeNode {
  constructor(x, y, width) {
    // (x, y) is the center of this square region
    // 'width' is half the side length from center to boundary
    // so this node covers [x-width, x+width] x [y-width, y+width]

    this.x = x;        // center x
    this.y = y;        // center y
    this.width = width; // half of the region side length

    // Child nodes
    this.NW = null;
    this.NE = null;
    this.SW = null;
    this.SE = null;

    // Single body reference if this node is a leaf
    this.body = null;

    // Center of mass info
    this.mass = 0;
    this.comX = 0;   // center of mass X
    this.comY = 0;   // center of mass Y
  }
}
/*-------------------------------------------------*/
function buildQuadTree(bodies) {
  if (bodies.length === 0) return null;

  // 1) Determine bounds (minX, maxX, minY, maxY)
  let minX = +Infinity, maxX = -Infinity;
  let minY = +Infinity, maxY = -Infinity;

  for (const b of bodies) {
    if (b.x < minX) minX = b.x;
    if (b.x > maxX) maxX = b.x;
    if (b.y < minY) minY = b.y;
    if (b.y > maxY) maxY = b.y;
  }

  // 2) Make it a square region; find the center and 'half width'
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  // halfSide = half of the region's side length
  const halfSide = Math.max(maxX - minX, maxY - minY) / 2 || 1;

  // 3) Create root
  const root = new QuadTreeNode(cx, cy, halfSide);

  // 4) Insert bodies
  for (const b of bodies) {
    insertBody(root, b);
  }

  // 5) Compute center of mass info in a post-order traversal
  computeMassDistribution(root);

  return root;
}


/* ------------------------------------------ */

function insertBody(node, body) {
  // If this node does not contain a body and has no children
  if (node.body === null && node.NW === null) {
    node.body = body;
    return;
  }

  // If this node is a leaf but already has a body, we must subdivide
  if (node.NW === null) {
    subdivide(node);

    // re-insert the old body
    if (node.body) {
      const oldBody = node.body;
      node.body = null; // we are no longer a leaf
      insertBody(node, oldBody);
    }
  }

  // Insert the new body into the appropriate child
  const half = node.width / 2;
  const left = node.x - half;
  const right = node.x + half;
  const top = node.y - half;
  const bottom = node.y + half;

  if (body.x < node.x) {
    // Goes to west side
    if (body.y < node.y) {
      // NW
      insertBody(node.NW, body);
    } else {
      // SW
      insertBody(node.SW, body);
    }
  } else {
    // Goes to east side
    if (body.y < node.y) {
      // NE
      insertBody(node.NE, body);
    } else {
      // SE
      insertBody(node.SE, body);
    }
  }
}
/* -----------------------------------------------*/

function subdivide(node) {
  const half = node.width / 2;
  node.NW = new QuadTreeNode(node.x - half/2, node.y - half/2, half/2);
  node.NE = new QuadTreeNode(node.x + half/2, node.y - half/2, half/2);
  node.SW = new QuadTreeNode(node.x - half/2, node.y + half/2, half/2);
  node.SE = new QuadTreeNode(node.x + half/2, node.y + half/2, half/2);
}


/* --------------------------------------------- */

function computeMassDistribution(node) {
  if (!node) return;

  // Leaf node with body?
  if (node.NW === null && node.body) {
    node.mass = node.body.mass;
    node.comX = node.body.x;
    node.comY = node.body.y;
    return;
  }

  // Otherwise, sum from children
  node.mass = 0;
  node.comX = 0;
  node.comY = 0;

  // Recursively compute children
  computeMassDistribution(node.NW);
  computeMassDistribution(node.NE);
  computeMassDistribution(node.SW);
  computeMassDistribution(node.SE);

  // Sum up children's mass
  [
    node.NW, node.NE,
    node.SW, node.SE
  ].forEach(child => {
    if (child && child.mass > 0) {
      node.mass += child.mass;
      node.comX += child.comX * child.mass;
      node.comY += child.comY * child.mass;
    }
  });

  // Now the node's center of mass
  if (node.mass > 0) {
    node.comX /= node.mass;
    node.comY /= node.mass;
  }
}

/* ------------------------------------------------- */

function directBodyForce(b1, b2, G) {
  const dx = b2.x - b1.x;
  const dy = b2.y - b1.y;
  const distSq = dx * dx + dy * dy;
  const dist = Math.sqrt(distSq) || 1e-8;
  const F = (G * b1.mass * b2.mass) / distSq;

  const fx = F * (dx / dist);
  const fy = F * (dy / dist);

  return { fx, fy };
}


/* ---------------------------------------------- */

function computeForceOnBody(body, node, G, theta) {
  // 1) Empty node?
  if (!node || node.mass === 0) return { fx: 0, fy: 0 };

  // 2) If this node is a leaf with a single body and that body is not 'body' itself
  if (node.NW === null && node.body && node.body !== body) {
    // Compute direct force from that body
    return directBodyForce(body, node.body, G);
  }

  // 3) Otherwise, check the Barnes–Hut condition
  const dx = node.comX - body.x;
  const dy = node.comY - body.y;
  const distSq = dx * dx + dy * dy;
  const dist = Math.sqrt(distSq) || 1e-8;

  // Node 'width' here is half the region side => actual region side is (2 * node.width).
  // s = size of region (side length). We use s = 2 * node.width
  const s = 2 * node.width;

  if ((s / dist) < theta) {
    // 3.1) Accept this node as a single mass at (comX, comY)
    const F = (G * body.mass * node.mass) / distSq;
    const fx = F * (dx / dist);
    const fy = F * (dy / dist);
    return { fx, fy };
  } else {
    // 3.2) Otherwise, recurse into children
    const forceNW = computeForceOnBody(body, node.NW, G, theta);
    const forceNE = computeForceOnBody(body, node.NE, G, theta);
    const forceSW = computeForceOnBody(body, node.SW, G, theta);
    const forceSE = computeForceOnBody(body, node.SE, G, theta);

    return {
      fx: forceNW.fx + forceNE.fx + forceSW.fx + forceSE.fx,
      fy: forceNW.fy + forceNE.fy + forceSW.fy + forceSE.fy
    };
  }
}

/* ----------------------------------------------- */

function barnesHutUpdate(bodies, G, theta, dt) {
  // 1) Build quad tree
  const root = buildQuadTree(bodies);

  // 2) For each body, compute force
  for (const b of bodies) {
    const { fx, fy } = computeForceOnBody(b, root, G, theta);

    // 3) Acceleration
    const ax = fx / b.mass;
    const ay = fy / b.mass;

    // 4) Update velocity
    b.vx += ax * dt;
    b.vy += ay * dt;
  }

  // 5) Update positions
  for (const b of bodies) {
    b.x += b.vx * dt;
    b.y += b.vy * dt;
  }
}



stage = MainStage.go(/*{ loop: true }*/)
