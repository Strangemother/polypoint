/*
title: Jelly Wobble Physics
categories: soft-body
    raw
files:
    head
    stroke
    ../point_src/point-content.js
    pointlist
    point
    ../point_src/bisector.js
    ../point_src/functions/clamp.js
    dragging
    mouse
    ../point_src/random.js
    stage
    ../point_src/velocity.js

*/

var canvas;

// const SPACING = 6;
// const ITERATIONS = 8;
// const MOUSE = SPACING * 2;
// let GRAVITY = 0.01;
// let SPEED = .8;

const SPACING = 20;
const ITERATIONS = 14;
const MOUSE = SPACING * 5;
let GRAVITY = .03;
let SPEED = 1;


const mouse = {
    x: 0,
    y: 0,
    px: 0,
    py: 0,
    points: [],
};


class MainStage extends Stage {
    canvas = 'playspace'

    mounted() {
        // this.indicator = new Point({x: 300, y: 300}); // Start the draggable point somewhere

        // this.dragging.add(this.a, this.b)
        this.events.wake();
        canvas = this.canvas

        const hue = 100;
        const squares = Array(2).fill(0).map((_, i) => {
            const size = 5 + i;
            return new Other(
                    size,
                    size,
                    5,
                    hue + i * 20,
                    .50, // slipDamping: 0 == sticky, 1 == no friction
            );
        });

        const balls = Array(2).fill(0).map((_, i) => {
            const radius = 60 + i * 20;
            return new Ball(
                    radius,
                    5, // spacing: wall-contact margin, same meaning as Other's
                    hue + 160 + i * 30,
                    .91, // slipDamping: 0 == sticky, 1 == no friction (skin grip on walls/floor)
                    .40, // bounciness: 0 == no bounce, 1 == fully elastic rebound
            );
        });

        const lshapesMitered = Array(1).fill(0).map((_, i) => {
            return new LShapeMitered(
                    3, // armWidth: thickness of each arm, in grid cells
                    9, // width: overall bounding box, in grid cells
                    9, // height: overall bounding box, in grid cells
                    hue + 260 + i * 30,
                    .50, // slipDamping: 0 == sticky, 1 == no friction
                    .30, // bounciness: 0 == no bounce, 1 == fully elastic rebound
            );
        });

        const lshapes = Array(1).fill(0).map((_, i) => {
            return new LShape(
                    3, // armWidth: thickness of each arm, in grid cells
                    9, // width: overall bounding box, in grid cells
                    9, // height: overall bounding box, in grid cells
                    hue + 220 + i * 30,
                    .50, // slipDamping: 0 == sticky, 1 == no friction
                    .30, // bounciness: 0 == no bounce, 1 == fully elastic rebound
            );
        });

        const pluses = Array(1).fill(0).map((_, i) => {
            return new PlusShape(
                    3, // armWidth: thickness of each arm, in grid cells
                    7, // width: overall bounding box, in grid cells (margin (7-3)/2 = 2, centers evenly)
                    7, // height: overall bounding box, in grid cells
                    hue + 300 + i * 30,
                    .50, // slipDamping: 0 == sticky, 1 == no friction
                    .30, // bounciness: 0 == no bounce, 1 == fully elastic rebound
            );
        });

        this.shapes = [...squares, ...balls, ...lshapesMitered, ...lshapes, ...pluses];
        this.allPoints = [].concat(...this.shapes.map((shape) => shape.allPoints));
    }

