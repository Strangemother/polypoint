/*
title: Spring Blob with Gravity
categories: springs
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
    ../point_src/stagepen.js
    ../point_src/automouse.js
    ../point_src/functions/springs.js
    ../point_src/functions/clamp.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/rope.js
    ../point_src/collisionbox.js
    ../point_src/gravity.js
    */

const stringLength = 200

const heavyStep = function(followPoint, mouse, gravity,
                           damping=.9, dotDamping=.2, forceMultiplier=.1, forceValue=undefined) {
    // Apply gravity to the follow point's vertical velocity
    // Calculate the vector from the mouse to the follow point
    // let dx = followPoint.x - mouse.x ;
    // let dy = followPoint.y - mouse.y ;
    let dx = mouse.x - followPoint.x;
    let dy = mouse.y - followPoint.y;

    // Calculate the current distance between the follow point and the mouse
    let distance = Math.sqrt(dx * dx + dy * dy);

    // Set the follow point's position to be exactly on the circumference of the string length
    // const force = (distance - stringLength) * 0.01; // Tweak this factor as needed

    // If the distance exceeds the string length, we need to constrain the follow point
    if (distance > stringLength) {

        // Normalize the direction vector
        dx /= distance;
        dy /= distance;

        if(dotDamping!==false) {
            // Adjust the velocity so that it reflects the string tension
            let dotProduct = (followPoint.vx * dx + followPoint.vy * dy) * dotDamping;
            followPoint.vx -= dotProduct * dx;
            followPoint.vy -= dotProduct * dy;
        }

        if(forceMultiplier!==false){
            const force = forceValue? forceValue: (distance - stringLength) * forceMultiplier; // Tweak this factor as needed
            followPoint.vx += force * dx;
            followPoint.vy += force * dy;
        }

    }

    // Apply gravity
    if(gravity){
        followPoint.vy += gravity.y;
        followPoint.vx += gravity.x;
    }

    // Update the follow point's position based on its velocity
    followPoint.x += followPoint.vx;
    followPoint.y += followPoint.vy;

    if(damping) {
        // Apply damping continuously to smooth the motion
        followPoint.vx *= damping;
        followPoint.vy *= damping;
    }
};



class Balloon {

    defaults = {
            // gravity: .2

            gravity: {x:.05, y: 0}
            , visibleRopeGravity: {x:0, y:0.2}
            // gravity: undefined
            // , visibleRopeGravity: undefined
            , ropePointLength: 20
            , segmentLength: 10
            , invMass: .3
            , color: '#990000'
            , knotColor: '#225555'
            , ropeColor: '#AAA'
            , radius: 10
            , reactorMultiplier: .4
            // , position: [1,1]
        }

    constructor(settings={}){

        Object.assign(this, this.defaults, settings)

        this.points = PointList.generate.random(10, [100, 200], [0, 0, 2, 0])
        this.points.forEach((p)=>{
            p.update({vx: 0, vy:0, radius: 2 })
        });

        if(this.position) {
            this.mounted()
        }
    }

    mounted(initPos=this.position) {
        // this.ropePointLength = 20;
        // this.segmentLength = 10;
        // this.gravity = -.31;
        // this.gravity2D = gravity2D

        // let initPos = this.center.copy()
        this.points = this.ropePoints(initPos, this.ropePointLength * this.reactorMultiplier)
        this.points2 = this.ropePoints(initPos, this.ropePointLength)
        this.points.each.radius = 2
        // let penUlt = this.points[this.points.length - 3]
        // penUlt.invMass = 200
        let lastPoint = this.points.last()
        lastPoint.invMass = this.invMass
        lastPoint.radius = this.radius

        this.ropeReactor = new RopeReactor()
        this.visibleRopeReactor = new RopeReactor()

        this.points[0].copy(initPos.add(10,100))
        this.points2[0].copy(initPos.add(10,100))

        // this.visibleRopeReactor.pin(0)
        this.ropeReactor.pin(0)

        this.visibleRopeReactor.pin(
                this.points2.length-1
                , this.points[this.points.length - 1]
            )

        // this.visibleRopeReactor.pin(5)
    }

