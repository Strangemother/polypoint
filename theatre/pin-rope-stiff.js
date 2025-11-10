/*
title: Stiff Rope Constraints
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
        this.numPoints = 20;
        this.segmentLength = 10;
        this.gravity = -.001;

        this.points = Array.from({ length: this.numPoints }, () => ({
            x: this.mouse.point.x,
            y: this.mouse.point.y,
            oldX: this.mouse.point.x,
            oldY: this.mouse.point.y,
        }));
        this.points = new PointList(...this.points).cast()
        this.endPin = new Point(100, 200)
        this.dragging.add(this.endPin)

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
        this.applyPhysics(this.points, this.gravity);
        // this.solveConstraints1(this.points, this.segmentLength);
        // this.solveConstraints2(this.points, this.segmentLength);
        this.solveConstraints3(this.points, this.segmentLength, 5, .6);

        // Apply angular correction after constraints
        // this.straightenRope(this.points, 0.001);

        // this.points.pen.indicator(ctx);
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

    solveConstraints3(points, segmentLength, iterations = 5, stiffness = 1) {
        const endPin = this.endPin;
        const pinnedPositions = {
            0: this.mouse.point,
            // [points.length - 1]: endPin
        };
        const pinnedIndices = Object.keys(pinnedPositions).map(Number);

        for (let j = 0; j < iterations; j++) {
            for (let i = 0; i < points.length - 1; i++) {
                const p1 = points[i];
                const p2 = points[i + 1];

                let dx = p2.x - p1.x;
                let dy = p2.y - p1.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const difference = segmentLength - distance;
                const percent = (difference / distance) * 0.5 * stiffness;

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

    magicStraightenRope(points, strength = 0.1) {
        // Ignore first and last points (they're pinned)
        for (let i = 1; i < points.length - 1; i++) {
            const prev = points[i - 1];
            const current = points[i];
            const next = points[i + 1];

            // Calculate ideal midpoint between prev and next
            const idealX = (prev.x + next.x) / 2;
            const idealY = (prev.y + next.y) / 2;

            // Move current towards ideal midpoint
            current.x += (idealX - current.x) * strength;
            current.y += (idealY - current.y) * strength;
        }
    }

    straightenRope(points, strength = 0.05) {
        const segmentLength = this.segmentLength;
        const newPositions = points.map(p => ({ x: p.x, y: p.y }));

        for (let i = 1; i < points.length - 1; i++) {
            const prev = points[i - 1];
            const current = points[i];
            const next = points[i + 1];

            // current angle
            const angleCurrent = Math.atan2(current.y - prev.y, current.x - prev.x);
            // desired angle toward next
            const angleDesired = Math.atan2(next.y - current.y, next.x - current.x);

            // difference between angles
            let angleDiff = angleDesired - angleCurrent;
            angleDiff = ((angleDiff + Math.PI) % (Math.PI * 2)) - Math.PI;

            // apply small rotation based on strength
            const correctedAngle = angleCurrent + angleDiff * strength;

            // update 'next' point using corrected angle
            newPositions[i + 1].x = current.x + Math.cos(correctedAngle) * segmentLength ;
            newPositions[i + 1].y = current.y + Math.sin(correctedAngle) * segmentLength ;
        }

        // Apply new positions after all calculations are done
        for (let i = 1; i < points.length - 1; i++) {
            points[i].x = newPositions[i].x;
            points[i].y = newPositions[i].y;
        }
    }

}


;stage = MainStage.go();