    draw(ctx) {
        this.clear(ctx);
        const { width, height } = canvas;
        let i = ITERATIONS;
        while (i--) {
            allContraints.forEach((con) => {
                reactor(...con);
            });

            //  wall tests.
            this.allPoints.forEach((point, i) => {
                /* Iterate every point and ensure it's inside the viewport.
                If not, add force to repulse from the wall.  */
                const { square } = point;

                // 0 == sticky, 1 == no friction. Each shape can dial in its
                // own grippiness; falls back to the old global default.
                const slipDamping = square && square.slipDamping !== undefined
                    ? square.slipDamping
                    : .50;
                const spacing = (square ? square.spacing : SPACING) / 2;

                // 0 == no bounce (velocity is simply absorbed, like hitting
                // concrete), 1 == perfectly elastic (rebounds losing zero
                // momentum). Position is snapped back to the boundary
                // directly (rather than sprung back with a force), so the
                // bounce energy comes only from this reflection - keeping
                // it exactly controllable across the full 0-1 range.
                const bounciness = square && square.bounciness !== undefined
                    ? square.bounciness
                    : 0;

                if (point.pos.x < spacing) {
                    // bounce off the left wall
                    point.pos.x = spacing;
                    if (point.velocity.x < 0) {
                        point.velocity.x *= -bounciness;
                    }
                    point.velocity.y *= slipDamping;
                } else if (point.pos.x > canvas.width - spacing) {
                    // bounce off the right wall.
                    point.pos.x = canvas.width - spacing;
                    if (point.velocity.x > 0) {
                        point.velocity.x *= -bounciness;
                    }
                    point.velocity.y *= slipDamping;
                }

                if (point.pos.y < spacing) {
                    // bounce off the floor
                    point.pos.y = spacing;
                    if (point.velocity.y < 0) {
                        point.velocity.y *= -bounciness;
                    }
                    point.velocity.x *= slipDamping;
                } else if (point.pos.y > canvas.height - spacing) {
                    // bounce off the ceiling
                    point.pos.y = canvas.height - spacing;
                    if (point.velocity.y > 0) {
                        point.velocity.y *= -bounciness;
                    }
                    point.velocity.x *= slipDamping;
                }

                point.update();
            });
        }

        this.shapes.forEach((s) => {
              s.draw(ctx);
        });

        if (mouse.down) {
                ctx.fillStyle = 'rgba(0, 0, 100, 0.03)';
                ctx.beginPath();
                ctx.arc(mouse.x, mouse.y, MOUSE, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(mouse.x, mouse.y, SPACING, 0, Math.PI * 2);
                ctx.fill();
        }

        mouse.px = mouse.x;
        mouse.py = mouse.y;

    }

    onmousedown(e) {
        this.onmousemove(e);
        mouse.down = true;

        for (const point of this.allPoints) {
            if (point.pos.distance(mouse) < MOUSE
                && !mouse.points.includes(point)) {
                mouse.points.push(point);
                point.mouseDiff = JellyVector.sub(point.pos, new JellyVector(mouse.x, mouse.y));
                point.velocity.mul(0);
                point.force.mul(0);
            }
        }
    }

    onmouseup(){
        mouse.points = [];
        mouse.down = false;
    }

    onmousemove(e){
        e = e.touches ? e.touches[0] : e;
        // const rect = canvas.getBoundingClientRect();
        const rect = this.dimensions
        mouse.px = mouse.x;
        mouse.py = mouse.y;
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    };

}


class JellyVector extends Vector {

