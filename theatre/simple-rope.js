/*
title: Simple Rope
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

A very simple verlet constraint chain for a rope-like catenary solution
*/

class MainStage extends Stage {
    canvas='playspace'

    mounted(){
        this.points = PointList.generate.random(10, [100, 200], [0,0, 5, 0])
        this.points.forEach((p)=>{
            p.update({vx: 0, vy:0 })
        })

    }

    mounted() {
        this.numPoints = 30;
        this.segmentLength = 10;
        this.gravity = .001;

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
        // this.points.pen.indicator(ctx);
        this.points.pen.quadCurve(ctx);
    }

}


;stage = MainStage.go();