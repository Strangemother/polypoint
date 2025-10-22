/*
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
    ../point_src/setunset.js
    ../point_src/text/styler.js
    ../point_src/functions/springs.js
    ../point_src/functions/clamp.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/split.js
    ../point_src/rope.js
    fps
    ../point_src/collisionbox.js
    ../point_src/gravity.js
    ../point_src/constrain-distance.js
    ../point_src/random.js

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


const flutter = ()=>{
    stage.cable.visibleRopeGravity.y = -.05 + (random.float(-1, 1) * .1)
    setTimeout(flutter, random.float(2, 5))
};

// setTimeout(flutter, random.float(0.5, 2))


class Cable {

    defaults = {
            // gravity: .2

            gravity: {x:.0, y: .02}
            , visibleRopeGravity: {x:0, y:0.2}
            // gravity: undefined
            // , visibleRopeGravity: undefined
            , ropePointLength: 10
            , segmentLength: 10
            , invMass: .93
            , color: '#990000'
            , knotColor: '#225555'
            , ropeColor: '#AAA'
            , radius: 3
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

        this.points[0].copy(initPos.add(1,1))
        this.points2[0].copy(initPos.add(1,1))

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
        this.points2.pen.quadCurve(ctx, {color: this.ropeColor, lineWidth: 4});
        // this.points2.pen.line(ctx, {color:'#AAA'});

        // this.points[0].pen.indicator(ctx)
        this.points[0].pen.fill(ctx)

        // last.lookAt(penUlt)//, Math.PI *.5)
        // last.pen.indicator(ctx)

        // penUlt.pen.indicator(ctx)
        // last.pen.indicator(ctx, {color: '#770000'})
        // let penUlt = this.points[this.points.length - 3]
        // penUlt.pen.fill(ctx, this.knotColor)

        /* Render the real physics rope*/
        // this.points.pen.fill(ctx, this.knotColor)

        let last = this.points.last()
        last.pen.fill(ctx, {'color': this.color})
        // last.text.label(ctx, 'Polypoint')
    }

}



class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.cables =[]
        this.ring = new Point(this.center.copy())

        this.target = new Point(this.center.copy())
        this.target.radius = 100

        let folicles = this.folicles = this.ring.split(50)
        folicles.forEach(p=>{
            p.update({vx: 0, vy: 0, mass:5})
            this.addCable(p)
            p.relOrigin = this.target.distance2D(p)
        })

        // this.cable.visibleRopeGravity.y = -.05// + (random.float(-1, 1) * .1)

        // this.ring.radius = 20
        this.dragging.addPoints(this.target)
        // let gp = new Point(0, 3)
        // this.collisionBox = new CollisionBox(folicles)
        // this.gravityBox = new GravityReactor(gp, this.points)
        // this.gravityBox.points.push(this.pinpo)
    }

    addCable(knuckle) {

        let cable = new Cable()
        cable.handle.radius = 8
        cable.knuckle = knuckle
        cable.mounted(knuckle)
        this.dragging.addPoints(
                cable.head
                , knuckle
            )
        this.cables.push(cable)
    }

    draw(ctx){
        this.clear(ctx)
        // ctx.font = `500 20px lexend deca`;
        // this.collisionBox.shuffle()
        this.ring.xy = this.target.xy
        this.ring.radius = this.target.radius + 30
        this.ring.pen.circle(ctx, {color: '#999', width:1})
        this.target.pen.fill(ctx, {color: 'purple', width:1})
        // this.folicles.spring.loop(20, .025, .92, new Set([]), .4)
        this.drawRopes(ctx)
        this.stepRopes()
        this.fps.drawFPS(ctx)
    }

    stepRopes() {
        this.cables.forEach(c=>{
            let handle = c.knuckle

            c.handle.xy = handle
            let r2d =  handle.distance2D(this.target)
            let divisor = .001

            // c.visibleRopeGravity.x = r2d.x * divisor
            // c.visibleRopeGravity.y = r2d.y * divisor
            // c.gravity.x = r2d.x * divisor
            // c.gravity.y = r2d.y * divisor

            handle.xy = this.target.add(handle.relOrigin)
            handle.track(this.ring, this.ring.radius)
        })
    }

    drawRopes(ctx) {

        this.cables.forEach(c=>{
            c.knuckle.pen.circle(ctx, {color: '#999', width:2})
            c.draw(ctx)
        })

        // this.cable.head.text.label(ctx, "It's a Polypoint!", {x:10, y:0})
    }
}

stage = MainStage.go(/*{ loop: true }*/)