    get length () {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    add(v) {
        const p = v instanceof JellyVector;
        this.x += p ? v.x : v;
        this.y += p ? v.y : v;
        return this;
    }

    sub(v) {
        const p = v instanceof JellyVector;
        this.x -= p ? v.x : v;
        this.y -= p ? v.y : v;
        return this;
    }

    mul(v) {
        const p = v instanceof JellyVector;
        this.x *= p ? v.x : v;
        this.y *= p ? v.y : v;
        return this;
    }

    scale(x) {
        this.x *= x;
        this.y *= x;
        return this;
    }

    normalize() {
        const len = this.length;
        if (len > 0) {
            this.x /= len;
            this.y /= len;
        }

        return this;
    }

    distance(v) {
        const x = this.x - v.x;
        const y = this.y - v.y;
        return Math.sqrt(x * x + y * y);
    }

    static add (v1, v2) {
        const v = v2 instanceof JellyVector;
        return new JellyVector(
            v1.x + (v ? v2.x : v2),
            v1.y + (v ? v2.y : v2)
        );
    }

    static sub (v1, v2) {
        const v = v2 instanceof JellyVector;
        return new JellyVector(
            v1.x - (v ? v2.x : v2),
            v1.y - (v ? v2.y : v2)
        );
    }

    static mul (v1, v2) {
        const v = v2 instanceof JellyVector;
        return new JellyVector(
            v1.x * (v ? v2.x : v2),
            v1.y * (v ? v2.y : v2)
        );
    }

    static dot (v1, v2) {
        return v1.x * v2.x + v1.y * v2.y;
    }
}


const reactor = function (a, b, p) {
    const refA = JellyVector.add(a.toWorld(p), a.pos);
    const refB = JellyVector.add(b.toWorld(JellyVector.mul(p, -1)), b.pos);

    const diff = JellyVector.sub(refB, refA);
    const mid = JellyVector.add(refA, JellyVector.mul(diff, 0.5));

    const t = clamp(b.p - a.p, -Math.PI, Math.PI);
    a.torque += t;
    b.torque -= t;

    // stiffness
    const mfc = .04 // .12 // .01 // .15 // 0.04;
    const tfc = .02 // .001 // 0.08 // 0.02;
    const mf = JellyVector.mul(diff, mfc);
    const tf = JellyVector.mul(diff, tfc);
    const dm = JellyVector.sub(b.vat(mid), a.vat(mid));
    mf.add(JellyVector.mul(dm, mfc));
    tf.add(JellyVector.mul(dm, tfc));

    a.addForce(mf, mid);
    b.addForce(JellyVector.mul(mf, -1), mid);
    a.addTorque(tf, mid);
    b.addTorque(JellyVector.mul(tf, -1), mid);
};

const allContraints = [];


class JellyPoint {
    /* Maintains all the motion and positioning. */
    constructor(pos, square, armScale = SPACING / 2, spinDamping = 1) {
        this.pos = pos;
        this.velocity = new JellyVector();
        this.force = new JellyVector();

        this.p = 0;
        this.w = 0;
        this.torque = 0;
        this.square = square;

        /* Rough "lever arm" length used to derive rotational inertia below.
        The square grid's points sit SPACING apart, so SPACING/2 is the
        default. Bigger shapes (e.g. a large Ball) reach further from
        their own center, so they need a bigger arm scale or the same
        torque spins them far too fast, causing jitter that never
        settles. */
        this.armScale = armScale;

        /* How much of the ball's angular velocity survives per rendered
        frame, independent of any wall/skin friction: 1 == never loses spin
        (basketball-like), lower values bleed spin off over time (light,
        ping-pong-ball-like). draw() runs ITERATIONS physics sub-steps per
        frame, so this is converted to an equivalent per-substep factor
        below - that way `spinDamping` always means "this much spin is
        left after one rendered frame", regardless of ITERATIONS. */
        this.spinDamping = spinDamping;
        this.spinDampingPerStep = spinDamping === 1
            ? 1
            : Math.pow(spinDamping, 1 / ITERATIONS);
    }

    update() {
        this.velocity.add(JellyVector.mul(this.force, SPEED));

        this.force = new JellyVector(0, GRAVITY / ITERATIONS);

        this.pos.add(JellyVector.mul(this.velocity, SPEED));

        const qPI = Math.PI / 4;
        this.w += this.torque / (this.armScale ** 2 / 2);
        this.w = clamp(this.w * SPEED, -qPI, qPI) * this.spinDampingPerStep;

        this.p += this.w;
        this.torque = 0;

        mouse.points.includes(this) &&
            this.moveTo(mouse, this.mouseDiff);
    }

    toWorld(input) {
        return new JellyVector(
            -input.y * Math.sin(this.p) + input.x * Math.cos(this.p),
            input.y * Math.cos(this.p) + input.x * Math.sin(this.p)
        );
    }

    vat(R) {
        const dr = JellyVector.sub(R, this.pos);
        const vdr = this.w * dr.length;

        dr.normalize();

        return JellyVector.add(
            this.velocity,
            new JellyVector(vdr * -dr.y, vdr * dr.x)
        );
    }

    addForce(F) {
        this.force.add(F);
    }

    addTorque(F, R) {
        const arm = JellyVector.sub(R, this.pos);
        const torque = F.y * arm.x - F.x * arm.y;
        this.torque += torque;
    }

