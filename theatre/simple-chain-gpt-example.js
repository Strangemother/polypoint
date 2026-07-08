/*
title: Image Data Reshading
categories: imagedata
    raw
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

*/

// const distance = 5;
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

    updatePoints(points, target) {
        const distance = 20;
        points.forEach((point, index) => {
            const dx = target.x - point.x;
            const dy = target.y - point.y;
            const angle = Math.atan2(dy, dx);

            point.x = target.x - Math.cos(angle) * distance;
            point.y = target.y - Math.sin(angle) * distance;

            target = point;
        });
    }

    draw(ctx){
        this.clear(ctx)
        this.updatePoints2(this.points, this.mouse.point)
        // this.updatePoints(this.points, this.mouse.point)
        this.points.pen.indicator(ctx)
    }

    /*
        GPT 4.5

        Hi GPT. I am working on my polypoint library.
        Can you please show me rope or chain like stringy pully thing,
        such that I have a mouse point and then a range of points of which
        follow the mouse - but act like a rope or long chain,
        affected by physics.

        Can you show me a function to do that?
    */

    updatePoints2(points, mouse) {
        /* GPT - Poor */
        points[0].x = mouse.x;
        points[0].y = mouse.y;
        const distance = 5;

        for (let i = 1; i < points.length; i++) {
            const point = points[i];
            point.vy += gravity;

            point.x += point.vx;
            point.y += point.vy;

            const prev = points[i - 1];
            let dx = point.x - prev.x;
            let dy = point.y - prev.y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            let difference = distance - dist;
            let percent = difference / dist / 2;

            let offsetX = dx * percent;
            let offsetY = dy * percent;

            point.x += offsetX;
            point.y += offsetY;

            prev.x -= offsetX;
            prev.y -= offsetY;

            point.vx *= friction;
            point.vy *= friction;
        }
    }
    /*
        This doesn't work very well.
        The points lazily travel towards the mouse and if the
         friction is too low (e.g. 0.99), the points fall away.
        This doesn't act like a rope - it incorrectly acts like a gloopy gloop

     */

    /*  GPT 4.5 absolutely knocked it out the park.*/
    mounted() {
        this.numPoints = 6;
        this.segmentLength = 100;
        this.gravity = 1;

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
        this.solveConstraints1(this.points, this.segmentLength);
        // this.solveConstraints2(this.points, this.segmentLength);

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
            // , [points.length - 1]: endPin
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
}


;stage = MainStage.go();