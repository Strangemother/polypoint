/*
title: Better Balloon
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
    ../point_src/collisionbox.js
    dragging
    ../point_src/random.js
    ../point_src/rope.js
---

The _other_ balloon example uses one rope with negative gravity.

In this version there are two ropes. One (hidden) rope connecting the balloon
and the pin, and a second (rendered) rope, with the two pinned ends matching
the balloon rope - with _correct_ gravity.

*/

// const distance = 5;
const gravity2D = {x:0, y:-8.9};
// const gravity = 0.35;
const friction = 0.9;

class Balloon {
    constructor(){
        this.points = PointList.generate.random(10, [100, 200], [0,0, 5, 0])
        this.points.forEach((p)=>{
            p.update({vx: 0, vy:0 })
        })

    }

    mounted(initPos) {
        this.numPoints = 20;
        this.segmentLength = 10;
        this.gravity = -.31;
        this.gravity2D = gravity2D

        // let initPos = this.center.copy()
        this.points = this.ropePoints(initPos, this.numPoints * .5)
        this.points2 = this.ropePoints(initPos, this.numPoints)
        let penUlt = this.points[this.points.length - 3]
        // penUlt.invMass = 200
        let lastPoint = this.points.last()
        lastPoint.invMass = .2
        lastPoint.radius = 60

        this.ropeReactor = new RopeReactor()
        this.ropeReactor2 = new RopeReactor()

        this.points[0].copy(initPos.add(10,100))
        this.points2[0].copy(initPos.add(10,100))


        this.ropeReactor2.pin(0)
        this.ropeReactor.pin(0)
        this.ropeReactor2.pin(this.points2.length-1, this.points[this.points.length - 3])
        // this.ropeReactor2.pin(5)
    }

    ropePoints(initPos, numPoints){
        let points = Array.from({ length: numPoints }, () => ({
            x: initPos.x,
            y: initPos.y,
            oldX: initPos.x,
            oldY: initPos.y,
        }));
        // points[9].invMass = .01
        return new PointList(...points).cast()
    }

    get head() {
        return this.points.last()
    }

    get handle() {
        return this.points[0]
    }

    draw(ctx) {
        // this.clear(ctx);

        /* A viscous fluid, applied through 2d invMass*/
        // this.applyPhysics2(this.points, this.gravity2D, [1, this.points.length-1]);
        let ropeReactor = this.ropeReactor
        let ropeReactor2 = this.ropeReactor2
        this.points2[0].xy = this.points[0].xy


        /* Rope like mass physics.*/
        ropeReactor.applyPhysics(this.points, this.gravity);
        ropeReactor2.applyPhysics(this.points2, -this.gravity);

        // ropeReactor.applyPhysics2(this.points, this.gravity2D)

        /* Different solving methods */
        // this.solveConstraints1(this.points, this.segmentLength);
        // this.solveConstraints2(this.points, this.segmentLength);
        ropeReactor.solveConstraints3(this.points, this.segmentLength * 3);
        ropeReactor2.solveConstraints3(this.points2, this.segmentLength);

        ctx.fillStyle = '#999'
        ctx.font = 'normal 30px lexend deca'
        ctx.textAlign = 'center'

        // this.points.pen.indicator(ctx);
        // this.points.pen.line(ctx, {color:'#444'});
        this.points2.pen.quadCurve(ctx,'#AAA');
        // this.points2.pen.line(ctx, {color:'#AAA'});

        let penUlt = this.points[this.points.length - 3]
        let last = this.points.last()
        this.points[0].pen.indicator(ctx)
        last.lookAt(penUlt)//, Math.PI *.5)
        // last.pen.indicator(ctx)
        let color = '#990000'
        // penUlt.pen.indicator(ctx)
        last.pen.fill(ctx, {color: color})
        // last.pen.indicator(ctx, {color: '#770000'})
        penUlt.pen.fill(ctx, '#550000')
        // last.text.label(ctx, 'Polypoint')
    }

}

class MainStage extends Stage {
    canvas='playspace'

    mounted(){
        this.points = PointList.generate.random(10, [100, 200], [0,0, 5, 0])
        this.points.forEach((p)=>{
            p.update({vx: 0, vy:0 })
        })

        this.balloon = new Balloon()
        this.balloon.mounted(this.center.copy())

        this.balloon2 = new Balloon()
        this.balloon2.mounted(this.center.copy().add(50))

        this.balloon3 = new Balloon()
        this.balloon3.mounted(this.center.copy().add(-50))

        this.collisionBox = new CollisionBox([
                            this.balloon.head
                            , this.balloon2.head
                            , this.balloon3.head
                        ])

        this.dragging.add(
            this.balloon.handle
            , this.balloon2.handle
            , this.balloon3.handle
            // , this.points2[0]
            // , lastPoint
        )
    }

    draw(ctx) {
        this.clear(ctx);

        ctx.fillStyle = '#999'
        ctx.font = 'normal 30px lexend deca'
        ctx.textAlign = 'center'
        this.collisionBox.shuffle()

        this.balloon.draw(ctx)
        this.balloon2.draw(ctx)
        this.balloon3.draw(ctx)
    }

}


;stage = MainStage.go();