    moveTo(v, offset) {
        const targetX = v.x + offset.x;
        const targetY = v.y + offset.y;
        const strength = 0.001;
        this.velocity.x += (targetX - this.pos.x) * strength * SPEED;
        this.velocity.y += (targetY - this.pos.y) * strength * SPEED;
        this.velocity.mul(0.99);
    }
}


class Other {
    constructor (width, height, spacing, hue, slipDamping = .50, bounciness = 0) {
        this.width = width;
        this.height = height;
        this.spacing = spacing;
        this.hue = hue;
        this.slipDamping = slipDamping;
        this.bounciness = bounciness;

        const yOff = 500
        const xOff = 600

        // rotation
        const w = -0.1 + Math.random() * .2;

        this.points = Array(width * height).fill(0).map((_, i) => {
            // const x = i % width;
            // const y = ~~(i / width);

            const x = 0 // Math.cos(i) % Math.PI;
            const y = 0 // Math.sin(i) % Math.PI;
            const _spacing = 0 // spacing
            const p = new JellyPoint(
                new JellyVector(
                    yOff, // 500, // xOff + x * _spacing,
                    xOff, // 500, // canvas.height - yOff + y * _spacing,
                ),
                this,
            );

            p.w = w;

            return p;
        });

        this.points.forEach((point, i) => {
            

            const x = (i % width);
            const y = ~~(i / width);

            const x_alt = (Math.cos(i) % Math.PI) * width;
            const y_alt = (Math.sin(i) % Math.PI) * height;

            // const y = Math.sin(i/width) * 10;

            if (x > 0) {
                let pos = this.points[i - 1]
                allContraints.push([
                    pos,
                    point,
                    new JellyVector(SPACING / 2, 0)
                ]);
            }

            if (y > 0) {
                let pos = this.points[i - width]
                allContraints.push([
                    pos,
                    point,
                    new JellyVector(0, SPACING / 2)
                ]);
            }
        });

        this.drawPoints = [];

        for (let i = 0; i < width; i++) {
            this.drawPoints.push(this.points[i].pos);
        }

        for (let i = 0; i < height; i++) {
            this.drawPoints.push(this.points[(width - 1) + width * i].pos);
        }

        for (let i = width - 1; i > -1; i--) {
            this.drawPoints.push(this.points[(height - 1) * width + i].pos);
        }

        for (let i = height - 1; i > -1; i--) {
            this.drawPoints.push(this.points[(width ) * i].pos);
        }

        this.allPoints = this.points;
    }

    draw(ctx) {
        const { drawPoints, hue } = this;

        ctx.lineWidth = 2;
        ctx.fillStyle = `hsla(${hue}, 90%, 80%, 0.8)`;
        ctx.strokeStyle = `hsla(${hue}, 90%, 70%, 0.8)`;

        ctx.beginPath();
        ctx.moveTo(drawPoints[0].x, drawPoints[0].y);

        /* container */
        drawPoints.forEach((p, i) =>{
            i && ctx.lineTo(p.x, p.y);
            ctx.stroke();
            ctx.fill();
        });

        ctx.lineTo(drawPoints[0].x, drawPoints[0].y);
        
        ctx.stroke();
        ctx.fill();

        /* draw points. */
        ctx.fillStyle = `hsla(${hue}, 10%, 50%, 1)`;
        drawPoints.forEach((p, i) =>{
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2, 0, Math.PI * 2)
            // ctx.stroke();
           ctx.fill();
        });

    }
}


class Ball {
    /* A disc-shaped jelly soft-body. This is deliberately built as the
    *exact same* dense grid lattice as `Other` - same fixed neighbour
    offsets, same constants, same collision path - just clipped to a
    circle instead of a rectangle, rather than a hollow ring of points
    orbiting a single hub.

    A hollow ring+hub is a sparse, under-constrained structure (each
    point connects to only 2 things: its ring neighbours and one spoke),
    so it needed a pile of special-cased patches (per-shape rotational
    inertia, spin damping, a soft contact margin, hub-based bounce
    aggregation) to behave, and even then never matched the square's
    robustness. A dense, redundant mesh - exactly like the square's -
    naturally rolls, bounces, and settles correctly using the exact same
    per-point wall collision as every other shape, with zero special
    branches needed for it in MainStage.draw(). */
    constructor (radius, spacing, hue, slipDamping = .50, bounciness = 0) {
        this.radius = radius;
        this.spacing = spacing;
        this.hue = hue;
        this.slipDamping = slipDamping;
        this.bounciness = bounciness;

        const yOff = 300
        const xOff = 800

        // rotation
        const w = -0.1 + Math.random() * .2;

        /* Lay out a regular grid using the same step (SPACING) as the
        square's lattice, and keep only the cells that fall inside
        `radius` of the center - a filled disc built from the same grid
        `Other` uses. Because the lattice is regular, the relative offset
        between any two adjacent cells is always exactly (SPACING, 0) or
        (0, SPACING), regardless of which particular cells end up inside
        the circle - so the constraints below can reuse Other's exact
        fixed offsets unmodified. */
        const cells = Math.ceil(radius / SPACING);
        const coords = [];
        for (let row = -cells; row <= cells; row++) {
            for (let col = -cells; col <= cells; col++) {
                const dx = col * SPACING;
                const dy = row * SPACING;
                if (Math.sqrt(dx * dx + dy * dy) <= radius) {
                    coords.push({ col, row });
                }
            }
        }

        const key = (col, row) => `${col},${row}`;
        const pointMap = new Map();

        this.points = coords.map(({ col, row }) => {
            const p = new JellyPoint(
                new JellyVector(yOff, xOff),
                this,
            );
            p.w = w;
            pointMap.set(key(col, row), p);
            return p;
        });

        // Connect every point to its left/top neighbour - exactly like
        // Other's grid.
        coords.forEach(({ col, row }, i) => {
            const point = this.points[i];

            const left = pointMap.get(key(col - 1, row));
            if (left) {
                allContraints.push([left, point, new JellyVector(SPACING / 2, 0)]);
            }

            const top = pointMap.get(key(col, row - 1));
            if (top) {
                allContraints.push([top, point, new JellyVector(0, SPACING / 2)]);
            }
        });

        /* Perimeter for drawing only (collision uses every point equally,
        just like Other): any point missing at least one of its 4
        immediate grid neighbours sits on the boundary. Order them by
        angle around the disc's centroid so they trace a clean closed
        loop instead of a jumbled path. */
        const cx = coords.reduce((sum, c) => sum + c.col, 0) / coords.length;
        const cy = coords.reduce((sum, c) => sum + c.row, 0) / coords.length;

        const boundary = coords
            .map(({ col, row }, i) => ({ point: this.points[i], col, row }))
            .filter(({ col, row }) => (
                !pointMap.has(key(col + 1, row)) ||
                !pointMap.has(key(col - 1, row)) ||
                !pointMap.has(key(col, row + 1)) ||
                !pointMap.has(key(col, row - 1))
            ));

        boundary.sort((a, b) => (
            Math.atan2(a.row - cy, a.col - cx) - Math.atan2(b.row - cy, b.col - cx)
        ));

        this.drawPoints = boundary.map(({ point }) => point.pos);
        this.allPoints = this.points;
    }

