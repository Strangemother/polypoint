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
    ../point_src/rope.js
---

A very pinnable verlet constraint chain for a rope-like catenary solution.

*/

// const distance = 5;
const gravity2D = {x:0, y:-8.9};
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
        this.numPoints = 10;
        this.segmentLength = 20;
        this.gravity = .31;
        this.gravity2D = gravity2D

        let initPos = this.center.copy()
        this.points = Array.from({ length: this.numPoints }, () => ({
            x: initPos.x,
            y: initPos.y,
            oldX: initPos.x,
            oldY: initPos.y,
        }));

        // this.points[9].invMass = .01
        this.points = new PointList(...this.points).cast()
        this.points.last().invMass = .2
        this.dragging.add(this.points[0])

        this.ropeReactor = new RopeReactor()
        this.ropeReactor.mouse = this.mouse
        this.points[0].copy(initPos.subtract(120,120))
        this.ropeReactor.pin(0)
    }

    draw(ctx) {
        this.clear(ctx);

        /* A viscous fluid, applied through 2d invMass*/
        // this.applyPhysics2(this.points, this.gravity2D, [1, this.points.length-1]);
        let ropeReactor = this.ropeReactor
        /* Rope like mass physics.*/
        ropeReactor.applyPhysics(this.points, this.gravity);
        // ropeReactor.applyPhysics2(this.points, this.gravity2D)

        /* Different solving methods */
        // this.solveConstraints1(this.points, this.segmentLength);
        // this.solveConstraints2(this.points, this.segmentLength);
        ropeReactor.solveConstraints3(this.points, this.segmentLength);
        ctx.fillStyle = '#999'
        ctx.font = 'normal 30px lexend deca'
        ctx.textAlign = 'center'
        // this.points.pen.indicator(ctx);
        this.points.pen.quadCurve(ctx);
        let penUlt = this.points[this.points.length - 5]
        let last = this.points.last()
        this.points[0].pen.indicator(ctx)
        last.lookAt(penUlt, Math.PI *.5)
        // last.pen.indicator(ctx)
        penUlt.pen.indicator(ctx)
        last.text.label(ctx, 'Polypoint')
    }

}


;stage = MainStage.go();