    ropePoints(initPos, ropePointLength){
        let points = Array.from({ length: ropePointLength }, () => ({
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

    step(){
        /* A viscous fluid, applied through 2d invMass*/
        // this.applyPhysics2(this.points, this.gravity2D, [1, this.points.length-1]);
        let ropeReactor = this.ropeReactor
        let visibleRopeReactor = this.visibleRopeReactor
        /* Rope like mass physics.*/

        /* If not enabled, the ball on a string, without gravity acting upon
        the head. */
        if(this.gravity !== undefined) {
            ropeReactor.applyPhysics(this.points, this.gravity);
        }

        /* If not enabled, the points wont fall, but simply sit in place.
        The constraints solves the bindings between nodes. */
        if(this.visibleRopeGravity !== undefined) {
            visibleRopeReactor.applyPhysics(this.points2, this.visibleRopeGravity)
        }

        // ropeReactor.applyPhysics2(this.points, this.gravity)

        /* Different solving methods

        These should occur else the points won't connect like a rope.
        */
        // this.solveConstraints1(this.points, this.segmentLength);
        // this.solveConstraints2(this.points, this.segmentLength);
        ropeReactor.solveConstraints3(this.points, this.segmentLength * 2.5);
        visibleRopeReactor.solveConstraints3(this.points2, this.segmentLength);
    }

    draw(ctx) {
        // this.clear(ctx);
        this.points2[0].xy = this.points[0].xy

        this.step()

        // ctx.fillStyle = '#999'
        // ctx.font = 'normal 30px lexend deca'
        // ctx.textAlign = 'center'

        // this.points.pen.indicator(ctx);
        // this.points.pen.line(ctx, {color:'#444'});
        this.points2.pen.quadCurve(ctx, {color: this.ropeColor, lineWidth: 2});
        // this.points2.pen.line(ctx, {color:'#AAA'});

        this.points[0].pen.indicator(ctx)

        // last.lookAt(penUlt)//, Math.PI *.5)
        // last.pen.indicator(ctx)

        // penUlt.pen.indicator(ctx)
        // last.pen.indicator(ctx, {color: '#770000'})
        // let penUlt = this.points[this.points.length - 3]
        // penUlt.pen.fill(ctx, this.knotColor)
        this.points.pen.fill(ctx, this.knotColor)
        let last = this.points.last()
        last.pen.fill(ctx, {'color': this.color})

        // last.text.label(ctx, 'Polypoint')
    }

}



class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.pinPoint = new Point(200, 200)
        this.points = new PointList(
            new Point({
                 x: 150, y: 230
                , radius: 4
                , vx: .1, vy: 0
                , mass: 5
            })
            , new Point({
                 x: 350, y: 200
                , vx: 2, vy: 0
                , radius: 4
                , mass: 5
            })
            , new Point({
                 x: 250, y: 270
                , vx: .4, vy: -1
                , radius: 4
                , mass: 5
            })
            , new Point({
                 x: 260, y: 290
                , vx: .4, vy: -1
                , radius: 4
                , mass: 5
            })
        )

        this.balloon = new Balloon()
        this.balloon.mounted(this.center.copy().add(50))

        this.dragging.addPoints(...this.points, this.pinPoint,
                this.balloon.handle, this.balloon.head)
        this.dragging.onWheel = this.onWheel.bind(this)
        this.dragging.onDragStart = this.onDragStart.bind(this)
        this.dragging.onDragEnd = this.onDragEnd.bind(this)


        this.showBraces = false
        this.showPoints = true
        this.showOuter = true
        this.fillBall = false
        this.showBall = false

        this.blobColor = 'green'
        this.braceColor = 'red'

        this.restLength = 40
        this.springConstant = .4
        this.dampingFactor = 0.99 // Adjust this value between 0 and 1

        let gp = new Point(0,3)
        this.collisionBox = new CollisionBox(this.points)
        this.gravityBox = new GravityReactor(gp, this.points)
        // this.gravityBox.points.push(this.pinpo)
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

        this.collisionBox.shuffle()
        let mouse = Point.mouse.position
        let ps = this.points;
        let sv = this.dragPoint != undefined? [this.dragPoint]: [];
        const lockedPoints = new Set(sv)//ps[0]]); // Lock pointA in place
        this.gravityBox.step(1, lockedPoints)

        heavyStep(ps[0],this.pinPoint, this.gravityBox.gravityPoint, .99)

        const rLen = this.restLength
        const springConstant = this.springConstant
        const damping = this.dampingFactor
        const deltaTime = .2
        const extra = 2
        this.balloon.draw(ctx)

        // cross brace springs
        this.points[0].spring.to(this.points[2]
                    , rLen * 3
                    , springConstant * extra
                    , .99
                    , lockedPoints
                    , deltaTime
                )
        this.points[1].spring.to(this.points[3]
                    , rLen * 3
                    , springConstant * extra
                    , .99
                    , lockedPoints
                    , deltaTime
                )

        ps.spring.loop(rLen, springConstant, damping, lockedPoints, deltaTime)

        if(this.fillBall) {
            this.points.draw.quadCurve(ctx, true)
            this.pen.fill(ctx, {color: this.blobColor})
        }

        if(this.showBall) {
            this.points.pen.quadCurve(ctx, {
                loop: true
                , color: this.blobColor
                , lineWidth: 2
            })
        }

        // cross braces.
        if(this.showBraces) {
            this.points[0].pen.line(ctx, this.points[2], this.braceColor)
            this.points[1].pen.line(ctx, this.points[3], this.braceColor)
        }

        this.pinPoint.pen.fill(ctx, this.blobColor)

        this.showOuter && this.points.pen.line(ctx, {color: this.blobColor})
        this.showPoints && this.points.pen.fill(ctx, this.blobColor)
        this.showOuter && this.points[0].pen.line(ctx, this.points[3], this.blobColor)
    }
}

stage = MainStage.go(/*{ loop: true }*/)