    draw(ctx) {
        const { drawPoints, hue } = this;
        const n = drawPoints.length;

        ctx.lineWidth = 2;
        ctx.fillStyle = `hsla(${hue}, 90%, 80%, 0.8)`;
        ctx.strokeStyle = `hsla(${hue}, 90%, 70%, 0.8)`;

        /* Draw the perimeter as a smoothed loop: curve through the
        midpoint of every pair of neighbouring boundary points so the
        grid's stair-stepped edge still reads as round. */
        const midpoint = (a, b) => new JellyVector((a.x + b.x) / 2, (a.y + b.y) / 2);

        const start = midpoint(drawPoints[n - 1], drawPoints[0]);

        ctx.beginPath();
        ctx.moveTo(start.x, start.y);

        for (let i = 0; i < n; i++) {
            const curr = drawPoints[i];
            const next = drawPoints[(i + 1) % n];
            const mid = midpoint(curr, next);
            ctx.quadraticCurveTo(curr.x, curr.y, mid.x, mid.y);
        }

        ctx.closePath();
        ctx.stroke();
        ctx.fill();

        /* draw points. */
        ctx.fillStyle = `hsla(${hue}, 10%, 50%, 1)`;
        drawPoints.forEach((p) => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2, 0, Math.PI * 2)
            ctx.fill();
        });
    }
}


