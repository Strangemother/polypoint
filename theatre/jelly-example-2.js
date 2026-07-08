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
            );
        });

        this.allPoints = [].concat(...squares.map(({ points }) => points));
        this.squares = squares
    }

    draw(ctx) {
        this.clear(ctx);
        const { width, height } = canvas;
        let i = ITERATIONS;
        while (i--) {
            allContraints.forEach((con, i) => {
                reactor(...con, i);
            });

            //  wall tests.
            this.allPoints.forEach((point, i) => {
                /* Iterate every point and ensure it's inside the viewport.
                If not, add force to repulse from the wall.  */
                const { square } = point;

                const SlideDamping = .0; // 0 == sticky, 1 == no friction
                const spacing = (square ? square.spacing : SPACING) / 2;

                if (point.pos.x < spacing) {
                    // bounce off the left wall
                    point.force.add(new JellyVector((spacing - point.pos.x) * 1, 0));
                    point.velocity.y *= SlideDamping; 
                } else if (point.pos.x > canvas.width - spacing) {
                    // bounce off the right wall.
                    point.force.add(new JellyVector((point.pos.x - canvas.width + spacing) * -1, 0));
                    point.velocity.y *= SlideDamping; 
                }

                if (point.pos.y < spacing) {
                    // bounce off the floor
                    point.force.add(new JellyVector(0, (spacing - point.pos.y) * 1));
                    point.velocity.x *= SlideDamping; 
                } else if (point.pos.y > canvas.height - spacing) {
                    // bounce off the ceiling
                    point.force.add(new JellyVector(0, (point.pos.y - canvas.height + spacing) * -1));
                    point.velocity.x *= SlideDamping; 
                }

                  point.update();
            });
        }

        this.squares.forEach((s) => {
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
    constructor(pos, square) {
        this.pos = pos;
        this.velocity = new JellyVector();
        this.force = new JellyVector();

        this.p = 0;
        this.w = 0;
        this.torque = 0;
        this.square = square;
    }

    update() {
        this.velocity.add(JellyVector.mul(this.force, SPEED));

        this.force = new JellyVector(0, GRAVITY / ITERATIONS);

        this.pos.add(JellyVector.mul(this.velocity, SPEED));

        const qPI = Math.PI / 4;
        this.w += this.torque / ((SPACING / 2) ** 2 / 2);
        this.w = clamp(this.w * SPEED, -qPI, qPI);

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
    constructor (width, height, spacing, hue) {
        this.width = width;
        this.height = height;
        this.spacing = spacing;
        this.hue = hue;

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




stage = MainStage.go()


