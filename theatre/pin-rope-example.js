/*
title: Pinnable Rope
categories: chain
    rope
    constraints
files:
    head
    pointlist
    point
    stage
    stroke
    mouse
    dragging
    ../point_src/random.js
---

A very pinnable verlet constraint chain for a rope-like catenary solution.

*/

// const distance = 5;
const gravity2D = {x:0, y:1};
const gravity = 0.35;
const friction = 0.9;

class MainStage extends Stage {
    canvas='playspace'

    mounted(){
        this.points = PointList.generate.random(10, [100, 200], [0,0, 5, 0])
        this.points.forEach((p)=>{
            p.update({vx: 0, vy:0 })
        })

    }

    /*  GPT 4.5 absolutely knocked it out the park.*/
    mounted() {
        this.numPoints = 24;
        this.segmentLength = 40;
        this.gravity = .31;
        this.gravity2D = gravity2D
        this.points = Array.from({ length: this.numPoints }, () => ({
            x: this.mouse.point.x,
            y: this.mouse.point.y,
            oldX: this.mouse.point.x,
            oldY: this.mouse.point.y,
        }));
        this.points[9].invMass = .01
        this.points = new PointList(...this.points).cast()
        this.endPin = new Point(100, 200)
        this.midPin =  new Point(250, 200)
        this.midPin.color = 'red'
        this.dragging.add(this.midPin, this.endPin)

    }

    applyPhysics(points, gravity) {
        points.forEach((p, index) => {
            if (index === 0) {
                // first point follows mouse
                p.x = this.mouse.point.x;
                p.y = this.mouse.point.y;
            } else {
                const vx = (p.x - p.oldX) * 0.98;
                const vy = (p.y - p.oldY) * 0.98;

                p.oldX = p.x;
                p.oldY = p.y;

                p.x += vx;
                p.y += vy + gravity;
            }
        });
    }

    applyPhysics2(points, gravity2D, pinnedIndices){
        points.forEach((p, index) => {
            if (!pinnedIndices.includes(index) && (p.invMass ?? 1) !== 0) {
                p.x += gravity2D.x * (p.invMass ?? 1) * this.gravity;
                p.y += gravity2D.y * (p.invMass ?? 1) * this.gravity;
            }
        });
    }

    solveConstraints1(points, segmentLength, iterations = 5) {
        for (let j = 0; j < iterations; j++) {
            for (let i = 0; i < points.length - 1; i++) {
                const p1 = points[i];
                const p2 = points[i + 1];

                let dx = p2.x - p1.x;
                let dy = p2.y - p1.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const difference = segmentLength - distance;
                const percent = difference / distance / 2;

                const offsetX = dx * percent;
                const offsetY = dy * percent;

                if (i !== 0) {
                    p1.x -= offsetX;
                    p1.y -= offsetY;
                }
                p2.x += offsetX;
                p2.y += offsetY;
            }
        }
    }

    draw(ctx) {
        this.clear(ctx);

        /* A viscous fluid, applied through 2d invMass*/
        // this.applyPhysics2(this.points, this.gravity2D, [1, this.points.length-1]);

        /* Rope like mass physics.*/
        this.applyPhysics(this.points, this.gravity);

        /* Different solving methods */
        // this.solveConstraints1(this.points, this.segmentLength);
        this.solveConstraints2(this.points, this.segmentLength);
        // this.solveConstraints3(this.points, this.segmentLength);

        this.points.pen.indicator(ctx);
        this.points.pen.quadCurve(ctx);

        // ctx.beginPath();
        // ctx.moveTo(this.points[0].x, this.points[0].y);
        // this.points.forEach(p => ctx.lineTo(p.x, p.y));
        // ctx.strokeStyle = "#333";
        // ctx.lineWidth = 4;
        // ctx.lineCap = "round";
        // ctx.stroke();
    }

    solveConstraints2(points, segmentLength, iterations = 5) {
        const pl = points.last()
        let endPin = this.endPin
        const pinnedPositions = {
            0: this.mouse.point
            , [~~(points.length *.5)]: this.midPin
            , [points.length - 1]: endPin
        };

        const pinnedIndices = Object.keys(pinnedPositions)

        for (let j = 0; j < iterations; j++) {
            for (let i = 0; i < points.length - 1; i++) {
                const p1 = points[i];
                const p2 = points[i + 1];

                let dx = p2.x - p1.x;
                let dy = p2.y - p1.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const difference = segmentLength - distance;
                const percent = difference / distance / 2;

                const offsetX = dx * percent;
                const offsetY = dy * percent;

                if (!pinnedIndices.includes(i)) {
                    p1.x -= offsetX;
                    p1.y -= offsetY;
                }

                if (!pinnedIndices.includes(i + 1)) {
                    p2.x += offsetX;
                    p2.y += offsetY;
                }
            }

            // Reinforce pinned positions after constraint adjustment
            pinnedIndices.forEach(index => {
                points[index].x = pinnedPositions[index].x;
                points[index].y = pinnedPositions[index].y;
            });
        }
    }

    solveConstraints3(points, segmentLength, iterations = 5) {
        const pl = points.last();
        let endPin = this.endPin;
        const pinnedPositions = {
            0: this.mouse.point,
            [~~(points.length *.5)]: this.midPin,
            [points.length - 1]: endPin
        };

        const pinnedIndices = Object.keys(pinnedPositions).map(Number);

        for (let j = 0; j < iterations; j++) {
            for (let i = 0; i < points.length - 1; i++) {
                const p1 = points[i];
                const p2 = points[i + 1];

                let dx = p2.x - p1.x;
                let dy = p2.y - p1.y;
                const distance = Math.sqrt(dx * dx + dy * dy) || 0.0001; // prevent NaN
                const difference = segmentLength - distance;

                const invMass1 = p1.invMass ?? 1; // Default to 1 if undefined
                const invMass2 = p2.invMass ?? 1;
                const totalInvMass = invMass1 + invMass2 || 0.0001; // prevent division by zero

                const percent1 = (invMass1 / totalInvMass) * difference / distance;
                const percent2 = (invMass2 / totalInvMass) * difference / distance;

                if (!pinnedIndices.includes(i)) {
                    p1.x -= dx * percent1;
                    p1.y -= dy * percent1;
                }

                if (!pinnedIndices.includes(i + 1)) {
                    p2.x += dx * percent2;
                    p2.y += dy * percent2;
                }
            }

            // Re-pin positions
            pinnedIndices.forEach(index => {
                points[index].x = pinnedPositions[index].x;
                points[index].y = pinnedPositions[index].y;
            });
        }
    }
}


;stage = MainStage.go();