class LShapeMitered {
    /* An "L" shaped jelly soft-body. Exactly the same technique as
    `Other` and the disc `Ball`: a regular SPACING-step grid, kept
    wherever it falls inside a mask (here an L shape instead of a
    rectangle or a circle), connected with the same fixed neighbour
    offsets. Since the L is a known, simple, straight-edged topology, its
    perimeter is walked explicitly (six straight edges, clockwise) rather
    than inferred by sorting - the same reliable approach `Other` uses
    for its four edges - and drawn with straight lines, not a curve, so
    there's no smoothing/curve-fitting involved at all.

    This variant keeps the ORIGINAL boundary walk, which cuts a diagonal
    straight across the single inner concave corner (a "mitre") rather
    than resolving it to a single point - kept around deliberately to
    demonstrate the difference against the corrected `LShape` below. */
    constructor (armWidth, width, height, hue, slipDamping = .50, bounciness = 0) {
        this.armWidth = armWidth;
        this.width = width;
        this.height = height;
        this.hue = hue;
        this.slipDamping = slipDamping;
        this.bounciness = bounciness;
        this.spacing = 5; // wall-contact margin, same meaning as Other's

        const yOff = 300
        const xOff = 800

        // rotation
        const w = -0.1 + Math.random() * .2;

        const aw = armWidth;

        // A cell is part of the L if it's in the vertical arm (left,
        // full height) or the horizontal arm (bottom, full width).
        const included = (col, row) => col < aw || row >= height - aw;

        const coords = [];
        for (let row = 0; row < height; row++) {
            for (let col = 0; col < width; col++) {
                if (included(col, row)) coords.push({ col, row });
            }
        }

        const key = (col, row) => `${col},${row}`;
        const pointMap = new Map();

        this.points = coords.map(({ col, row }) => {
            const p = new JellyPoint(
                new JellyVector(yOff, xOff),
                this,
            );
            p.w = w;
            pointMap.set(key(col, row), p);
            return p;
        });

        // Connect every point to its left/top neighbour - exactly like
        // Other's grid.
        coords.forEach(({ col, row }, i) => {
            const point = this.points[i];

            const left = pointMap.get(key(col - 1, row));
            if (left) {
                allContraints.push([left, point, new JellyVector(SPACING / 2, 0)]);
            }

            const top = pointMap.get(key(col, row - 1));
            if (top) {
                allContraints.push([top, point, new JellyVector(0, SPACING / 2)]);
            }
        });

        /* Walk the L's six straight edges clockwise, starting at the
        top-left corner of the vertical arm. This only works because we
        know the L's exact shape up front - the same reason `Other` can
        walk a rectangle's four edges directly instead of detecting them. */
        const boundaryCoords = [];

        for (let col = 0; col < aw; col++) boundaryCoords.push([col, 0]);
        for (let row = 1; row <= height - aw - 1; row++) boundaryCoords.push([aw - 1, row]);
        for (let col = aw; col <= width - 1; col++) boundaryCoords.push([col, height - aw]);
        for (let row = height - aw + 1; row <= height - 1; row++) boundaryCoords.push([width - 1, row]);
        for (let col = width - 2; col >= 0; col--) boundaryCoords.push([col, height - 1]);
        for (let row = height - 2; row >= 1; row--) boundaryCoords.push([0, row]);

        this.drawPoints = boundaryCoords.map(([col, row]) => pointMap.get(key(col, row)).pos);
        this.allPoints = this.points;
    }

    draw(ctx) {
        const { drawPoints, hue } = this;

        ctx.lineWidth = 2;
        ctx.fillStyle = `hsla(${hue}, 90%, 80%, 0.8)`;
        ctx.strokeStyle = `hsla(${hue}, 90%, 70%, 0.8)`;

        ctx.beginPath();
        ctx.moveTo(drawPoints[0].x, drawPoints[0].y);

        drawPoints.forEach((p, i) => {
            i && ctx.lineTo(p.x, p.y);
        });

        ctx.lineTo(drawPoints[0].x, drawPoints[0].y);

        ctx.stroke();
        ctx.fill();

        /* draw points. */
        ctx.fillStyle = `hsla(${hue}, 10%, 50%, 1)`;
        drawPoints.forEach((p) => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2, 0, Math.PI * 2)
            ctx.fill();
        });
    }
}


class LShape {
    /* An "L" shaped jelly soft-body - same technique as `LShapeMitered`,
    but the single inner concave corner is resolved to the one grid point
    both arms actually share, instead of cutting a diagonal across it.
    That shared point is (armWidth-1, height-armWidth): the last column
    of the vertical arm, at the first row of the horizontal arm - exactly
    where the two arms meet - so routing through it (rather than jumping
    straight to the horizontal arm's next column) gives a proper sharp
    right-angle corner. */
    constructor (armWidth, width, height, hue, slipDamping = .50, bounciness = 0) {
        this.armWidth = armWidth;
        this.width = width;
        this.height = height;
        this.hue = hue;
        this.slipDamping = slipDamping;
        this.bounciness = bounciness;
        this.spacing = 5; // wall-contact margin, same meaning as Other's

        const yOff = 300
        const xOff = 800

        // rotation
        const w = -0.1 + Math.random() * .2;

        const aw = armWidth;

        // A cell is part of the L if it's in the vertical arm (left,
        // full height) or the horizontal arm (bottom, full width).
        const included = (col, row) => col < aw || row >= height - aw;

        const coords = [];
        for (let row = 0; row < height; row++) {
            for (let col = 0; col < width; col++) {
                if (included(col, row)) coords.push({ col, row });
            }
        }

        const key = (col, row) => `${col},${row}`;
        const pointMap = new Map();

        this.points = coords.map(({ col, row }) => {
            const p = new JellyPoint(
                new JellyVector(yOff, xOff),
                this,
            );
            p.w = w;
            pointMap.set(key(col, row), p);
            return p;
        });

        // Connect every point to its left/top neighbour - exactly like
        // Other's grid.
        coords.forEach(({ col, row }, i) => {
            const point = this.points[i];

            const left = pointMap.get(key(col - 1, row));
            if (left) {
                allContraints.push([left, point, new JellyVector(SPACING / 2, 0)]);
            }

            const top = pointMap.get(key(col, row - 1));
            if (top) {
                allContraints.push([top, point, new JellyVector(0, SPACING / 2)]);
            }
        });

        /* Walk the L's boundary clockwise, starting at the top-left
        corner of the vertical arm - identical to `LShapeMitered`, except
        the inner corner routes through the shared point (aw-1,
        height-aw) instead of jumping diagonally past it. */
        const boundaryCoords = [];

        for (let col = 0; col < aw; col++) boundaryCoords.push([col, 0]);
        for (let row = 1; row <= height - aw - 1; row++) boundaryCoords.push([aw - 1, row]);
        boundaryCoords.push([aw - 1, height - aw]); // inner corner, resolved to one point
        for (let col = aw; col <= width - 1; col++) boundaryCoords.push([col, height - aw]);
        for (let row = height - aw + 1; row <= height - 1; row++) boundaryCoords.push([width - 1, row]);
        for (let col = width - 2; col >= 0; col--) boundaryCoords.push([col, height - 1]);
        for (let row = height - 2; row >= 1; row--) boundaryCoords.push([0, row]);

        this.drawPoints = boundaryCoords.map(([col, row]) => pointMap.get(key(col, row)).pos);
        this.allPoints = this.points;
    }

    draw(ctx) {
        const { drawPoints, hue } = this;

        ctx.lineWidth = 2;
        ctx.fillStyle = `hsla(${hue}, 90%, 80%, 0.8)`;
        ctx.strokeStyle = `hsla(${hue}, 90%, 70%, 0.8)`;

        ctx.beginPath();
        ctx.moveTo(drawPoints[0].x, drawPoints[0].y);

        drawPoints.forEach((p, i) => {
            i && ctx.lineTo(p.x, p.y);
        });

        ctx.lineTo(drawPoints[0].x, drawPoints[0].y);

        ctx.stroke();
        ctx.fill();

        /* draw points. */
        ctx.fillStyle = `hsla(${hue}, 10%, 50%, 1)`;
        drawPoints.forEach((p) => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2, 0, Math.PI * 2)
            ctx.fill();
        });
    }
}


class PlusShape {
    /* A "+" shaped jelly soft-body. Same technique as `LShape`: a regular
    SPACING-step grid kept wherever it falls inside a mask (here the
    union of a centered vertical bar and a centered horizontal bar,
    instead of an L), connected with the same fixed neighbour offsets,
    and its 12 straight boundary edges walked explicitly and clockwise -
    same reliable approach, just a different known shape. */
    constructor (armWidth, width, height, hue, slipDamping = .50, bounciness = 0) {
        this.armWidth = armWidth;
        this.width = width;
        this.height = height;
        this.hue = hue;
        this.slipDamping = slipDamping;
        this.bounciness = bounciness;
        this.spacing = 5; // wall-contact margin, same meaning as Other's

        const yOff = 300
        const xOff = 800

        // rotation
        const w = -0.1 + Math.random() * .2;

        const aw = armWidth;

        // Vertical arm: centered in width, full height.
        const cs = Math.floor((width - aw) / 2);
        const ce = cs + aw - 1;
        // Horizontal arm: centered in height, full width.
        const rs = Math.floor((height - aw) / 2);
        const re = rs + aw - 1;

        const included = (col, row) => (
            (col >= cs && col <= ce) || (row >= rs && row <= re)
        );

        const coords = [];
        for (let row = 0; row < height; row++) {
            for (let col = 0; col < width; col++) {
                if (included(col, row)) coords.push({ col, row });
            }
        }

        const key = (col, row) => `${col},${row}`;
        const pointMap = new Map();

        this.points = coords.map(({ col, row }) => {
            const p = new JellyPoint(
                new JellyVector(yOff, xOff),
                this,
            );
            p.w = w;
            pointMap.set(key(col, row), p);
            return p;
        });

        // Connect every point to its left/top neighbour - exactly like
        // Other's grid.
        coords.forEach(({ col, row }, i) => {
            const point = this.points[i];

            const left = pointMap.get(key(col - 1, row));
            if (left) {
                allContraints.push([left, point, new JellyVector(SPACING / 2, 0)]);
            }

            const top = pointMap.get(key(col, row - 1));
            if (top) {
                allContraints.push([top, point, new JellyVector(0, SPACING / 2)]);
            }
        });

        /* Walk the plus's boundary clockwise, starting at the top-left
        corner of the vertical arm's top segment.

        The four inner "notch" corners (where an arm's side edge meets
        the perpendicular arm) are where the vertical arm's column and
        the horizontal arm's row actually intersect - that exact grid
        point already exists (it's shared by both arms), so routing
        through it gives a proper sharp right-angle corner instead of
        cutting a diagonal across it. */
        const boundaryCoords = [];

        for (let col = cs; col <= ce; col++) boundaryCoords.push([col, 0]);
        for (let row = 1; row <= rs - 1; row++) boundaryCoords.push([ce, row]);
        boundaryCoords.push([ce, rs]); // notch (top-right)
        for (let col = ce + 1; col <= width - 1; col++) boundaryCoords.push([col, rs]);
        for (let row = rs + 1; row <= re; row++) boundaryCoords.push([width - 1, row]);
        for (let col = width - 2; col >= ce + 1; col--) boundaryCoords.push([col, re]);
        boundaryCoords.push([ce, re]); // notch (bottom-right)
        for (let row = re + 1; row <= height - 1; row++) boundaryCoords.push([ce, row]);
        for (let col = ce - 1; col >= cs; col--) boundaryCoords.push([col, height - 1]);
        for (let row = height - 2; row >= re + 1; row--) boundaryCoords.push([cs, row]);
        boundaryCoords.push([cs, re]); // notch (bottom-left)
        for (let col = cs - 1; col >= 0; col--) boundaryCoords.push([col, re]);
        for (let row = re - 1; row >= rs; row--) boundaryCoords.push([0, row]);
        for (let col = 1; col <= cs - 1; col++) boundaryCoords.push([col, rs]);
        boundaryCoords.push([cs, rs]); // notch (top-left)
        for (let row = rs - 1; row >= 1; row--) boundaryCoords.push([cs, row]);
        // closes back to (cs, 0), the very first point pushed above.

        this.drawPoints = boundaryCoords.map(([col, row]) => pointMap.get(key(col, row)).pos);
        this.allPoints = this.points;
    }

    draw(ctx) {
        const { drawPoints, hue } = this;

        ctx.lineWidth = 2;
        ctx.fillStyle = `hsla(${hue}, 90%, 80%, 0.8)`;
        ctx.strokeStyle = `hsla(${hue}, 90%, 70%, 0.8)`;

        ctx.beginPath();
        ctx.moveTo(drawPoints[0].x, drawPoints[0].y);

        drawPoints.forEach((p, i) => {
            i && ctx.lineTo(p.x, p.y);
        });

        ctx.lineTo(drawPoints[0].x, drawPoints[0].y);

        ctx.stroke();
        ctx.fill();

        /* draw points. */
        ctx.fillStyle = `hsla(${hue}, 10%, 50%, 1)`;
        drawPoints.forEach((p) => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2, 0, Math.PI * 2)
            ctx.fill();
        });
    }
}


stage = MainStage.go()


